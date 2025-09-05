import OpenAI from 'openai'
import { API_CONFIG } from '../config/api.js'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: API_CONFIG.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, this should be handled server-side
})

export const openaiService = {
  // Generate customized legal scripts
  async generateScript(params) {
    const { scenario, state, language = 'en', customization = '' } = params
    
    try {
      const prompt = this.buildScriptPrompt(scenario, state, language, customization)
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a legal rights advisor specializing in police interactions. 
                     Provide accurate, state-specific legal guidance and scripts that help 
                     citizens exercise their constitutional rights safely and effectively. 
                     Always emphasize de-escalation and compliance with lawful orders while 
                     protecting constitutional rights.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3, // Lower temperature for more consistent legal advice
        presence_penalty: 0.1
      })

      const generatedScript = completion.choices[0]?.message?.content

      if (!generatedScript) {
        throw new Error('No script generated')
      }

      return {
        success: true,
        script: generatedScript,
        metadata: {
          scenario,
          state,
          language,
          tokensUsed: completion.usage?.total_tokens || 0
        }
      }
    } catch (error) {
      console.error('Error generating script:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Generate state-specific rights summary
  async generateRightsSummary(state, scenario, language = 'en') {
    try {
      const prompt = `Generate a concise, accurate summary of citizen rights during ${scenario} in ${state}. 
                     Include specific state laws and constitutional protections. 
                     Format as bullet points. Language: ${language === 'es' ? 'Spanish' : 'English'}.
                     Focus on practical, actionable information.`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a legal expert providing accurate, state-specific constitutional rights information.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.2
      })

      const summary = completion.choices[0]?.message?.content

      return {
        success: true,
        summary,
        metadata: {
          state,
          scenario,
          language,
          tokensUsed: completion.usage?.total_tokens || 0
        }
      }
    } catch (error) {
      console.error('Error generating rights summary:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Translate content to Spanish
  async translateContent(content, targetLanguage = 'es') {
    try {
      const languageName = targetLanguage === 'es' ? 'Spanish' : 'English'
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator specializing in legal and rights-related content. 
                     Maintain the accuracy and legal precision of the original text while making it 
                     accessible in ${languageName}.`
          },
          {
            role: 'user',
            content: `Translate the following legal rights content to ${languageName}:\n\n${content}`
          }
        ],
        max_tokens: 1200,
        temperature: 0.1
      })

      const translation = completion.choices[0]?.message?.content

      return {
        success: true,
        translation,
        metadata: {
          originalLanguage: 'en',
          targetLanguage,
          tokensUsed: completion.usage?.total_tokens || 0
        }
      }
    } catch (error) {
      console.error('Error translating content:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Customize existing script based on user preferences
  async customizeScript(originalScript, customizationRequest, state) {
    try {
      const prompt = `Modify the following legal script based on the user's request while maintaining 
                     legal accuracy for ${state} law:
                     
                     Original Script:
                     ${originalScript}
                     
                     Customization Request:
                     ${customizationRequest}
                     
                     Provide the modified script that incorporates the user's preferences while 
                     ensuring legal accuracy and safety.`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a legal advisor helping customize police interaction scripts while maintaining legal accuracy and safety.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      })

      const customizedScript = completion.choices[0]?.message?.content

      return {
        success: true,
        script: customizedScript,
        metadata: {
          state,
          tokensUsed: completion.usage?.total_tokens || 0
        }
      }
    } catch (error) {
      console.error('Error customizing script:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Build prompt for script generation
  buildScriptPrompt(scenario, state, language, customization) {
    const scenarioPrompts = {
      'traffic-stop': `Generate a script for a traffic stop interaction in ${state}. 
                      Include what to say when pulled over, how to exercise rights, 
                      and what NOT to say. Focus on de-escalation and legal compliance.`,
      
      'home-search': `Generate a script for when police come to your home in ${state}. 
                     Include how to handle door knocks, search warrant scenarios, 
                     and protecting your 4th Amendment rights.`,
      
      'street-encounter': `Generate a script for street encounters with police in ${state}. 
                          Cover stop-and-frisk situations, questioning, and when you can leave.`,
      
      'arrest': `Generate a script for arrest situations in ${state}. 
                Include Miranda rights, what to say/not say, and post-arrest procedures.`
    }

    let basePrompt = scenarioPrompts[scenario] || scenarioPrompts['traffic-stop']
    
    if (customization) {
      basePrompt += `\n\nCustomization request: ${customization}`
    }
    
    if (language === 'es') {
      basePrompt += '\n\nProvide the script in Spanish.'
    }
    
    basePrompt += `\n\nFormat the response with clear sections:
                   1. Key Rights
                   2. What to Say
                   3. What NOT to Say
                   4. De-escalation Tips`

    return basePrompt
  },

  // Validate API key and connection
  async validateConnection() {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Test connection'
          }
        ],
        max_tokens: 10
      })

      return {
        success: true,
        connected: true
      }
    } catch (error) {
      console.error('OpenAI connection failed:', error)
      return {
        success: false,
        connected: false,
        error: error.message
      }
    }
  }
}

// Predefined legal content for fallback when AI is unavailable
export const FALLBACK_CONTENT = {
  'traffic-stop': {
    'California': {
      rights: `• Right to remain silent beyond providing license, registration, and insurance
• Right to refuse consent to search your vehicle
• Right to ask if you're free to leave
• Right to record the interaction`,
      
      scripts: {
        initial: "Officer, I'm exercising my right to remain silent. Here are my license, registration, and insurance.",
        search: "I do not consent to any searches of my person or vehicle.",
        questions: "I'm invoking my right to remain silent and would like to speak with an attorney."
      },
      
      dontSay: [
        "I wasn't doing anything wrong",
        "Why did you pull me over?",
        "This is harassment",
        "I know my rights" (confrontational tone)
      ]
    }
  }
}

export default openaiService
