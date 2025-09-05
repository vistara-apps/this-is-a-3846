import { openaiService, FALLBACK_CONTENT } from './openai.js'
import { supabaseService } from './supabase.js'

// Comprehensive legal content service
export const legalContentService = {
  // Get state-specific rights information
  async getStateRights(state, scenario = 'traffic-stop', language = 'en') {
    try {
      // First try to get from database
      const dbResult = await supabaseService.getStateLaws(state, language)
      
      if (dbResult.success && dbResult.data) {
        return {
          success: true,
          data: dbResult.data,
          source: 'database'
        }
      }

      // Fallback to AI generation
      const aiResult = await openaiService.generateRightsSummary(state, scenario, language)
      
      if (aiResult.success) {
        return {
          success: true,
          data: {
            state,
            rights_summary: aiResult.summary,
            language,
            scenario
          },
          source: 'ai'
        }
      }

      // Final fallback to static content
      const fallbackData = this.getFallbackContent(state, scenario, language)
      return {
        success: true,
        data: fallbackData,
        source: 'fallback'
      }
    } catch (error) {
      console.error('Error getting state rights:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Get actionable scripts for specific scenarios
  async getActionableScripts(state, scenario, language = 'en', customization = '') {
    try {
      // Try AI generation first for customized scripts
      const aiResult = await openaiService.generateScript({
        scenario,
        state,
        language,
        customization
      })

      if (aiResult.success) {
        return {
          success: true,
          scripts: this.parseScriptContent(aiResult.script),
          source: 'ai'
        }
      }

      // Fallback to predefined scripts
      const fallbackScripts = this.getFallbackScripts(state, scenario, language)
      return {
        success: true,
        scripts: fallbackScripts,
        source: 'fallback'
      }
    } catch (error) {
      console.error('Error getting scripts:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Parse AI-generated script content into structured format
  parseScriptContent(scriptText) {
    const sections = {
      keyRights: [],
      whatToSay: [],
      whatNotToSay: [],
      deEscalationTips: []
    }

    const lines = scriptText.split('\n').filter(line => line.trim())
    let currentSection = null

    for (const line of lines) {
      const trimmed = line.trim()
      
      if (trimmed.toLowerCase().includes('key rights') || trimmed.toLowerCase().includes('rights')) {
        currentSection = 'keyRights'
        continue
      } else if (trimmed.toLowerCase().includes('what to say') || trimmed.toLowerCase().includes('say')) {
        currentSection = 'whatToSay'
        continue
      } else if (trimmed.toLowerCase().includes('what not to say') || trimmed.toLowerCase().includes('not to say')) {
        currentSection = 'whatNotToSay'
        continue
      } else if (trimmed.toLowerCase().includes('de-escalation') || trimmed.toLowerCase().includes('tips')) {
        currentSection = 'deEscalationTips'
        continue
      }

      if (currentSection && (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*'))) {
        sections[currentSection].push(trimmed.replace(/^[•\-*]\s*/, ''))
      } else if (currentSection && trimmed.length > 10) {
        sections[currentSection].push(trimmed)
      }
    }

    return sections
  },

  // Get fallback content when AI is unavailable
  getFallbackContent(state, scenario, language) {
    const stateContent = COMPREHENSIVE_LEGAL_DATA[state] || COMPREHENSIVE_LEGAL_DATA['Default']
    const scenarioContent = stateContent[scenario] || stateContent['traffic-stop']
    
    if (language === 'es' && scenarioContent.spanish) {
      return {
        state,
        rights_summary: scenarioContent.spanish.rights,
        script_prompts: scenarioContent.spanish.scripts,
        dont_say_list: scenarioContent.spanish.dontSay,
        language: 'es'
      }
    }

    return {
      state,
      rights_summary: scenarioContent.rights,
      script_prompts: scenarioContent.scripts,
      dont_say_list: scenarioContent.dontSay,
      language: 'en'
    }
  },

  // Get fallback scripts
  getFallbackScripts(state, scenario, language) {
    const content = this.getFallbackContent(state, scenario, language)
    
    return {
      keyRights: content.rights_summary.split('\n').filter(line => line.trim()),
      whatToSay: Object.values(content.script_prompts || {}),
      whatNotToSay: content.dont_say_list || [],
      deEscalationTips: [
        'Remain calm and speak clearly',
        'Keep your hands visible',
        'Follow lawful orders',
        'Do not argue or resist',
        'Ask for clarification if unsure'
      ]
    }
  },

  // Translate content to Spanish
  async translateToSpanish(content) {
    try {
      const result = await openaiService.translateContent(content, 'es')
      return result.success ? result.translation : content
    } catch (error) {
      console.error('Translation failed:', error)
      return content
    }
  },

  // Get location-aware content
  async getLocationAwareContent(latitude, longitude) {
    try {
      const state = await this.getStateFromCoordinates(latitude, longitude)
      
      if (state) {
        const content = await this.getStateRights(state)
        return {
          success: true,
          state,
          content: content.data
        }
      }

      return {
        success: false,
        error: 'Could not determine state from coordinates'
      }
    } catch (error) {
      console.error('Error getting location-aware content:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Reverse geocoding to get state from coordinates
  async getStateFromCoordinates(lat, lng) {
    try {
      // In production, use a proper geocoding service
      // For now, using a simple approximation
      const stateMapping = {
        'California': { minLat: 32.5, maxLat: 42.0, minLng: -124.4, maxLng: -114.1 },
        'New York': { minLat: 40.5, maxLat: 45.0, minLng: -79.8, maxLng: -71.9 },
        'Texas': { minLat: 25.8, maxLat: 36.5, minLng: -106.6, maxLng: -93.5 },
        'Florida': { minLat: 24.4, maxLat: 31.0, minLng: -87.6, maxLng: -80.0 }
      }

      for (const [state, bounds] of Object.entries(stateMapping)) {
        if (lat >= bounds.minLat && lat <= bounds.maxLat && 
            lng >= bounds.minLng && lng <= bounds.maxLng) {
          return state
        }
      }

      return 'California' // Default fallback
    } catch (error) {
      console.error('Error in reverse geocoding:', error)
      return 'California'
    }
  }
}

// Comprehensive legal data for major states
export const COMPREHENSIVE_LEGAL_DATA = {
  'California': {
    'traffic-stop': {
      rights: `• Right to remain silent beyond providing license, registration, and insurance
• Right to refuse consent to search your vehicle without a warrant
• Right to ask if you're free to leave
• Right to record the interaction (Penal Code 148)
• Right to have an interpreter if needed
• Protection against unreasonable search and seizure (4th Amendment)`,
      
      scripts: {
        initial: "Officer, I'm exercising my right to remain silent. Here are my license, registration, and insurance.",
        search: "I do not consent to any searches of my person or vehicle. I'm exercising my 4th Amendment rights.",
        questions: "I'm invoking my right to remain silent and would like to speak with an attorney.",
        leaving: "Am I free to leave, or am I being detained?"
      },
      
      dontSay: [
        "I wasn't doing anything wrong",
        "Why did you pull me over?",
        "This is harassment",
        "I know my rights", // avoid confrontational tone
        "You can't do this",
        "Any admission of guilt or wrongdoing"
      ]
    },
    
    'home-search': {
      rights: `• Right to refuse entry without a warrant (4th Amendment)
• Right to see the warrant before allowing entry
• Right to remain silent during search
• Right to observe the search from a reasonable distance
• Right to have attorney present during questioning`,
      
      scripts: {
        door: "I do not consent to any search. Please show me a warrant.",
        warrant: "I would like to see the warrant and verify its validity.",
        entry: "I do not consent to entry. I'm exercising my 4th Amendment rights.",
        questions: "I'm invoking my right to remain silent and want an attorney."
      },
      
      dontSay: [
        "Come in",
        "Look around",
        "I have nothing to hide",
        "Any incriminating statements",
        "Sure, go ahead"
      ]
    }
  },

  'New York': {
    'traffic-stop': {
      rights: `• Right to remain silent (5th Amendment)
• Right to refuse consent to search (4th Amendment)
• Right to ask if you're free to leave
• Right to record police interactions (1st Amendment)
• Protection under NY Civil Rights Law § 79-p`,
      
      scripts: {
        initial: "I'm exercising my right to remain silent. Here's my license and registration.",
        search: "I do not consent to any search of my person or vehicle.",
        questions: "I invoke my right to remain silent and request an attorney.",
        leaving: "Am I being detained, or am I free to go?"
      },
      
      dontSay: [
        "I was just...",
        "I didn't know...",
        "Can't you just give me a warning?",
        "Any explanation of your actions",
        "I was in a hurry"
      ]
    }
  },

  'Texas': {
    'traffic-stop': {
      rights: `• Right to remain silent (5th Amendment)
• Right to refuse consent to vehicle search
• Right to ask if you're free to leave
• Right to record the interaction
• Protection under Texas Transportation Code`,
      
      scripts: {
        initial: "I'm remaining silent. Here are my license, registration, and insurance.",
        search: "I do not consent to any search. I'm exercising my constitutional rights.",
        questions: "I invoke my right to remain silent and want to speak with a lawyer.",
        leaving: "Officer, am I free to leave?"
      },
      
      dontSay: [
        "I was only going...",
        "Everyone else was speeding too",
        "I'm late for...",
        "Any justification for your driving",
        "Can I just pay the fine now?"
      ]
    }
  },

  'Florida': {
    'traffic-stop': {
      rights: `• Right to remain silent beyond required identification
• Right to refuse consent to search vehicle
• Right to ask if you're being detained
• Right to record police interactions
• Protection under Florida Statutes Chapter 316`,
      
      scripts: {
        initial: "I'm exercising my right to remain silent. Here's my license and registration.",
        search: "I do not consent to any search of my person or vehicle.",
        questions: "I'm invoking my right to remain silent and requesting an attorney.",
        leaving: "Am I being detained or am I free to go?"
      },
      
      dontSay: [
        "I was just trying to...",
        "I didn't see the sign",
        "My GPS told me to...",
        "Any admission of traffic violations",
        "I was following traffic"
      ]
    }
  },

  // Default fallback for other states
  'Default': {
    'traffic-stop': {
      rights: `• Right to remain silent (5th Amendment)
• Right to refuse consent to search (4th Amendment)
• Right to ask if you're free to leave
• Right to record police interactions (1st Amendment)
• Right to an attorney if arrested`,
      
      scripts: {
        initial: "I'm exercising my right to remain silent. Here are my documents.",
        search: "I do not consent to any search.",
        questions: "I invoke my right to remain silent and want an attorney.",
        leaving: "Am I free to leave?"
      },
      
      dontSay: [
        "I wasn't doing anything wrong",
        "Why did you stop me?",
        "Any admission of wrongdoing",
        "I know my rights", // avoid confrontational tone
        "This is unfair"
      ]
    }
  }
}

export default legalContentService
