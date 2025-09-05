import { API_CONFIG } from '../config/api.js'
import { supabaseService } from './supabase.js'
import axios from 'axios'

export const emergencyService = {
  // Start audio/video recording
  async startRecording(options = {}) {
    const {
      audio = true,
      video = false,
      maxDuration = 300000, // 5 minutes default
      userId,
      location
    } = options

    try {
      // Request media permissions
      const constraints = {
        audio: audio,
        video: video ? { facingMode: 'environment' } : false
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      const recordedChunks = []
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunks, {
          type: 'audio/webm'
        })

        // Upload recording to storage
        if (userId) {
          const recordingId = `recording_${Date.now()}`
          const uploadResult = await supabaseService.uploadRecording(blob, userId, recordingId)
          
          if (uploadResult.success) {
            // Save recording metadata to database
            await supabaseService.saveRecording(userId, {
              timestamp: new Date().toISOString(),
              location,
              url: uploadResult.url,
              duration: Date.now() - startTime,
              fileSize: blob.size,
              alertSent: false
            })
          }
        }

        // Clean up stream
        stream.getTracks().forEach(track => track.stop())
      }

      // Start recording
      const startTime = Date.now()
      mediaRecorder.start(1000) // Collect data every second

      // Auto-stop after max duration
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop()
        }
      }, maxDuration)

      return {
        success: true,
        mediaRecorder,
        stream,
        startTime
      }
    } catch (error) {
      console.error('Error starting recording:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Stop recording
  async stopRecording(mediaRecorder, stream) {
    try {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop()
      }
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }

      return { success: true }
    } catch (error) {
      console.error('Error stopping recording:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Send emergency SMS alerts
  async sendEmergencyAlert(alertData) {
    const {
      userId,
      emergencyContacts,
      location,
      message,
      recordingUrl
    } = alertData

    try {
      const defaultMessage = `EMERGENCY ALERT: I am currently in a police interaction. My location is approximately ${location?.latitude}, ${location?.longitude}. This is an automated message from KnowYourRights.cards.`
      
      const finalMessage = message || defaultMessage
      
      // Add recording URL if available
      const fullMessage = recordingUrl 
        ? `${finalMessage}\n\nRecording: ${recordingUrl}`
        : finalMessage

      // Send SMS to each emergency contact
      const alertPromises = emergencyContacts.map(contact => 
        this.sendSMS(contact.phone, fullMessage)
      )

      const results = await Promise.allSettled(alertPromises)
      
      // Count successful sends
      const successCount = results.filter(result => 
        result.status === 'fulfilled' && result.value.success
      ).length

      // Track usage
      if (userId) {
        await supabaseService.trackUsage(userId, 'emergency_alert_sent', {
          contactsCount: emergencyContacts.length,
          successCount,
          location
        })
      }

      return {
        success: successCount > 0,
        successCount,
        totalContacts: emergencyContacts.length,
        results
      }
    } catch (error) {
      console.error('Error sending emergency alert:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Send individual SMS
  async sendSMS(phoneNumber, message) {
    try {
      // In production, this would call your backend API which uses Twilio
      const response = await axios.post(API_CONFIG.TWILIO_WEBHOOK_URL, {
        to: phoneNumber,
        message: message
      })

      return {
        success: true,
        messageId: response.data.messageId
      }
    } catch (error) {
      console.error('Error sending SMS:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Get current location with high accuracy
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'))
        return
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          })
        },
        (error) => {
          reject(error)
        },
        options
      )
    })
  },

  // Format location for emergency message
  formatLocationForMessage(location) {
    if (!location) return 'Location unavailable'
    
    return `Lat: ${location.latitude.toFixed(6)}, Lng: ${location.longitude.toFixed(6)}`
  },

  // Check if emergency features are available
  checkEmergencyCapabilities() {
    const capabilities = {
      geolocation: 'geolocation' in navigator,
      mediaRecorder: 'MediaRecorder' in window,
      getUserMedia: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      notifications: 'Notification' in window
    }

    return {
      ...capabilities,
      allSupported: Object.values(capabilities).every(Boolean)
    }
  },

  // Request necessary permissions
  async requestPermissions() {
    const permissions = {
      location: false,
      microphone: false,
      camera: false,
      notifications: false
    }

    try {
      // Request location permission
      try {
        await this.getCurrentLocation()
        permissions.location = true
      } catch (error) {
        console.log('Location permission denied')
      }

      // Request microphone permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach(track => track.stop())
        permissions.microphone = true
      } catch (error) {
        console.log('Microphone permission denied')
      }

      // Request camera permission (optional)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        stream.getTracks().forEach(track => track.stop())
        permissions.camera = true
      } catch (error) {
        console.log('Camera permission denied')
      }

      // Request notification permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission()
        permissions.notifications = permission === 'granted'
      }

      return permissions
    } catch (error) {
      console.error('Error requesting permissions:', error)
      return permissions
    }
  },

  // Show browser notification
  showNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        ...options
      })
    }
    return null
  },

  // Emergency contact validation
  validateEmergencyContact(contact) {
    const errors = []

    if (!contact.name || contact.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters')
    }

    if (!contact.phone || !this.isValidPhoneNumber(contact.phone)) {
      errors.push('Valid phone number is required')
    }

    if (contact.relationship && contact.relationship.trim().length < 2) {
      errors.push('Relationship must be at least 2 characters')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  },

  // Phone number validation (basic)
  isValidPhoneNumber(phone) {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  },

  // Format phone number for display
  formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '')
    
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    } else if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
    }
    
    return phone
  }
}

// Mock SMS service for development
export const mockSMSService = {
  async sendSMS(phoneNumber, message) {
    console.log(`Mock SMS to ${phoneNumber}:`, message)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simulate occasional failures
    if (Math.random() < 0.1) {
      throw new Error('SMS delivery failed')
    }
    
    return {
      success: true,
      messageId: `mock_msg_${Date.now()}`
    }
  }
}

export default emergencyService
