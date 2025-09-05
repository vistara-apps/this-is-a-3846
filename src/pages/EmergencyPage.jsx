import React, { useState } from 'react'
import { useUser } from '../context/UserContext'
import EmergencyButton from '../components/EmergencyButton'
import { Plus, Phone, Trash2, Edit3 } from 'lucide-react'

const EmergencyPage = () => {
  const { user, setUser } = useUser()
  const [showAddContact, setShowAddContact] = useState(false)
  const [newContact, setNewContact] = useState({ name: '', phone: '' })

  const addEmergencyContact = () => {
    if (newContact.name && newContact.phone) {
      setUser(prev => ({
        ...prev,
        emergencyContacts: [...prev.emergencyContacts, { ...newContact, id: Date.now() }]
      }))
      setNewContact({ name: '', phone: '' })
      setShowAddContact(false)
    }
  }

  const removeContact = (contactId) => {
    setUser(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter(contact => contact.id !== contactId)
    }))
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-8">
      <h1 className="text-3xl font-bold text-text mb-8 text-center">
        Emergency Tools
      </h1>

      <div className="max-w-md mx-auto space-y-8">
        {/* Emergency Record Button */}
        <div className="bg-surface rounded-lg shadow-card p-8">
          <EmergencyButton />
        </div>

        {/* Emergency Contacts */}
        <div className="bg-surface rounded-lg shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text">Emergency Contacts</h2>
            <button
              onClick={() => setShowAddContact(true)}
              className="bg-primary hover:bg-blue-600 text-white p-2 rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {user.emergencyContacts.length === 0 ? (
            <p className="text-zinc-500 text-center py-4">
              No emergency contacts added yet. Add contacts to receive automatic alerts.
            </p>
          ) : (
            <div className="space-y-3">
              {user.emergencyContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-text">{contact.name}</p>
                      <p className="text-sm text-zinc-500">{contact.phone}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeContact(contact.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {showAddContact && (
            <div className="mt-6 p-4 border border-gray-200 rounded-md">
              <h3 className="font-medium text-text mb-3">Add Emergency Contact</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Contact name"
                  value={newContact.name}
                  onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={newContact.phone}
                  onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={addEmergencyContact}
                    className="flex-1 bg-primary hover:bg-blue-600 text-white py-2 rounded-md transition-colors"
                  >
                    Add Contact
                  </button>
                  <button
                    onClick={() => {
                      setShowAddContact(false)
                      setNewContact({ name: '', phone: '' })
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-800 mb-3">How It Works</h3>
          <ul className="text-yellow-700 space-y-2 text-sm">
            <li>• Tap the emergency button to start recording audio</li>
            <li>• Your emergency contacts will automatically receive an SMS alert with your location</li>
            <li>• Keep recording until the situation is resolved</li>
            <li>• Recordings are stored securely for your protection</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default EmergencyPage