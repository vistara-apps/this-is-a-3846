import React, { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { supabaseService } from '../services/supabase.js'
import { emergencyService } from '../services/emergency.js'
import { legalContentService } from '../services/legalContent.js'
import { stripeService } from '../services/stripe.js'
import { US_STATES } from '../config/api.js'

const UserContext = createContext()

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    userId: null,
    email: '',
    subscriptionTier: 'free',
    preferredLanguage: 'en',
    emergencyContacts: [],
    selectedState: null,
    location: null,
    subscription: null
  })

  const [isRecording, setIsRecording] = useState(false)
  const [recordingStream, setRecordingStream] = useState(null)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [permissions, setPermissions] = useState({
    location: false,
    microphone: false,
    camera: false,
    notifications: false
  })

  // Initialize user data
  useEffect(() => {
    initializeUser()
    requestInitialPermissions()
  }, [])

  const initializeUser = async () => {
    try {
      // Try to get location and determine state
      await updateUserLocation()
      
      // Load user data from localStorage if available
      const savedUser = localStorage.getItem('knowyourrights_user')
      if (savedUser) {
        const userData = JSON.parse(savedUser)
        setUser(prev => ({ ...prev, ...userData }))
        
        // Load subscription status if user exists
        if (userData.userId) {
          await loadSubscriptionStatus(userData.userId)
        }
      }
    } catch (error) {
      console.error('Error initializing user:', error)
    }
  }

  const requestInitialPermissions = async () => {
    try {
      const perms = await emergencyService.requestPermissions()
      setPermissions(perms)
    } catch (error) {
      console.error('Error requesting permissions:', error)
    }
  }

  // Get user's location
  const getCurrentLocation = () => {
    return emergencyService.getCurrentLocation()
  }

  // Update user location and determine state
  const updateUserLocation = async () => {
    try {
      const location = await getCurrentLocation()
      const state = await legalContentService.getStateFromCoordinates(
        location.latitude, 
        location.longitude
      )
      
      setUser(prev => ({
        ...prev,
        location,
        selectedState: state
      }))

      toast.success(`Location detected: ${state}`)
      return { location, state }
    } catch (error) {
      console.log('Location access denied or unavailable')
      // Set default state if location unavailable
      if (!user.selectedState) {
        setUser(prev => ({ ...prev, selectedState: 'California' }))
      }
      return null
    }
  }

  // Update selected state
  const updateUserState = async (newState) => {
    setUser(prev => ({ ...prev, selectedState: newState }))
    
    // Save to localStorage
    const updatedUser = { ...user, selectedState: newState }
    localStorage.setItem('knowyourrights_user', JSON.stringify(updatedUser))
    
    // Track usage
    if (user.userId) {
      await supabaseService.trackUsage(user.userId, 'state_changed', { 
        newState, 
        previousState: user.selectedState 
      })
    }
  }

  // Update emergency contacts
  const updateEmergencyContacts = async (contacts) => {
    try {
      // Validate contacts
      const validatedContacts = contacts.map(contact => {
        const validation = emergencyService.validateEmergencyContact(contact)
        if (!validation.isValid) {
          throw new Error(`Invalid contact: ${validation.errors.join(', ')}`)
        }
        return {
          ...contact,
          phone: emergencyService.formatPhoneNumber(contact.phone)
        }
      })

      setUser(prev => ({ ...prev, emergencyContacts: validatedContacts }))
      
      // Save to database if user exists
      if (user.userId) {
        await supabaseService.updateUser(user.userId, {
          emergency_contacts: validatedContacts
        })
      }
      
      // Save to localStorage
      const updatedUser = { ...user, emergencyContacts: validatedContacts }
      localStorage.setItem('knowyourrights_user', JSON.stringify(updatedUser))
      
      toast.success('Emergency contacts updated')
      return { success: true }
    } catch (error) {
      console.error('Error updating emergency contacts:', error)
      toast.error(error.message)
      return { success: false, error: error.message }
    }
  }

  // Start emergency recording
  const startEmergencyRecording = async () => {
    try {
      setLoading(true)
      
      // Check subscription limits
      const limits = stripeService.getFeatureLimits(user.subscriptionTier)
      if (limits.recordingDuration === 0) {
        toast.error('Recording requires a paid subscription')
        return { success: false, error: 'Subscription required' }
      }

      const result = await emergencyService.startRecording({
        audio: true,
        video: false,
        maxDuration: limits.recordingDuration * 1000, // Convert to milliseconds
        userId: user.userId,
        location: user.location
      })

      if (result.success) {
        setIsRecording(true)
        setRecordingStream(result.stream)
        setMediaRecorder(result.mediaRecorder)
        
        // Send emergency alerts if contacts exist
        if (user.emergencyContacts.length > 0) {
          await sendEmergencyAlert()
        }
        
        toast.success('Emergency recording started')
        return result
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error(`Failed to start recording: ${error.message}`)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Stop emergency recording
  const stopEmergencyRecording = async () => {
    try {
      const result = await emergencyService.stopRecording(mediaRecorder, recordingStream)
      
      if (result.success) {
        setIsRecording(false)
        setRecordingStream(null)
        setMediaRecorder(null)
        toast.success('Recording stopped and saved')
      }
      
      return result
    } catch (error) {
      console.error('Error stopping recording:', error)
      toast.error('Failed to stop recording')
      return { success: false, error: error.message }
    }
  }

  // Send emergency alert
  const sendEmergencyAlert = async (customMessage = '') => {
    try {
      if (user.emergencyContacts.length === 0) {
        toast.error('No emergency contacts configured')
        return { success: false, error: 'No contacts' }
      }

      // Check subscription limits
      if (!stripeService.hasFeatureAccess(user.subscriptionTier, 'sms_alerts')) {
        toast.error('SMS alerts require Premium subscription')
        return { success: false, error: 'Subscription required' }
      }

      const result = await emergencyService.sendEmergencyAlert({
        userId: user.userId,
        emergencyContacts: user.emergencyContacts,
        location: user.location,
        message: customMessage
      })

      if (result.success) {
        toast.success(`Alert sent to ${result.successCount} contacts`)
      } else {
        toast.error('Failed to send emergency alerts')
      }

      return result
    } catch (error) {
      console.error('Error sending emergency alert:', error)
      toast.error('Failed to send emergency alert')
      return { success: false, error: error.message }
    }
  }

  // Load subscription status
  const loadSubscriptionStatus = async (userId) => {
    try {
      const result = await stripeService.getSubscriptionStatus(userId)
      if (result.success) {
        setUser(prev => ({ 
          ...prev, 
          subscription: result.subscription,
          subscriptionTier: result.subscription.plan?.id?.includes('premium') ? 'premium' :
                           result.subscription.plan?.id?.includes('basic') ? 'basic' : 'free'
        }))
      }
    } catch (error) {
      console.error('Error loading subscription:', error)
    }
  }

  // Update user language preference
  const updateLanguage = async (language) => {
    setUser(prev => ({ ...prev, preferredLanguage: language }))
    
    // Save to database and localStorage
    if (user.userId) {
      await supabaseService.updateUser(user.userId, { preferred_language: language })
    }
    
    const updatedUser = { ...user, preferredLanguage: language }
    localStorage.setItem('knowyourrights_user', JSON.stringify(updatedUser))
    
    toast.success(`Language updated to ${language === 'es' ? 'Spanish' : 'English'}`)
  }

  // Check feature access
  const hasFeatureAccess = (feature) => {
    return stripeService.hasFeatureAccess(user.subscriptionTier, feature)
  }

  // Get feature limits
  const getFeatureLimits = () => {
    return stripeService.getFeatureLimits(user.subscriptionTier)
  }

  const value = {
    // User state
    user,
    setUser,
    loading,
    permissions,
    
    // Location and state
    updateUserState,
    updateUserLocation,
    getCurrentLocation,
    
    // Emergency features
    isRecording,
    startEmergencyRecording,
    stopEmergencyRecording,
    sendEmergencyAlert,
    updateEmergencyContacts,
    
    // Subscription and features
    hasFeatureAccess,
    getFeatureLimits,
    loadSubscriptionStatus,
    
    // Settings
    updateLanguage,
    
    // Legacy support
    setIsRecording,
    recordingStream,
    setRecordingStream
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}
