import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not set. Please check your environment configuration.');
}

// Use different connection settings based on environment
const isProduction = process.env.NODE_ENV === 'production';

export const client = postgres(process.env.POSTGRES_URL, {
  max: isProduction ? 1 : 10, // Vercel Postgres has connection limits
  idle_timeout: 20,
  max_lifetime: 60 * 30,
  ssl: isProduction ? 'require' : false, // Vercel Postgres requires SSL
  connection: {
    options: `project=${process.env.VERCEL_ENV || 'development'}`,
  },
});
export const db = drizzle(client, { schema });
