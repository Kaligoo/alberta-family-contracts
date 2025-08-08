-- Fix users table schema - remove incorrect columns
-- These columns should not exist in the users table

-- Drop the incorrect columns if they exist
ALTER TABLE users DROP COLUMN IF EXISTS activity_logs;
ALTER TABLE users DROP COLUMN IF EXISTS family_contracts;
ALTER TABLE users DROP COLUMN IF EXISTS invitations;

-- Ensure the correct columns exist with proper data types
-- Add missing columns if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS id SERIAL PRIMARY KEY;
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'member';
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Ensure constraints exist
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS users_email_unique UNIQUE (email);