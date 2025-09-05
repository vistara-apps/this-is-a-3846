import React, { createContext, useContext, useState, useEffect } from 'react'

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
    location: null
  })

  const [isRecording, setIsRecording] = useState(false)
  const [recordingStream, setRecordingStream] = useState(null)

  // Get user's location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          reject(error)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      )
    })
  }

  // Detect state from coordinates (simplified)
  const getStateFromCoords = async (lat, lng) => {
    // In a real app, you'd use a geocoding API
    // For demo purposes, returning California
    return 'California'
  }

  const updateUserState = (newState) => {
    setUser(prev => ({ ...prev, selectedState: newState }))
  }

  const updateUserLocation = async () => {
    try {
      const location = await getCurrentLocation()
      const state = await getStateFromCoords(location.latitude, location.longitude)
      setUser(prev => ({
        ...prev,
        location,
        selectedState: state
      }))
    } catch (error) {
      console.log('Location access denied or unavailable')
    }
  }

  useEffect(() => {
    updateUserLocation()
  }, [])

  const value = {
    user,
    setUser,
    updateUserState,
    updateUserLocation,
    isRecording,
    setIsRecording,
    recordingStream,
    setRecordingStream,
    getCurrentLocation
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}