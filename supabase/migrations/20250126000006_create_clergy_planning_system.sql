-- Create clergy planning phases table
CREATE TABLE IF NOT EXISTS clergy_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phase_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  color TEXT,
  estimated_days INTEGER,
  prerequisites JSONB DEFAULT '[]'::jsonb, -- Array of phase_ids that must be completed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create clergy steps table (23+ steps across 9 phases)
CREATE TABLE IF NOT EXISTS clergy_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phase_id UUID NOT NULL REFERENCES clergy_phases(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'form', 'document', 'checklist', 'survey'
  data_schema JSONB, -- Schema for form fields or checklist items
  is_required BOOLEAN DEFAULT TRUE,
  prerequisite_steps JSONB DEFAULT '[]'::jsonb, -- Array of step_ids
  estimated_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(phase_id, step_number)
);

-- Create church planning progress table
CREATE TABLE IF NOT EXISTS church_planning_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  phase_id UUID NOT NULL REFERENCES clergy_phases(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started', -- not_started, in_progress, completed
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completion_percentage INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_id, phase_id)
);

-- Create church step progress table
CREATE TABLE IF NOT EXISTS church_step_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES clergy_steps(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started', -- not_started, in_progress, completed
  data JSONB DEFAULT '{}'::jsonb, -- Store form responses, notes, etc.
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_id, step_id)
);

-- Create church planning achievements table
CREATE TABLE IF NOT EXISTS church_planning_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL, -- percentage, phase_completion, milestone
  achievement_value TEXT NOT NULL, -- e.g., '25', '50', 'phase_1', etc.
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT unique_achievement UNIQUE(church_id, achievement_type, achievement_value)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clergy_steps_phase_id ON clergy_steps(phase_id);
CREATE INDEX IF NOT EXISTS idx_church_planning_progress_church_id ON church_planning_progress(church_id);
CREATE INDEX IF NOT EXISTS idx_church_planning_progress_status ON church_planning_progress(status);
CREATE INDEX IF NOT EXISTS idx_church_step_progress_church_id ON church_step_progress(church_id);
CREATE INDEX IF NOT EXISTS idx_church_step_progress_status ON church_step_progress(status);
CREATE INDEX IF NOT EXISTS idx_church_planning_achievements_church_id ON church_planning_achievements(church_id);

-- Add triggers for updated_at
CREATE TRIGGER update_clergy_phases_updated_at
  BEFORE UPDATE ON clergy_phases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clergy_steps_updated_at
  BEFORE UPDATE ON clergy_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_church_planning_progress_updated_at
  BEFORE UPDATE ON church_planning_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_church_step_progress_updated_at
  BEFORE UPDATE ON church_step_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE clergy_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE clergy_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_planning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_step_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_planning_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Phases and steps are readable by all authenticated users
CREATE POLICY "Allow authenticated read on clergy_phases"
  ON clergy_phases FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read on clergy_steps"
  ON clergy_steps FOR SELECT
  TO authenticated
  USING (true);

-- Users can read and update their church's progress
CREATE POLICY "Users can read their church planning progress"
  ON church_planning_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.church_id = church_planning_progress.church_id
      AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their church planning progress"
  ON church_planning_progress FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.church_id = church_planning_progress.church_id
      AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can update their church planning progress"
  ON church_planning_progress FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.church_id = church_planning_progress.church_id
      AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can read their church step progress"
  ON church_step_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.church_id = church_step_progress.church_id
      AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their church step progress"
  ON church_step_progress FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.church_id = church_step_progress.church_id
      AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can update their church step progress"
  ON church_step_progress FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.church_id = church_step_progress.church_id
      AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can read their church achievements"
  ON church_planning_achievements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.church_id = church_planning_achievements.church_id
      AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their church achievements"
  ON church_planning_achievements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.church_id = church_planning_achievements.church_id
      AND profiles.id = auth.uid()
    )
  );

