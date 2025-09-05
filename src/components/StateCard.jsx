import React from 'react'
import { MapPin, ExternalLink } from 'lucide-react'

const StateCard = ({ state, variant = 'default', onClick, isSelected = false }) => {
  const isCompact = variant === 'compact'

  return (
    <div 
      className={`
        bg-surface rounded-lg shadow-card border-2 transition-all cursor-pointer
        ${isSelected ? 'border-primary bg-blue-50' : 'border-transparent hover:border-gray-200'}
        ${isCompact ? 'p-4' : 'p-6'}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-text">{state}</h3>
            {!isCompact && (
              <p className="text-sm text-zinc-500">View state-specific rights</p>
            )}
          </div>
        </div>
        {!isCompact && (
          <ExternalLink className="w-5 h-5 text-zinc-400" />
        )}
      </div>
    </div>
  )
}

export default StateCard