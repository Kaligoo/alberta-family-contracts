import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not set. Please check your environment configuration.');
}

// Use Neon serverless adapter for better performance on Vercel
const sql = neon(process.env.POSTGRES_URL);
export const db = drizzle(sql, { schema });
