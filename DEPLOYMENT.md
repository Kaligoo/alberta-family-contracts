# Alberta Family Contracts - Vercel Deployment Guide

## Quick Deployment Steps

### 1. Deploy to Vercel
1. Push this repository to GitHub
2. Connect your GitHub repo to Vercel
3. Import the project in Vercel dashboard

### 2. Add Vercel Postgres
1. Go to your Vercel project dashboard
2. Click "Storage" tab
3. Click "Create Database" → "Postgres"
4. Follow the setup wizard
5. Vercel will automatically add `POSTGRES_URL` environment variable

### 3. Set Environment Variables
In your Vercel project settings, add these environment variables:

```
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret  
BASE_URL=https://your-app-name.vercel.app
AUTH_SECRET=your_32_character_random_secret
```

### 4. Run Database Migrations
After first deployment, run migrations via Vercel CLI or redeploy:

```bash
# Option 1: Via Vercel CLI
vercel env pull .env.local
npx drizzle-kit migrate

# Option 2: Trigger redeploy in Vercel dashboard
```

### 5. Set Up Stripe Webhook
1. In Stripe Dashboard, create a webhook
2. Endpoint URL: `https://your-app-name.vercel.app/api/stripe/webhook`
3. Events: `checkout.session.completed`, `customer.subscription.updated`
4. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

## Features Included
- ✅ Family contract creation and management
- ✅ Multiple contract support
- ✅ Professional agreement preview
- ✅ Data persistence with PostgreSQL
- ✅ Stripe payment integration
- ✅ User authentication with JWT
- ✅ Responsive design
- ✅ Activity logging

## Local Development Reversion
To revert back to local development after deployment:

1. Change `lib/db/drizzle.ts` connection settings back to local
2. Keep your local `.env` file pointing to localhost:5432

## Support
- Vercel Postgres: https://vercel.com/docs/storage/vercel-postgres
- Drizzle ORM: https://orm.drizzle.team/
- Next.js: https://nextjs.org/docs