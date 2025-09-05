import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
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
      </div>
    </UserProvider>
  )
}

export default App