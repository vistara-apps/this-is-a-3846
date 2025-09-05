import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AppHeader from './components/AppHeader'
import HomePage from './pages/HomePage'
import GuidesPage from './pages/GuidesPage'
import EmergencyPage from './pages/EmergencyPage'
import SubscriptionPage from './pages/SubscriptionPage'
import { UserProvider } from './context/UserContext'

function App() {
  return (
    <UserProvider>
      <div className="min-h-screen bg-bg">
        <AppHeader />
        <main className="pb-20">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/guides" element={<GuidesPage />} />
            <Route path="/emergency" element={<EmergencyPage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
          </Routes>
        </main>
        
        {/* Toast notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </UserProvider>
  )
}

export default App
