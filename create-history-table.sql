-- Create prompt_history table in Supabase
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS prompt_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  use_case text NOT NULL,
  problem_description text NOT NULL,
  challenges text NOT NULL,
  generated_pack jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_prompt_history_user_id ON prompt_history(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_prompt_history_created_at ON prompt_history(created_at DESC);

-- Enable Row Level Security
ALTER TABLE prompt_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can insert history" ON prompt_history;
DROP POLICY IF EXISTS "Service role can select history" ON prompt_history;
DROP POLICY IF EXISTS "Users can view their own history" ON prompt_history;

-- Create policy to allow service role to insert
CREATE POLICY "Service role can insert history"
ON prompt_history
FOR INSERT
TO service_role
WITH CHECK (true);

-- Create policy to allow service role to select (for API routes)
CREATE POLICY "Service role can select history"
ON prompt_history
FOR SELECT
TO service_role
USING (true);

-- Add comment
COMMENT ON TABLE prompt_history IS 'Stores user prompt generation history';
