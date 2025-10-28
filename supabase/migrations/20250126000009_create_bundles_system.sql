-- Create bundles table
CREATE TABLE IF NOT EXISTS bundles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bundle_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bundle_modules table to link bundles with modules
CREATE TABLE IF NOT EXISTS bundle_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bundle_id TEXT NOT NULL REFERENCES bundles(bundle_id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bundle_id, module_name)
);

-- Create church_bundles table to track which bundles a church has purchased
CREATE TABLE IF NOT EXISTS church_bundles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  bundle_id TEXT NOT NULL REFERENCES bundles(bundle_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_id, bundle_id)
);

-- Insert themed bundles based on related modules
INSERT INTO bundles (bundle_id, name, description, price) VALUES
-- Core Essentials
('starter', 'Starter Bundle', 'Essential modules for getting started', 299),
('foundation', 'Foundation Bundle', 'Core church management essentials', 349),

-- Community & Engagement
('community', 'Community Builder', 'Build and strengthen your community', 449),
('engagement', 'Engagement Pro', 'Member engagement and communication suite', 549),
('outreach', 'Outreach Complete', 'Complete outreach and newcomer engagement', 449),

-- Pastoral Care
('care', 'Care & Support', 'Pastoral care and member support', 399),
('wellness', 'Member Wellness', 'Comprehensive member care and monitoring', 349),

-- Communication & Marketing
('communication', 'Communication Hub', 'Multi-channel communication suite', 449),
('marketing', 'Marketing & Content', 'Content management and social media', 399),
('rag', 'Content Intelligence', 'AI-powered content and RAG system', 349),

-- Financial & Administration
('financial', 'Financial Management', 'Church accounting and finance tools', 299),
('operations', 'Operations Suite', 'Administrative and operational tools', 399),

-- Growth & Development
('growth', 'Growth & Development', 'Churches focused on growth', 599),
('discipleship', 'Discipleship Bundle', 'Mentorship and skill development', 399),
('volunteer', 'Volunteer Excellence', 'Volunteer and micro-task management', 349),

-- Analytics & Intelligence
('analytics', 'Analytics Pro', 'Analytics and reporting suite', 449),
('intelligence', 'Church Intelligence', 'Data-driven church insights', 549),

-- Enterprise
('enterprise', 'Enterprise Complete', 'Full feature access for large churches', 999),
('complete', 'All-in-One', 'Complete suite of all modules', 1299)
ON CONFLICT (bundle_id) DO NOTHING;

-- Insert bundle modules (linking bundles to their modules)
-- Core Essentials
INSERT INTO bundle_modules (bundle_id, module_name) VALUES
-- Starter Bundle
('starter', 'Member Management System'),
('starter', 'Event Management System'),
('starter', 'Security & Compliance'),
('starter', 'Email Management'),
-- Foundation Bundle
('foundation', 'Member Management System'),
('foundation', 'Event Management System'),
('foundation', 'Group & Ministry Management'),
('foundation', 'Security & Compliance'),
('foundation', 'Church Accounting System'),
('foundation', 'Email Management')
ON CONFLICT DO NOTHING;

-- Community & Engagement
INSERT INTO bundle_modules (bundle_id, module_name) VALUES
-- Community Builder
('community', 'Community Growth and Strengthening'),
('community', 'Intelligent Micro-Volunteering Module'),
('community', 'Mentorship System'),
('community', 'Skills Development System'),
-- Engagement Pro
('engagement', 'Communication and Engagement'),
('engagement', 'Community Growth and Strengthening'),
('engagement', 'New Member Engagement & Onboarding (NME&O)'),
('engagement', 'Intelligent Micro-Volunteering Module'),
('engagement', 'Social Media Manager'),
-- Outreach Complete
('outreach', 'New Member Engagement & Onboarding (NME&O)'),
('outreach', 'Community Growth and Strengthening'),
('outreach', 'Intelligent Micro-Volunteering Module'),
('outreach', 'Engagement Monitoring')
ON CONFLICT DO NOTHING;

-- Pastoral Care
INSERT INTO bundle_modules (bundle_id, module_name) VALUES
-- Care & Support
('care', 'Proactive Pastoral Care Module'),
('care', 'Engagement Monitoring'),
('care', 'Member Management System'),
('care', 'Group & Ministry Management'),
-- Member Wellness
('wellness', 'Proactive Pastoral Care Module'),
('wellness', 'Engagement Monitoring'),
('wellness', 'Member Management System')
ON CONFLICT DO NOTHING;

-- Communication & Marketing
INSERT INTO bundle_modules (bundle_id, module_name) VALUES
-- Communication Hub
('communication', 'Communication and Engagement'),
('communication', 'Email Management'),
('communication', 'New Member Engagement & Onboarding (NME&O)'),
-- Marketing & Content
('marketing', 'Social Media Manager'),
('marketing', 'Content Augmentation & Retrieval System (RAG)'),
('marketing', 'Communication and Engagement'),
-- Content Intelligence
('rag', 'Content Augmentation & Retrieval System (RAG)'),
('rag', 'Social Media Manager')
ON CONFLICT DO NOTHING;

-- Financial & Administration
INSERT INTO bundle_modules (bundle_id, module_name) VALUES
-- Financial Management
('financial', 'Church Accounting System'),
('financial', 'Ministry Financial Management'),
-- Operations Suite
('operations', 'Church Accounting System'),
('operations', 'Task Management System'),
('operations', 'Workflow Automation System'),
('operations', 'Integration Hub')
ON CONFLICT DO NOTHING;

-- Growth & Development
INSERT INTO bundle_modules (bundle_id, module_name) VALUES
-- Growth & Development
('growth', 'Member Management System'),
('growth', 'Event Management System'),
('growth', 'Group & Ministry Management'),
('growth', 'Community Growth and Strengthening'),
('growth', 'Content Augmentation & Retrieval System (RAG)'),
('growth', 'Social Media Manager'),
('growth', 'Analytics & Reporting System'),
-- Discipleship Bundle
('discipleship', 'Skills Development System'),
('discipleship', 'Mentorship System'),
('discipleship', 'Group & Ministry Management'),
-- Volunteer Excellence
('volunteer', 'Intelligent Micro-Volunteering Module'),
('volunteer', 'Task Management System')
ON CONFLICT DO NOTHING;

-- Analytics & Intelligence
INSERT INTO bundle_modules (bundle_id, module_name) VALUES
-- Analytics Pro
('analytics', 'Analytics & Reporting System'),
('analytics', 'Engagement Monitoring'),
('analytics', 'Church Accounting System'),
-- Church Intelligence
('intelligence', 'Analytics & Reporting System'),
('intelligence', 'Engagement Monitoring'),
('intelligence', 'Content Augmentation & Retrieval System (RAG)'),
('intelligence', 'Ministry Financial Management')
ON CONFLICT DO NOTHING;

-- Enterprise & Complete
INSERT INTO bundle_modules (bundle_id, module_name) VALUES
-- Enterprise Complete (Most modules for large churches)
('enterprise', 'Member Management System'),
('enterprise', 'Event Management System'),
('enterprise', 'Group & Ministry Management'),
('enterprise', 'Communication and Engagement'),
('enterprise', 'Community Growth and Strengthening'),
('enterprise', 'Proactive Pastoral Care Module'),
('enterprise', 'Intelligent Micro-Volunteering Module'),
('enterprise', 'Content Augmentation & Retrieval System (RAG)'),
('enterprise', 'Email Management'),
('enterprise', 'New Member Engagement & Onboarding (NME&O)'),
('enterprise', 'Social Media Manager'),
('enterprise', 'Skills Development System'),
('enterprise', 'Mentorship System'),
('enterprise', 'Engagement Monitoring'),
('enterprise', 'Church Accounting System'),
('enterprise', 'Ministry Financial Management'),
('enterprise', 'Analytics & Reporting System'),
('enterprise', 'Workflow Automation System'),
('enterprise', 'Security & Compliance')
ON CONFLICT DO NOTHING;

-- All-in-One: Everything
INSERT INTO bundle_modules (bundle_id, module_name)
SELECT 'complete', UNNEST(ARRAY[
  'Member Management System',
  'Event Management System',
  'Group & Ministry Management',
  'Community Growth and Strengthening',
  'Proactive Pastoral Care Module',
  'Intelligent Micro-Volunteering Module',
  'Communication and Engagement',
  'Content Augmentation & Retrieval System (RAG)',
  'Email Management',
  'New Member Engagement & Onboarding (NME&O)',
  'Social Media Manager',
  'Skills Development System',
  'Mentorship System',
  'Engagement Monitoring',
  'Church Accounting System',
  'Ministry Financial Management',
  'Integration Hub',
  'Services Marketplace',
  'Workflow Automation System',
  'Analytics & Reporting System',
  'Task Management System',
  'Real-Time Collaboration',
  'Security & Compliance'
]) AS module_name
ON CONFLICT DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bundle_modules_bundle_id ON bundle_modules(bundle_id);
CREATE INDEX IF NOT EXISTS idx_church_bundles_church_id ON church_bundles(church_id);
CREATE INDEX IF NOT EXISTS idx_church_bundles_bundle_id ON church_bundles(bundle_id);

-- Enable RLS
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_bundles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bundles
CREATE POLICY "Anyone can read bundles" ON bundles FOR SELECT USING (true);

-- RLS Policies for bundle_modules
CREATE POLICY "Anyone can read bundle_modules" ON bundle_modules FOR SELECT USING (true);

-- RLS Policies for church_bundles
CREATE POLICY "Users can read their church bundles"
  ON church_bundles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.church_id = church_bundles.church_id
      AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert bundles for their church"
  ON church_bundles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.church_id = church_bundles.church_id
      AND profiles.id = auth.uid()
    )
  );

