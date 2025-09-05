// API Configuration
export const API_CONFIG = {
  // Supabase Configuration
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key',
  
  // OpenAI Configuration
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || 'your-openai-key',
  
  // Stripe Configuration
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your-stripe-key',
  
  // Twilio Configuration (handled on backend for security)
  TWILIO_WEBHOOK_URL: import.meta.env.VITE_TWILIO_WEBHOOK_URL || '/api/send-sms',
  
  // App Configuration
  APP_URL: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  
  // Feature Flags
  ENABLE_RECORDING: import.meta.env.VITE_ENABLE_RECORDING !== 'false',
  ENABLE_SMS_ALERTS: import.meta.env.VITE_ENABLE_SMS_ALERTS !== 'false',
  ENABLE_PAYMENTS: import.meta.env.VITE_ENABLE_PAYMENTS !== 'false'
}

// Subscription Tiers
export const SUBSCRIPTION_TIERS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      'Basic rights information for 3 states',
      'Basic scripts and phrases',
      'Limited emergency contacts (1)',
      'Community support'
    ],
    limits: {
      states: 3,
      emergencyContacts: 1,
      recordingDuration: 0, // No recording
      scriptsPerMonth: 10
    }
  },
  BASIC: {
    id: 'basic',
    name: 'Basic',
    price: 3,
    priceId: 'price_basic_monthly', // Stripe price ID
    features: [
      'Rights information for all 50 states',
      'Complete script library',
      'Up to 5 emergency contacts',
      'Basic audio recording (5 min)',
      'Email support'
    ],
    limits: {
      states: 50,
      emergencyContacts: 5,
      recordingDuration: 300, // 5 minutes
      scriptsPerMonth: 100
    }
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    price: 7,
    priceId: 'price_premium_monthly', // Stripe price ID
    features: [
      'Everything in Basic',
      'Unlimited emergency contacts',
      'Extended audio/video recording (30 min)',
      'Automatic SMS alerts',
      'AI-powered script customization',
      'Priority support',
      'Offline access'
    ],
    limits: {
      states: 50,
      emergencyContacts: -1, // Unlimited
      recordingDuration: 1800, // 30 minutes
      scriptsPerMonth: -1 // Unlimited
    }
  }
}

// US States with legal information availability
export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming'
]
