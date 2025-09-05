import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, Settings, MapPin } from 'lucide-react'
import { useUser } from '../context/UserContext'

const AppHeader = () => {
  const location = useLocation()
  const { user } = useUser()

  const isActive = (path) => location.pathname === path

  return (
    <header className="bg-surface shadow-card sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">KYR</span>
            </div>
            <span className="font-semibold text-lg text-text hidden sm:block">
              KnowYourRights.cards
            </span>
          </Link>

          {user.selectedState && (
            <div className="flex items-center text-sm text-zinc-500">
              <MapPin className="w-4 h-4 mr-1" />
              {user.selectedState}
            </div>
          )}

          <nav className="flex items-center space-x-1">
            <Link
              to="/guides"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/guides')
                  ? 'bg-primary text-white'
                  : 'text-text hover:bg-gray-100'
              }`}
            >
              Guides
            </Link>
            <Link
              to="/emergency"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/emergency')
                  ? 'bg-accent text-white'
                  : 'text-text hover:bg-gray-100'
              }`}
            >
              Emergency
            </Link>
            <Link
              to="/subscription"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/subscription')
                  ? 'bg-primary text-white'
                  : 'text-text hover:bg-gray-100'
              }`}
            >
              <Settings className="w-4 h-4" />
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default AppHeader