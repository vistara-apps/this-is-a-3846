import React, { useState } from 'react'
import { useUser } from '../context/UserContext'
import ScriptEditor from '../components/ScriptEditor'
import LanguageSelector from '../components/LanguageSelector'
import StateCard from '../components/StateCard'
import { Car, Home, User, AlertCircle } from 'lucide-react'

const GuidesPage = () => {
  const { user, updateUserState } = useUser()
  const [selectedScenario, setSelectedScenario] = useState('traffic-stop')

  const states = [
    'California', 'New York', 'Texas', 'Florida', 'Illinois', 'Pennsylvania'
  ]

  const scenarios = [
    {
      id: 'traffic-stop',
      title: 'Traffic Stop',
      icon: <Car className="w-5 h-5" />,
      description: 'Your rights during a vehicle stop'
    },
    {
      id: 'home-search',
      title: 'Home Search',
      icon: <Home className="w-5 h-5" />,
      description: 'Police at your door or searching your home'
    },
    {
      id: 'street-encounter',
      title: 'Street Encounter',
      icon: <User className="w-5 h-5" />,
      description: 'Being questioned or detained in public'
    },
    {
      id: 'arrest',
      title: 'Arrest',
      icon: <AlertCircle className="w-5 h-5" />,
      description: 'Your rights when being arrested'
    }
  ]

  const getRightsContent = (scenario, state) => {
    // In a real app, this would come from an API/database
    const content = {
      'traffic-stop': {
        rights: `In ${state}, during a traffic stop you have the right to:

• Remain silent beyond providing license, registration, and insurance
• Refuse consent to search your vehicle
• Ask if you are free to leave
• Record the interaction (if safe to do so)
• Request a supervisor if needed

You should NOT:
• Exit the vehicle unless asked
• Reach for items without permission
• Argue with the officer
• Consent to searches
• Answer questions about where you're going or coming from`,
        
        script: `"Officer, I'm exercising my right to remain silent. I do not consent to any searches. Am I free to leave?"

If asked to exit the vehicle: "I will comply, but I do not consent to any searches of my person or vehicle."

If asked about your destination: "I prefer to exercise my right to remain silent."

Remember: Keep your hands visible, move slowly, and stay calm.`
      },
      'home-search': {
        rights: `In ${state}, when police come to your home you have the right to:

• Not answer the door
• Speak through the door without opening it
• Ask to see a warrant before allowing entry
• Refuse consent for a search without a warrant
• Record the interaction
• Remain silent

You should NOT:
• Open the door unless you choose to
• Allow entry without a warrant
• Consent to searches
• Let them "look around"
• Answer questions about who lives there`,
        
        script: `"I do not consent to your entry. Do you have a warrant?"

If they say they have a warrant: "Please slide the warrant under the door so I can read it."

If no warrant: "I do not consent to any search or entry. I'm exercising my right to remain silent."

If they ask questions: "I prefer not to answer questions without my attorney present."`
      },
      'street-encounter': {
        rights: `In ${state}, during a street encounter you have the right to:

• Ask if you are free to leave
• Remain silent
• Refuse consent to searches
• Not show ID unless lawfully detained
• Record the interaction
• Walk away if not detained

You should NOT:
• Run away
• Resist physically
• Lie or provide false information
• Consent to searches
• Answer questions about your activities`,
        
        script: `"Am I free to leave?"

If yes: Walk away calmly.

If no: "I understand I'm being detained. I'm exercising my right to remain silent. I do not consent to any searches."

If asked for ID: "Am I required to show ID?" (Know your state's stop-and-identify laws)

Remember: You can record, but keep your phone visible and don't interfere.`
      },
      'arrest': {
        rights: `In ${state}, if you are being arrested you have the right to:

• Remain silent (Miranda rights)
• An attorney
• Make a phone call
• Medical attention if injured
• Know the charges against you
• Refuse consent to searches

You should NOT:
• Resist arrest physically
• Argue with officers
• Sign anything except a citation
• Answer questions without an attorney
• Consent to searches`,
        
        script: `"I'm exercising my right to remain silent. I want to speak to an attorney."

Repeat this consistently: "I want an attorney present during any questioning."

For searches: "I do not consent to any searches."

Remember: Even if arrested wrongfully, do not resist. Address it in court with your attorney.`
      }
    }

    return content[scenario] || content['traffic-stop']
  }

  const currentContent = getRightsContent(selectedScenario, user.selectedState || 'your state')

  if (!user.selectedState) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-3xl font-bold text-text mb-8 text-center">
          Select Your State First
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {states.map((state) => (
            <StateCard
              key={state}
              state={state}
              onClick={() => updateUserState(state)}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-3xl font-bold text-text mb-4 sm:mb-0">
          Rights Guide - {user.selectedState}
        </h1>
        <LanguageSelector />
      </div>

      {/* Scenario Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => setSelectedScenario(scenario.id)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selectedScenario === scenario.id
                ? 'border-primary bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-surface'
            }`}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className={`${
                selectedScenario === scenario.id ? 'text-primary' : 'text-zinc-500'
              }`}>
                {scenario.icon}
              </div>
              <h3 className="font-medium text-text">{scenario.title}</h3>
            </div>
            <p className="text-sm text-zinc-500">{scenario.description}</p>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rights Information */}
        <div className="bg-surface rounded-lg shadow-card p-6">
          <h2 className="text-xl font-semibold text-text mb-4 flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
              {scenarios.find(s => s.id === selectedScenario)?.icon}
            </div>
            <span>Your Rights</span>
          </h2>
          <div className="prose prose-sm max-w-none">
            <pre className="text-text leading-relaxed whitespace-pre-wrap font-sans">
              {currentContent.rights}
            </pre>
          </div>
        </div>

        {/* Scripts */}
        <ScriptEditor
          script={{
            title: 'Recommended Script',
            content: currentContent.script
          }}
          variant="editable"
        />
      </div>

      {/* Change State */}
      <div className="mt-12 text-center">
        <button
          onClick={() => updateUserState(null)}
          className="text-primary hover:text-blue-600 font-medium"
        >
          Change State
        </button>
      </div>
    </div>
  )
}

export default GuidesPage