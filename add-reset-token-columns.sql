-- Add password reset token columns to users table
-- Run this in your Supabase SQL Editor

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS reset_token TEXT,
ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMPTZ;

-- Create an index on reset_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);

-- Add comments
COMMENT ON COLUMN users.reset_token IS 'Token used for password reset, expires after 1 hour';
COMMENT ON COLUMN users.reset_token_expiry IS 'Expiry timestamp for the reset token';
