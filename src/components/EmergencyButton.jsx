import React, { useState, useEffect } from 'react'
import { AlertTriangle, Mic, MicOff, Phone, StopCircle } from 'lucide-react'
import { useUser } from '../context/UserContext'

const EmergencyButton = ({ variant = 'inactive' }) => {
  const { isRecording, setIsRecording, recordingStream, setRecordingStream, getCurrentLocation } = useUser()
  const [recordingTime, setRecordingTime] = useState(0)
  const [alertSent, setAlertSent] = useState(false)

  useEffect(() => {
    let interval = null
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(time => time + 1)
      }, 1000)
    } else {
      clearInterval(interval)
      setRecordingTime(0)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startRecording = async () => {
    try {
      // Request permissions
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: false 
      })
      
      setRecordingStream(stream)
      setIsRecording(true)
      
      // Send emergency alert
      await sendEmergencyAlert()
      setAlertSent(true)
      
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Unable to access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (recordingStream) {
      recordingStream.getTracks().forEach(track => track.stop())
      setRecordingStream(null)
    }
    setIsRecording(false)
    setAlertSent(false)
  }

  const sendEmergencyAlert = async () => {
    try {
      const location = await getCurrentLocation()
      // In a real app, this would send SMS via Twilio
      console.log('Emergency alert sent with location:', location)
      
      // Simulate alert sending
      const alertMessage = `EMERGENCY: I need assistance. Location: ${location.latitude}, ${location.longitude}. Timestamp: ${new Date().toISOString()}`
      console.log('Alert message:', alertMessage)
      
    } catch (error) {
      console.error('Error sending emergency alert:', error)
    }
  }

  if (isRecording) {
    return (
      <div className="text-center space-y-4">
        <div className="w-32 h-32 mx-auto bg-red-500 rounded-full flex items-center justify-center animate-pulse-slow">
          <Mic className="w-12 h-12 text-white" />
        </div>
        <div className="space-y-2">
          <p className="text-lg font-semibold text-red-600">Recording Active</p>
          <p className="text-2xl font-mono text-red-600">{formatTime(recordingTime)}</p>
          {alertSent && (
            <p className="text-sm text-accent">✓ Emergency contacts notified</p>
          )}
        </div>
        <button
          onClick={stopRecording}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
        >
          <StopCircle className="w-5 h-5" />
          <span>Stop Recording</span>
        </button>
      </div>
    )
  }

  return (
    <div className="text-center space-y-4">
      <button
        onClick={startRecording}
        className="w-32 h-32 mx-auto bg-accent hover:bg-green-600 rounded-full flex items-center justify-center transition-colors shadow-lg"
      >
        <AlertTriangle className="w-12 h-12 text-white" />
      </button>
      <div className="space-y-2">
        <p className="text-lg font-semibold text-text">Emergency Record & Alert</p>
        <p className="text-sm text-zinc-500 max-w-xs mx-auto">
          Tap to start recording and automatically notify your emergency contacts
        </p>
      </div>
    </div>
  )
}

export default EmergencyButton