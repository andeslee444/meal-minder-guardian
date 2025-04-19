-- Create error_logs table
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  stack TEXT,
  component_stack TEXT,
  user_id UUID REFERENCES auth.users(id),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create function to create error_logs table if it doesn't exist
CREATE OR REPLACE FUNCTION create_error_logs_table_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message TEXT NOT NULL,
    stack TEXT,
    component_stack TEXT,
    user_id UUID REFERENCES auth.users(id),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
END;
$$;

-- Add RLS policies
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own error logs
CREATE POLICY "Users can view their own error logs"
  ON error_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow service role to view all error logs
CREATE POLICY "Service role can view all error logs"
  ON error_logs
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Allow service role to insert error logs
CREATE POLICY "Service role can insert error logs"
  ON error_logs
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role'); 