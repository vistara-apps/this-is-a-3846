import React from 'react'
import { Check, Star } from 'lucide-react'
import { useUser } from '../context/UserContext'

const SubscriptionPage = () => {
  const { user } = useUser()

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Basic rights information for limited states',
      features: [
        'Access to 3 states',
        'Basic rights guides',
        'Standard scripts',
        'Community support'
      ],
      limitations: [
        'Limited state coverage',
        'No emergency features',
        'No script customization'
      ],
      buttonText: 'Current Plan',
      current: user.subscriptionTier === 'free'
    },
    {
      name: 'Basic',
      price: '$3',
      period: 'per month',
      description: 'Complete rights coverage for all states',
      features: [
        'All 50 states + DC',
        'Complete rights guides',
        'Customizable scripts',
        'Email support',
        'Bilingual content',
        'Regular updates'
      ],
      buttonText: 'Upgrade to Basic',
      popular: false,
      current: user.subscriptionTier === 'basic'
    },
    {
      name: 'Premium',
      price: '$7',
      period: 'per month',
      description: 'Full protection with emergency features',
      features: [
        'Everything in Basic',
        'Emergency recording',
        'Automatic alerts',
        'Unlimited emergency contacts',
        'Priority support',
        'Advanced scenarios',
        'Legal updates notifications'
      ],
      buttonText: 'Upgrade to Premium',
      popular: true,
      current: user.subscriptionTier === 'premium'
    }
  ]

  const handleSubscribe = (planName) => {
    // In a real app, this would integrate with Stripe
    console.log(`Subscribing to ${planName} plan`)
    alert(`Subscription to ${planName} plan would be processed here via Stripe`)
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-text mb-4">
          Choose Your Protection Level
        </h1>
        <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
          Get the legal knowledge and emergency tools you need to stay safe and protected
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`relative bg-surface rounded-xl shadow-card p-8 ${
              plan.popular ? 'ring-2 ring-primary scale-105' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                  <Star className="w-4 h-4" />
                  <span>Most Popular</span>
                </div>
              </div>
            )}

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-text mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-text">{plan.price}</span>
                <span className="text-zinc-500 ml-1">/{plan.period}</span>
              </div>
              <p className="text-zinc-600">{plan.description}</p>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-text">{feature}</span>
                </li>
              ))}
              {plan.limitations?.map((limitation, limitIndex) => (
                <li key={limitIndex} className="flex items-center space-x-3 opacity-50">
                  <div className="w-5 h-5 flex-shrink-0" />
                  <span className="text-zinc-500 line-through">{limitation}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.name)}
              disabled={plan.current}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                plan.current
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : plan.popular
                  ? 'bg-primary hover:bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {plan.current ? '✓ Current Plan' : plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-text mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div className="bg-surface rounded-lg p-6">
            <h3 className="font-semibold text-text mb-2">
              Is my data secure and private?
            </h3>
            <p className="text-zinc-600">
              Yes, we use enterprise-grade encryption and never store your recordings permanently. 
              Emergency recordings are only kept for 30 days and can be deleted at any time.
            </p>
          </div>
          <div className="bg-surface rounded-lg p-6">
            <h3 className="font-semibold text-text mb-2">
              Can I cancel my subscription anytime?
            </h3>
            <p className="text-zinc-600">
              Absolutely. You can cancel your subscription at any time with no cancellation fees. 
              You'll continue to have access until the end of your current billing period.
            </p>
          </div>
          <div className="bg-surface rounded-lg p-6">
            <h3 className="font-semibold text-text mb-2">
              How accurate is the legal information?
            </h3>
            <p className="text-zinc-600">
              Our content is regularly reviewed by legal experts and updated when laws change. 
              However, this app provides general information and is not a substitute for legal advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionPage