# Project: Agreeable.ca

## Development Commands
- Build: `npm run build`
- Dev: `npm run dev`
- Test: `npm test`

## Key Information
- This is a Next.js 15 application with TypeScript
- Uses Drizzle ORM with Neon database
- Implements family contract management system
- Version tracking in version.json file
- Always increment version number when making changes

## Important Notes
- When making commits, always check git status and run build before committing
- Follow semantic commit message format
- Include co-author attribution in commits
- **ALWAYS push changes to git automatically after committing - user prefers automatic pushing**
- **NEVER ask for confirmation when committing to git - user prefers automatic commits**

## Database Migrations
- **CRITICAL**: After making ANY changes to database schema (lib/db/schema.ts), ALWAYS run database migration
- Auto-migration endpoint: `/api/admin/auto-migrate` with header `x-auto-migrate-key: claude-auto-migrate-2024`
- Manual migration via admin dashboard at `/dashboard/admin` -> "Apply Schema Changes" button
- Schema changes without migration will cause production database queries to fail