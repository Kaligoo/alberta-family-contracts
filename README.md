# Alberta Family Contracts

Professional cohabitation agreements and family contracts platform. Create legally compliant documents to protect your relationship with comprehensive agreements tailored to Alberta law.

## Features

- Professional family contract creation and management
- Multiple contract support for different situations
- Interactive form system for collecting family information
- Children and custody arrangement documentation
- Income and financial responsibility tracking
- Professional document preview with legal formatting
- Secure data storage and user authentication
- Payment processing for completed agreements
- Activity logging and audit trails

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Database**: [Postgres](https://www.postgresql.org/)
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **Payments**: [Stripe](https://stripe.com/)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/)

## Getting Started

```bash
git clone https://github.com/Kaligoo/alberta-family-contracts
cd alberta-family-contracts
pnpm install
```

## Local Development

1. Set up PostgreSQL locally
2. Copy `.env.example` to `.env` and configure database connection
3. Run database migrations:

```bash
pnpm db:migrate
pnpm db:seed
```

4. Start the development server:

```bash
pnpm dev
```

Test user credentials:
- Email: `test@test.com`
- Password: `admin123`

## Deployment

See `DEPLOYMENT.md` for complete Vercel deployment instructions.

## Environment Variables

Required environment variables:
- `POSTGRES_URL` - Database connection string
- `AUTH_SECRET` - JWT signing secret
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `BASE_URL` - Application base URL

## Legal Notice

This platform generates document templates for informational purposes. All agreements should be reviewed by qualified legal counsel before signing. The platform does not provide legal advice.

## License

MIT License - see LICENSE file for details.
