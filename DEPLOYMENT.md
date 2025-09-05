# KnowYourRights.cards - Deployment Guide

This guide covers deploying KnowYourRights.cards to various platforms and environments.

## 🚀 Quick Deployment Options

### 1. Vercel (Recommended for Frontend)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vistara-apps/this-is-a-3846)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_OPENAI_API_KEY
vercel env add VITE_STRIPE_PUBLISHABLE_KEY
```

### 2. Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/vistara-apps/this-is-a-3846)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

### 3. Docker Deployment

```bash
# Build and run
docker build -t knowyourrights-cards .
docker run -p 3000:3000 knowyourrights-cards

# Or use docker-compose
docker-compose up -d
```

## 🔧 Environment Setup

### Required Environment Variables

Create a `.env` file with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI Configuration
VITE_OPENAI_API_KEY=sk-your-openai-api-key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-key

# App Configuration
VITE_APP_URL=https://your-domain.com
VITE_TWILIO_WEBHOOK_URL=https://your-backend.com/api/send-sms

# Feature Flags
VITE_ENABLE_RECORDING=true
VITE_ENABLE_SMS_ALERTS=true
VITE_ENABLE_PAYMENTS=true
```

### Backend Services Setup

#### 1. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the database schema:

```sql
-- Copy and run the schema from src/services/supabase.js
-- This creates all necessary tables and RLS policies
```

3. Set up storage bucket:

```sql
-- Create recordings bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('recordings', 'recordings', true);

-- Set up storage policies
CREATE POLICY "Users can upload recordings" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own recordings" ON storage.objects
  FOR SELECT USING (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);
```

#### 2. OpenAI Setup

1. Get API key from [OpenAI Platform](https://platform.openai.com)
2. Set up billing and usage limits
3. Test the API key:

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

#### 3. Stripe Setup

1. Create account at [Stripe](https://stripe.com)
2. Create products and prices:

```bash
# Create Basic plan
stripe products create --name="Basic Plan" --description="All 50 states, 5 contacts, 5-minute recording"
stripe prices create --product=prod_xxx --unit-amount=300 --currency=usd --recurring[interval]=month

# Create Premium plan
stripe products create --name="Premium Plan" --description="Unlimited features, 30-minute recording, SMS alerts"
stripe prices create --product=prod_xxx --unit-amount=700 --currency=usd --recurring[interval]=month
```

3. Set up webhooks for subscription events

#### 4. Twilio Setup (Optional)

1. Create account at [Twilio](https://twilio.com)
2. Get phone number and API credentials
3. Set up webhook endpoint for SMS delivery

## 🏗 Production Deployment

### AWS Deployment

#### Using AWS Amplify

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

#### Using AWS S3 + CloudFront

```bash
# Build the app
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### Google Cloud Platform

```bash
# Build the app
npm run build

# Deploy to App Engine
gcloud app deploy

# Or deploy to Cloud Run
gcloud builds submit --tag gcr.io/PROJECT_ID/knowyourrights
gcloud run deploy --image gcr.io/PROJECT_ID/knowyourrights --platform managed
```

### Azure Deployment

```bash
# Build the app
npm run build

# Deploy to Azure Static Web Apps
az staticwebapp create \
  --name knowyourrights-cards \
  --resource-group myResourceGroup \
  --source https://github.com/vistara-apps/this-is-a-3846 \
  --location "Central US" \
  --branch main \
  --app-location "/" \
  --output-location "dist"
```

## 🔒 Security Configuration

### Content Security Policy

Add to your hosting platform:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.openai.com https://api.stripe.com https://*.supabase.co wss://*.supabase.co; media-src 'self' blob:; worker-src 'self' blob:;
```

### HTTPS Configuration

Ensure HTTPS is enabled on your hosting platform:

- **Vercel**: Automatic HTTPS
- **Netlify**: Automatic HTTPS
- **AWS**: Use CloudFront with SSL certificate
- **Custom**: Use Let's Encrypt or commercial SSL

### Environment Security

- Never commit `.env` files
- Use platform-specific environment variable management
- Rotate API keys regularly
- Use different keys for development/production

## 📊 Monitoring & Analytics

### Error Tracking

Add Sentry for error tracking:

```bash
npm install @sentry/react @sentry/tracing
```

```javascript
// In src/main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.MODE,
});
```

### Performance Monitoring

Add performance monitoring:

```javascript
// Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### Usage Analytics

Track usage with Supabase:

```javascript
// Already implemented in UserContext
await supabaseService.trackUsage(userId, 'feature_used', { feature: 'recording' });
```

## 🚀 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        VITE_OPENAI_API_KEY: ${{ secrets.VITE_OPENAI_API_KEY }}
        VITE_STRIPE_PUBLISHABLE_KEY: ${{ secrets.VITE_STRIPE_PUBLISHABLE_KEY }}
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 🔍 Health Checks

### Application Health

The app includes health check endpoints:

- `/health` - Basic health check
- Application automatically checks API connectivity

### Database Health

Monitor Supabase dashboard for:
- Connection pool usage
- Query performance
- Storage usage

### API Health

Monitor external APIs:
- OpenAI API rate limits and usage
- Stripe webhook delivery
- Twilio SMS delivery rates

## 📈 Scaling Considerations

### Frontend Scaling

- Use CDN for static assets
- Enable gzip compression
- Implement code splitting
- Use service workers for caching

### Backend Scaling

- Monitor Supabase usage and upgrade plan as needed
- Implement caching for frequently accessed data
- Use database connection pooling
- Consider read replicas for high traffic

### Cost Optimization

- Monitor API usage (OpenAI, Twilio)
- Implement usage limits per subscription tier
- Use Supabase edge functions for server-side operations
- Optimize image and asset sizes

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables are set
   - Verify Node.js version compatibility
   - Clear npm cache: `npm cache clean --force`

2. **API Connection Issues**
   - Verify API keys are correct
   - Check CORS settings
   - Ensure proper error handling

3. **Deployment Issues**
   - Check build logs for errors
   - Verify environment variables on platform
   - Test locally with production build

### Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

---

For additional support, please open an issue on GitHub or contact support@knowyourrights.cards
