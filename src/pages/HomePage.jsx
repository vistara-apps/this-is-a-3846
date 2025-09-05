import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Shield, MapPin, AlertTriangle, Book } from 'lucide-react'
import { useUser } from '../context/UserContext'
import StateCard from '../components/StateCard'

const HomePage = () => {
  const { user, updateUserState } = useUser()

  const states = [
    'California', 'New York', 'Texas', 'Florida', 'Illinois', 'Pennsylvania'
  ]

  const features = [
    {
      icon: <Book className="w-6 h-6" />,
      title: 'State-Specific Rights',
      description: 'Get accurate legal information tailored to your state laws'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Actionable Scripts',
      description: 'Pre-written phrases to help you communicate your rights clearly'
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: 'Emergency Features',
      description: 'One-tap recording and automatic alerts to your emergency contacts'
    }
  ]

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-text mb-4">
          Know Your Rights
        </h1>
        <p className="text-xl text-zinc-600 mb-8 max-w-2xl mx-auto">
          Instant legal clarity in your pocket during police interactions. 
          Get state-specific rights information and emergency tools when you need them most.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/guides"
            className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <span>View Rights Guide</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/emergency"
            className="bg-accent hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <AlertTriangle className="w-5 h-5" />
            <span>Emergency Tools</span>
          </Link>
        </div>
      </div>

      {/* State Selection */}
      {!user.selectedState && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-text mb-6 text-center">
            Select Your State
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {states.map((state) => (
              <StateCard
                key={state}
                state={state}
                variant="compact"
                onClick={() => updateUserState(state)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Current State Display */}
      {user.selectedState && (
        <div className="mb-12 text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium">
              Showing rights for {user.selectedState}
            </span>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {features.map((feature, index) => (
          <div key={index} className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-primary">
                {feature.icon}
              </div>
            </div>
            <h3 className="text-xl font-semibold text-text mb-2">
              {feature.title}
            </h3>
            <p className="text-zinc-600">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-8 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">
          Stay Protected & Informed
        </h2>
        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
          Get unlimited access to all state guides, advanced emergency features, 
          and keep your legal knowledge up to date.
        </p>
        <Link
          to="/subscription"
          className="bg-white text-primary px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
        >
          <span>View Subscription Plans</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  )
}

export default HomePage