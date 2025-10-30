-- Reset existing subscriptions and catalog (safe for dev). Adjust for prod as needed.
-- Note: We only truncate actual data tables, not views. Views will be dropped and recreated later.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'church_agents' AND table_type = 'BASE TABLE') THEN
    TRUNCATE church_agents RESTART IDENTITY CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'church_modules' AND table_type = 'BASE TABLE') THEN
    TRUNCATE church_modules RESTART IDENTITY CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'church_bundles' AND table_type = 'BASE TABLE') THEN
    TRUNCATE church_bundles RESTART IDENTITY CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bundle_modules' AND table_type = 'BASE TABLE') THEN
    TRUNCATE bundle_modules RESTART IDENTITY CASCADE;
  END IF;
  -- Note: available_modules, module_agents, and bundles may be views, so we don't truncate them here.
  -- They will be dropped and recreated as views later in this migration.
END $$;

-- Unified Catalog Tables
CREATE TABLE IF NOT EXISTS catalog_agents (
  agent_id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  expected_outcomes jsonb DEFAULT '[]'::jsonb,
  percent_users_using numeric,
  category text,
  capabilities jsonb DEFAULT '[]'::jsonb,
  event_types_watched jsonb DEFAULT '[]'::jsonb,
  roles_served jsonb DEFAULT '[]'::jsonb,
  version text,
  status text,
  prerequisites jsonb DEFAULT '[]'::jsonb,
  dependencies jsonb DEFAULT '[]'::jsonb,
  compatibility jsonb,
  telemetry jsonb,
  risk_controls jsonb,
  config_schema jsonb,
  playbooks jsonb,
  icon text,
  tags jsonb DEFAULT '[]'::jsonb,
  owner text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS catalog_modules (
  module_id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  expected_outcomes jsonb DEFAULT '[]'::jsonb,
  percent_users_using numeric,
  category text,
  owner text,
  version text,
  status text,
  prerequisites jsonb DEFAULT '[]'::jsonb,
  dependencies jsonb DEFAULT '[]'::jsonb,
  estimated_setup_mins int,
  roles_served jsonb DEFAULT '[]'::jsonb,
  metrics jsonb,
  icon text,
  tags jsonb DEFAULT '[]'::jsonb,
  configuration_guide_url text,
  feature_flags jsonb,
  support_tier text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS catalog_bundles (
  bundle_id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  expected_outcomes jsonb DEFAULT '[]'::jsonb,
  percent_users_using numeric,
  tier text,
  pricing jsonb,
  visibility text,
  version text,
  status text,
  upgrade_path jsonb,
  license text,
  icon text,
  tags jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Relations
-- Drop old tables if they exist with wrong schema, then recreate
DROP TABLE IF EXISTS module_required_agents CASCADE;
DROP TABLE IF EXISTS module_optional_agents CASCADE;
DROP TABLE IF EXISTS bundle_modules CASCADE;

CREATE TABLE module_required_agents (
  module_id text REFERENCES catalog_modules(module_id) ON DELETE CASCADE,
  agent_id text REFERENCES catalog_agents(agent_id) ON DELETE CASCADE,
  PRIMARY KEY (module_id, agent_id)
);

CREATE TABLE module_optional_agents (
  module_id text REFERENCES catalog_modules(module_id) ON DELETE CASCADE,
  agent_id text REFERENCES catalog_agents(agent_id) ON DELETE CASCADE,
  PRIMARY KEY (module_id, agent_id)
);

CREATE TABLE bundle_modules (
  bundle_id text REFERENCES catalog_bundles(bundle_id) ON DELETE CASCADE,
  module_id text REFERENCES catalog_modules(module_id) ON DELETE CASCADE,
  PRIMARY KEY (bundle_id, module_id)
);

-- Seed sample from unified_datamodel.json concept
INSERT INTO catalog_agents (agent_id, name, description, expected_outcomes, percent_users_using, category, capabilities, event_types_watched, roles_served, version, status, prerequisites, dependencies, compatibility, telemetry, icon, tags, owner)
VALUES (
  'agt_visit_followup_v1',
  'Visitor Follow-Up Assistant',
  'Monitors new visitors and automates welcome messages, notes, and scheduling of follow-up.',
  '["Faster first contact with newcomers","Higher newcomer retention","Reduced manual outreach time"]'::jsonb,
  62.4,
  'Engagement',
  '["detect_event:new_visitor","send_email","create_task"]'::jsonb,
  '["visit.new","attendance.gap.14d"]'::jsonb,
  '["Minister","Admin"]'::jsonb,
  '1.3.0','active', '["email_integration","member_directory_enabled"]'::jsonb, '[]'::jsonb,
  '{"regions":["US"],"languages":["en"]}', '{"dailyActive":312,"successRatePct":96.2}',
  'heart-plus','["onboarding","follow-up"]'::jsonb,'product:embark'
)
ON CONFLICT (agent_id) DO NOTHING;

INSERT INTO catalog_modules (module_id, name, description, expected_outcomes, percent_users_using, category, owner, version, status, prerequisites, dependencies, estimated_setup_mins, roles_served, metrics, icon, tags)
VALUES (
  'mod_community_growth',
  'Community Growth',
  'Tools that help attract, welcome, and retain new participants while re-engaging existing members.',
  '["Increase in returning visitors","More consistent follow-up","Better visibility into engagement"]'::jsonb,
  71.8,
  'Engagement',
  'product:embark','2.0.0','active','["member_directory_enabled"]'::jsonb,'[]'::jsonb,15,
  '["Minister","Admin","VolunteerLead"]'::jsonb,
  '{"medianTimeToValueMins":30,"nps":61}','users','["growth","retention"]'::jsonb
)
ON CONFLICT (module_id) DO NOTHING;

INSERT INTO catalog_bundles (bundle_id, name, description, expected_outcomes, percent_users_using, tier, pricing, visibility, version, status, icon, tags)
VALUES (
  'bndl_foundation_plus',
  'Foundation+',
  'Everything a small church needs to get started fast—core management plus event-aware assistants.',
  '["Lower admin workload","Faster newcomer follow-up","Clear view of upcoming priorities"]'::jsonb,
  54.3,
  'Starter', '{"currency":"USD","model":"freemium","monthly":0,"notes":"Core functions free; assistants billed separately."}',
  'public','1.1.0','active','sparkle-pack','["starter","onboarding"]'::jsonb
)
ON CONFLICT (bundle_id) DO NOTHING;

INSERT INTO module_required_agents (module_id, agent_id) VALUES ('mod_community_growth','agt_visit_followup_v1')
ON CONFLICT DO NOTHING;

-- (Optional placeholders for optional agents referenced in example)
INSERT INTO catalog_agents (agent_id, name, status) VALUES
 ('agt_donor_thanks_v2','Donor Thanks Assistant','active'),
 ('agt_attendance_watch_v1','Attendance Watcher','active')
ON CONFLICT (agent_id) DO NOTHING;

INSERT INTO module_optional_agents (module_id, agent_id) VALUES
 ('mod_community_growth','agt_donor_thanks_v2'),
 ('mod_community_growth','agt_attendance_watch_v1')
ON CONFLICT DO NOTHING;

INSERT INTO bundle_modules (bundle_id, module_id) VALUES ('bndl_foundation_plus','mod_community_growth')
ON CONFLICT DO NOTHING;

-- Compatibility Views for existing UI code
-- Drop existing tables first (if they exist), then create views
DROP TABLE IF EXISTS available_modules CASCADE;
DROP TABLE IF EXISTS module_agents CASCADE;
DROP TABLE IF EXISTS bundles CASCADE;
-- Also drop views if they exist (cleanup)
DROP VIEW IF EXISTS available_modules CASCADE;
DROP VIEW IF EXISTS module_agents CASCADE;
DROP VIEW IF EXISTS bundles CASCADE;

CREATE VIEW available_modules AS
SELECT 
  module_id as module_name,
  name,
  description as purpose,
  0::numeric as price,
  category
FROM catalog_modules;

CREATE VIEW module_agents AS
SELECT m.module_id as module_name, a.agent_id as agent_name, 0::numeric as price
FROM module_required_agents mr
JOIN catalog_modules m ON m.module_id = mr.module_id
JOIN catalog_agents a ON a.agent_id = mr.agent_id
UNION
SELECT m.module_id as module_name, a.agent_id as agent_name, 0::numeric as price
FROM module_optional_agents mo
JOIN catalog_modules m ON m.module_id = mo.module_id
JOIN catalog_agents a ON a.agent_id = mo.agent_id;

CREATE VIEW bundles AS
SELECT bundle_id, name, description, 0::numeric as price FROM catalog_bundles;


