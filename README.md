# KnowYourRights.cards

**Instant legal clarity in your pocket during police interactions.**

A mobile-first web application providing users with concise, state-specific legal rights information and actionable scripts when interacting with law enforcement.

## 🚀 Features

### Core Features
- **State-Specific Rights Guides**: One-page, mobile-optimized guides detailing user rights during police stops, tailored to state law
- **Actionable Scripts & Phrases**: Pre-written, customizable scripts for common police interaction scenarios
- **Quick Record & Alert**: One-tap feature to discreetly start audio recording and send alerts to emergency contacts
- **Location-Aware Content**: Automatically surfaces correct state-specific information based on user's location
- **Bilingual Support**: Available in English and Spanish

### Advanced Features
- **AI-Powered Script Customization**: Generate personalized scripts using OpenAI
- **Emergency SMS Alerts**: Automatic notifications to trusted contacts during critical moments
- **Subscription Management**: Tiered access with Stripe integration
- **Offline Capability**: Core features work without internet connection
- **Audio/Video Recording**: Secure cloud storage for interaction documentation

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase (Database, Auth, Storage)
- **AI**: OpenAI GPT-4 for script generation
- **Payments**: Stripe for subscription management
- **SMS**: Twilio for emergency alerts
- **Deployment**: Docker-ready, Vercel/Netlify compatible

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- OpenAI API key
- Stripe account (for payments)
- Twilio account (for SMS alerts)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/vistara-apps/this-is-a-3846.git
cd this-is-a-3846
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your API keys:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI
VITE_OPENAI_API_KEY=sk-your-openai-api-key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key

# App Configuration
VITE_APP_URL=http://localhost:5173
```

### 3. Database Setup

Run the SQL schema in your Supabase project:

```sql
-- Copy the schema from src/services/supabase.js
-- Or use the provided migration files
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app.

## 🏗 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AppHeader.jsx
│   ├── EmergencyButton.jsx
│   ├── LanguageSelector.jsx
│   ├── ScriptEditor.jsx
│   └── StateCard.jsx
├── pages/              # Main application pages
│   ├── HomePage.jsx
│   ├── GuidesPage.jsx
│   ├── EmergencyPage.jsx
│   └── SubscriptionPage.jsx
├── services/           # API and business logic
│   ├── supabase.js     # Database operations
│   ├── openai.js       # AI script generation
│   ├── stripe.js       # Payment processing
│   ├── emergency.js    # Recording & alerts
│   └── legalContent.js # Legal data management
├── context/            # React context providers
│   └── UserContext.jsx
├── config/             # Configuration files
│   └── api.js
└── App.jsx            # Main application component
```

## 🔧 Configuration

### Subscription Tiers

The app supports three subscription tiers:

- **Free**: Basic rights info for 3 states, 1 emergency contact
- **Basic ($3/month)**: All 50 states, 5 contacts, 5-minute recording
- **Premium ($7/month)**: Unlimited features, 30-minute recording, SMS alerts

### Feature Flags

Control features via environment variables:

```env
VITE_ENABLE_RECORDING=true
VITE_ENABLE_SMS_ALERTS=true
VITE_ENABLE_PAYMENTS=true
```

## 🗄 Database Schema

### Core Tables

- `users` - User profiles and preferences
- `state_laws` - Legal information by state
- `saved_scripts` - User-customized scripts
- `interaction_recordings` - Audio/video recordings
- `usage_analytics` - Feature usage tracking

### Storage Buckets

- `recordings` - Audio/video files from interactions

## 🔐 Security & Privacy

- **Row Level Security (RLS)** enabled on all tables
- **Client-side encryption** for sensitive data
- **GDPR compliant** data handling
- **Secure file storage** with access controls
- **No logging** of sensitive legal content

## 🚀 Deployment

### Docker Deployment

```bash
docker build -t knowyourrights-cards .
docker run -p 3000:3000 knowyourrights-cards
```

### Vercel Deployment

```bash
npm run build
vercel --prod
```

### Environment Variables for Production

Ensure all production API keys are set:

- Supabase production URL and keys
- OpenAI production API key
- Stripe live keys
- Twilio production credentials

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

## 📱 Mobile Optimization

The app is designed mobile-first with:

- **Responsive design** for all screen sizes
- **Touch-friendly** interface elements
- **Offline capability** for core features
- **PWA support** for app-like experience
- **Fast loading** with code splitting

## 🌍 Internationalization

Currently supports:
- English (default)
- Spanish (es)

To add new languages:
1. Add language code to `src/config/api.js`
2. Create translation files
3. Update OpenAI prompts for new language

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 Legal Disclaimer

This application provides general legal information and should not be considered legal advice. Users should consult with qualified attorneys for specific legal situations. The app creators are not responsible for the accuracy of legal information or outcomes of police interactions.

## 📞 Support

- **Documentation**: [docs.knowyourrights.cards](https://docs.knowyourrights.cards)
- **Issues**: [GitHub Issues](https://github.com/vistara-apps/this-is-a-3846/issues)
- **Email**: support@knowyourrights.cards

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Legal experts** who provided guidance on constitutional rights
- **Civil rights organizations** for their advocacy and resources
- **Open source community** for the amazing tools and libraries
- **Beta testers** who helped refine the user experience

---

**Built with ❤️ for civil rights and community safety**
