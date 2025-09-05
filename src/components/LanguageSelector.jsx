import React from 'react'
import { Globe } from 'lucide-react'
import { useUser } from '../context/UserContext'

const LanguageSelector = ({ variant = 'default' }) => {
  const { user, setUser } = useUser()

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ]

  const handleLanguageChange = (languageCode) => {
    setUser(prev => ({ ...prev, preferredLanguage: languageCode }))
  }

  return (
    <div className="flex items-center space-x-2">
      <Globe className="w-4 h-4 text-zinc-500" />
      <select
        value={user.preferredLanguage}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="bg-surface border border-gray-200 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default LanguageSelector