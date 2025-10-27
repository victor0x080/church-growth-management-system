-- Create table to store church module subscriptions
CREATE TABLE IF NOT EXISTS church_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  module_price DECIMAL(10, 2),
  status TEXT DEFAULT 'pending', -- pending, active, cancelled
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_id, module_name)
);

-- Create table to store selected agents for each church
CREATE TABLE IF NOT EXISTS church_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  agent_price DECIMAL(10, 2),
  status TEXT DEFAULT 'active', -- active, inactive
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_id, module_name, agent_name)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_church_modules_church_id ON church_modules(church_id);
CREATE INDEX IF NOT EXISTS idx_church_agents_church_id ON church_agents(church_id);
CREATE INDEX IF NOT EXISTS idx_church_modules_status ON church_modules(status);

-- Add trigger for updated_at (drop if exists first)
DROP TRIGGER IF EXISTS update_church_modules_updated_at ON church_modules;
CREATE TRIGGER update_church_modules_updated_at
  BEFORE UPDATE ON church_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_church_agents_updated_at ON church_agents;
CREATE TRIGGER update_church_agents_updated_at
  BEFORE UPDATE ON church_agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE church_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_agents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for church_modules
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their church modules" ON church_modules;
DROP POLICY IF EXISTS "Users can insert modules for their church" ON church_modules;
DROP POLICY IF EXISTS "Users can update their church modules" ON church_modules;
DROP POLICY IF EXISTS "Admins can manage church modules" ON church_modules;

-- Users can read modules for their church
CREATE POLICY "Users can read their church modules"
  ON church_modules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.church_id = church_modules.church_id
      AND profiles.id = auth.uid()
    )
  );

-- Users can insert modules for their own church (for onboarding)
CREATE POLICY "Users can insert modules for their church"
  ON church_modules FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.church_id = church_modules.church_id
      AND profiles.id = auth.uid()
    )
  );

-- Users can update modules for their own church
CREATE POLICY "Users can update their church modules"
  ON church_modules FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.church_id = church_modules.church_id
      AND profiles.id = auth.uid()
    )
  );

-- RLS Policies for church_agents
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their church agents" ON church_agents;
DROP POLICY IF EXISTS "Users can insert agents for their church" ON church_agents;
DROP POLICY IF EXISTS "Users can update their church agents" ON church_agents;
DROP POLICY IF EXISTS "Admins can manage church agents" ON church_agents;

-- Users can read agents for their church
CREATE POLICY "Users can read their church agents"
  ON church_agents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.church_id = church_agents.church_id
      AND profiles.id = auth.uid()
    )
  );

-- Users can insert agents for their own church (for onboarding)
CREATE POLICY "Users can insert agents for their church"
  ON church_agents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.church_id = church_agents.church_id
      AND profiles.id = auth.uid()
    )
  );

-- Users can update agents for their own church
CREATE POLICY "Users can update their church agents"
  ON church_agents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.church_id = church_agents.church_id
      AND profiles.id = auth.uid()
    )
  );

-- Add onboarding completed flag to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Create index for onboarding status
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON profiles(onboarding_completed);

