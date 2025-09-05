import { loadStripe } from '@stripe/stripe-js'
import { API_CONFIG, SUBSCRIPTION_TIERS } from '../config/api.js'
import axios from 'axios'

// Initialize Stripe
let stripePromise
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(API_CONFIG.STRIPE_PUBLISHABLE_KEY)
  }
  return stripePromise
}

export const stripeService = {
  // Initialize Stripe checkout for subscription
  async createCheckoutSession(priceId, userId, successUrl, cancelUrl) {
    try {
      // In a real app, this would call your backend API
      const response = await axios.post('/api/create-checkout-session', {
        priceId,
        userId,
        successUrl: successUrl || `${API_CONFIG.APP_URL}/subscription?success=true`,
        cancelUrl: cancelUrl || `${API_CONFIG.APP_URL}/subscription?canceled=true`
      })

      const { sessionId } = response.data
      
      const stripe = await getStripe()
      const { error } = await stripe.redirectToCheckout({
        sessionId
      })

      if (error) {
        throw new Error(error.message)
      }

      return { success: true }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Create customer portal session for subscription management
  async createPortalSession(customerId, returnUrl) {
    try {
      const response = await axios.post('/api/create-portal-session', {
        customerId,
        returnUrl: returnUrl || `${API_CONFIG.APP_URL}/subscription`
      })

      const { url } = response.data
      window.location.href = url

      return { success: true }
    } catch (error) {
      console.error('Error creating portal session:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Get subscription status
  async getSubscriptionStatus(userId) {
    try {
      const response = await axios.get(`/api/subscription-status/${userId}`)
      return {
        success: true,
        subscription: response.data
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      const response = await axios.post('/api/cancel-subscription', {
        subscriptionId
      })

      return {
        success: true,
        subscription: response.data
      }
    } catch (error) {
      console.error('Error canceling subscription:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Update subscription
  async updateSubscription(subscriptionId, newPriceId) {
    try {
      const response = await axios.post('/api/update-subscription', {
        subscriptionId,
        newPriceId
      })

      return {
        success: true,
        subscription: response.data
      }
    } catch (error) {
      console.error('Error updating subscription:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Get available subscription plans
  getSubscriptionPlans() {
    return Object.values(SUBSCRIPTION_TIERS)
  },

  // Check if user has access to feature based on subscription
  hasFeatureAccess(userTier, feature) {
    const tierLimits = SUBSCRIPTION_TIERS[userTier?.toUpperCase()]?.limits
    
    if (!tierLimits) return false

    switch (feature) {
      case 'recording':
        return tierLimits.recordingDuration > 0
      
      case 'unlimited_contacts':
        return tierLimits.emergencyContacts === -1
      
      case 'all_states':
        return tierLimits.states >= 50
      
      case 'ai_customization':
        return userTier === 'premium'
      
      case 'sms_alerts':
        return userTier === 'premium'
      
      default:
        return true
    }
  },

  // Get feature limits for user tier
  getFeatureLimits(userTier) {
    return SUBSCRIPTION_TIERS[userTier?.toUpperCase()]?.limits || SUBSCRIPTION_TIERS.FREE.limits
  }
}

// Mock backend API functions (in production, these would be actual backend endpoints)
export const mockBackendAPI = {
  // Create Stripe checkout session
  async createCheckoutSession(data) {
    // This would be handled by your backend
    console.log('Creating checkout session:', data)
    
    // Mock response
    return {
      sessionId: 'cs_test_mock_session_id'
    }
  },

  // Create customer portal session
  async createPortalSession(data) {
    console.log('Creating portal session:', data)
    
    return {
      url: 'https://billing.stripe.com/p/session/test_mock_session'
    }
  },

  // Get subscription status
  async getSubscriptionStatus(userId) {
    console.log('Getting subscription status for:', userId)
    
    // Mock response
    return {
      id: 'sub_mock_subscription',
      status: 'active',
      current_period_end: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
      plan: {
        id: 'price_basic_monthly',
        nickname: 'Basic Plan',
        amount: 300, // $3.00 in cents
        interval: 'month'
      },
      customer: 'cus_mock_customer'
    }
  },

  // Cancel subscription
  async cancelSubscription(data) {
    console.log('Canceling subscription:', data)
    
    return {
      id: data.subscriptionId,
      status: 'canceled',
      canceled_at: Date.now()
    }
  },

  // Update subscription
  async updateSubscription(data) {
    console.log('Updating subscription:', data)
    
    return {
      id: data.subscriptionId,
      status: 'active',
      plan: {
        id: data.newPriceId,
        amount: data.newPriceId.includes('premium') ? 700 : 300
      }
    }
  }
}

// Webhook handler for Stripe events (for reference)
export const handleStripeWebhook = (event) => {
  switch (event.type) {
    case 'customer.subscription.created':
      console.log('Subscription created:', event.data.object)
      // Update user subscription status in database
      break
      
    case 'customer.subscription.updated':
      console.log('Subscription updated:', event.data.object)
      // Update user subscription status in database
      break
      
    case 'customer.subscription.deleted':
      console.log('Subscription canceled:', event.data.object)
      // Update user subscription status in database
      break
      
    case 'invoice.payment_succeeded':
      console.log('Payment succeeded:', event.data.object)
      // Handle successful payment
      break
      
    case 'invoice.payment_failed':
      console.log('Payment failed:', event.data.object)
      // Handle failed payment
      break
      
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }
}

export default stripeService
