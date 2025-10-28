-- Create catalog tables for modules and agents
CREATE TABLE IF NOT EXISTS available_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_name TEXT UNIQUE NOT NULL,
  purpose TEXT,
  price DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS module_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_name TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  description TEXT,
  required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (readable by anyone; writes controlled by migrations only)
ALTER TABLE available_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_agents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read available_modules" ON available_modules;
CREATE POLICY "Anyone can read available_modules" ON available_modules FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can read module_agents" ON module_agents;
CREATE POLICY "Anyone can read module_agents" ON module_agents FOR SELECT USING (true);

-- Seed modules
INSERT INTO available_modules (module_name, purpose, price) VALUES
('Community Growth and Strengthening', 'Member matching, connection analysis, and engagement tracking.', 199.99),
('Proactive Pastoral Care Module', 'Disengagement risk detection and care coordination.', 149.99),
('Intelligent Micro-Volunteering Module', 'Volunteer-task matching and task lifecycle management.', 179.99),
('Communication and engagement', 'AI-driven automation for connections, content, communication, and administrative functions.', 129.99),
('Content Augmentation & Retrieval System (RAG)', 'AI-enhanced content ingestion, embedding, search, and generation.', 99.99),
('Email Management', 'AI-enabled email processing to support communication flow.', 79.99),
('New Member Engagement & Onboarding (NMEO)', 'AI-guided onboarding journeys to improve newcomer assimilation.', 159.99),
('Social Media Manager', 'AI-guided social media management.', 89.99),
('Ministry Management', NULL, 119.99),
('Micro-Volunteering', NULL, 99.99),
('Social support', NULL, 139.99)
ON CONFLICT (module_name) DO UPDATE SET purpose = EXCLUDED.purpose, price = EXCLUDED.price;

-- Seed agents
-- 1) Community Growth and Strengthening
INSERT INTO module_agents (module_name, agent_name, description, required) VALUES
('Community Growth and Strengthening', 'Personality Matcher', 'OpenAI-based profiling', FALSE),
('Community Growth and Strengthening', 'Life Event Matcher', 'Context extraction and scoring', FALSE),
('Community Growth and Strengthening', 'Social Graph Analyzer', 'Relationship and network management', FALSE),
('Community Growth and Strengthening', 'Relationship Strength Calculator', 'Engagement metrics', FALSE),
('Community Growth and Strengthening', 'Small Group Manager', 'Group formation and management', FALSE),
('Community Growth and Strengthening', 'Engagement Scoring Agent', 'Multidimensional engagement metrics', FALSE),
('Community Growth and Strengthening', 'Profile Embedding Service', 'pgvector for similarity search', FALSE)
ON CONFLICT (module_name, agent_name) DO NOTHING;

-- 2) Proactive Pastoral Care Module
INSERT INTO module_agents (module_name, agent_name, description, required) VALUES
('Proactive Pastoral Care Module', 'Disconnection Alert System', 'Risk engine', FALSE),
('Proactive Pastoral Care Module', 'Alert Routing and Assignment Agent', NULL, FALSE),
('Proactive Pastoral Care Module', 'Communication Management Agent', 'Outreach coordination', FALSE),
('Proactive Pastoral Care Module', 'Daily Check-in Scheduler', NULL, FALSE),
('Proactive Pastoral Care Module', 'Alert Resolution Tracker', NULL, FALSE)
ON CONFLICT (module_name, agent_name) DO NOTHING;

-- 3) Intelligent Micro-Volunteering Module
INSERT INTO module_agents (module_name, agent_name, description, required) VALUES
('Intelligent Micro-Volunteering Module', 'Micro-task Manager', NULL, FALSE),
('Intelligent Micro-Volunteering Module', 'Volunteer Matcher', '7-dimension skill and availability matching', FALSE),
('Intelligent Micro-Volunteering Module', 'Task Lifecycle Agent', NULL, FALSE),
('Intelligent Micro-Volunteering Module', 'Gamification & Reputation Agent', NULL, FALSE),
('Intelligent Micro-Volunteering Module', 'Real-time Task Offer Dispatcher', NULL, FALSE)
ON CONFLICT (module_name, agent_name) DO NOTHING;

-- 4) Communication and engagement
INSERT INTO module_agents (module_name, agent_name, description, required) VALUES
('Communication and engagement', 'Connection AI Agents', 'Intro-writer, followup scheduler, matching coordinators', FALSE),
('Communication and engagement', 'Volunteer Agents', 'Reminders, matchmaking, engagement follow-ups', FALSE),
('Communication and engagement', 'Content Agents', 'AI content augmentation, RAG processing, import/export', FALSE),
('Communication and engagement', 'Email Agents', 'Batch syncing, classification, bulk sending', FALSE),
('Communication and engagement', 'Communication Agents', 'Email generation, notifications', FALSE),
('Communication and engagement', 'Pastoral Care Agents', 'Risk scoring, coaching', FALSE),
('Communication and engagement', 'Administrative Agents', 'Analytics, imports, leaderboard', FALSE)
ON CONFLICT (module_name, agent_name) DO NOTHING;

-- 5) Content Augmentation & Retrieval System (RAG)
INSERT INTO module_agents (module_name, agent_name, description, required) VALUES
('Content Augmentation & Retrieval System (RAG)', 'Content Ingestion Pipeline', NULL, FALSE),
('Content Augmentation & Retrieval System (RAG)', 'Semantic Chunker & Embedding Generator', 'OpenAI + pgvector', FALSE),
('Content Augmentation & Retrieval System (RAG)', 'RAG Query Processor', NULL, FALSE),
('Content Augmentation & Retrieval System (RAG)', 'Weekly Digest Generator', NULL, FALSE)
ON CONFLICT (module_name, agent_name) DO NOTHING;

-- 6) Email Management
INSERT INTO module_agents (module_name, agent_name, description, required) VALUES
('Email Management', 'Email Synchronization & Classification', NULL, FALSE),
('Email Management', 'Sentiment & Priority Scoring', NULL, FALSE),
('Email Management', 'Routing & Assignment', NULL, FALSE),
('Email Management', 'Response Tracking', NULL, FALSE),
('Email Management', 'Staff Inbox Dashboard', NULL, FALSE)
ON CONFLICT (module_name, agent_name) DO NOTHING;

-- 7) New Member Engagement & Onboarding (NMEO)
INSERT INTO module_agents (module_name, agent_name, description, required) VALUES
('New Member Engagement & Onboarding (NMEO)', 'Newcomer Concierge', 'Welcome messages, scheduling', FALSE),
('New Member Engagement & Onboarding (NMEO)', 'Group Matchmaker', NULL, FALSE),
('New Member Engagement & Onboarding (NMEO)', 'Serve Coordinator', 'Volunteer onboarding', FALSE),
('New Member Engagement & Onboarding (NMEO)', 'Pastoral Triage Sentinel', 'Needs detection', FALSE),
('New Member Engagement & Onboarding (NMEO)', 'Follow-Up Scheduler', NULL, FALSE),
('New Member Engagement & Onboarding (NMEO)', 'Pathway Navigator', 'Dynamic journey routing', FALSE)
ON CONFLICT (module_name, agent_name) DO NOTHING;

-- 8) Social Media Manager
INSERT INTO module_agents (module_name, agent_name, description, required) VALUES
('Social Media Manager', 'Service Streaming', NULL, FALSE),
('Social Media Manager', 'Content generation', NULL, FALSE),
('Social Media Manager', 'Content distribution', NULL, FALSE),
('Social Media Manager', 'Community engagement and conversation', NULL, FALSE)
ON CONFLICT (module_name, agent_name) DO NOTHING;

-- 9) Ministry Management (placeholder - no agents specified)
-- 10) Micro-Volunteering (placeholder - no agents specified)
-- 11) Social support (placeholder - no agents specified);
