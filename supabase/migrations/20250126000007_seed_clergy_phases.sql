-- Seed the 9 planning phases
INSERT INTO clergy_phases (phase_number, title, description, icon_name, color, estimated_days, prerequisites) VALUES
(1, 'Church Profile', 'Establish core information about your church including denomination, size, location, and foundational beliefs.', 'building', 'blue', 3, '[]'),
(2, 'Community Assessment', 'Analyze the local community, demographics, needs, and opportunities for ministry.', 'users', 'green', 5, '["1"]'),
(3, 'Vision & Mission Development', 'Define your church''s vision statement, mission, and core values that guide all ministry efforts.', 'target', 'purple', 7, '["1", "2"]'),
(4, 'Ministry Structure', 'Design organizational structure, leadership roles, and ministry team configurations.', 'sitemap', 'orange', 10, '["3"]'),
(5, 'Program Design', 'Develop specific ministry programs, services, and activities aligned with your vision.', 'grid', 'teal', 14, '["4"]'),
(6, 'Resource Planning', 'Plan budgets, facilities, equipment, and staffing needs for ministry implementation.', 'dollar-sign', 'yellow', 7, '["5"]'),
(7, 'Implementation Strategy', 'Create timeline, milestones, and step-by-step plans for rolling out ministry initiatives.', 'calendar', 'red', 21, '["6"]'),
(8, 'Evaluation & Monitoring', 'Establish metrics, feedback systems, and regular review processes.', 'bar-chart', 'indigo', 14, '["7"]'),
(9, 'Continuous Improvement', 'Develop iterative refinement processes, adaptation strategies, and innovation practices.', 'refresh-cw', 'pink', 30, '["8"]')
ON CONFLICT (phase_number) DO NOTHING;

-- Seed steps for Phase 1: Church Profile (3 steps)
INSERT INTO clergy_steps (phase_id, step_number, title, description, type, is_required, estimated_minutes) 
SELECT 
  p.id, 
  1, 
  'Denomination & Affiliation', 
  'Record your church''s denomination and any affiliations.', 
  'form', 
  TRUE,
  15
FROM clergy_phases p WHERE p.phase_number = 1
ON CONFLICT (phase_id, step_number) DO NOTHING;

INSERT INTO clergy_steps (phase_id, step_number, title, description, type, is_required, estimated_minutes) 
SELECT 
  p.id, 
  2, 
  'Church Size & Demographics', 
  'Document average attendance and member demographics.', 
  'form', 
  TRUE,
  20
FROM clergy_phases p WHERE p.phase_number = 1
ON CONFLICT (phase_id, step_number) DO NOTHING;

INSERT INTO clergy_steps (phase_id, step_number, title, description, type, is_required, estimated_minutes) 
SELECT 
  p.id, 
  3, 
  'Core Beliefs & Statement of Faith', 
  'Define your church''s theological foundations and core beliefs.', 
  'document', 
  TRUE,
  45
FROM clergy_phases p WHERE p.phase_number = 1
ON CONFLICT (phase_id, step_number) DO NOTHING;

-- Seed steps for Phase 2: Community Assessment (3 steps)
INSERT INTO clergy_steps (phase_id, step_number, title, description, type, is_required, estimated_minutes) 
SELECT 
  p.id, 
  1, 
  'Demographic Research', 
  'Research local population demographics, age distribution, and trends.', 
  'survey', 
  TRUE,
  60
FROM clergy_phases p WHERE p.phase_number = 2
ON CONFLICT (phase_id, step_number) DO NOTHING;

INSERT INTO clergy_steps (phase_id, step_number, title, description, type, is_required, estimated_minutes) 
SELECT 
  p.id, 
  2, 
  'Needs Assessment', 
  'Identify community needs, challenges, and opportunities.', 
  'survey', 
  TRUE,
  90
FROM clergy_phases p WHERE p.phase_number = 2
ON CONFLICT (phase_id, step_number) DO NOTHING;

INSERT INTO clergy_steps (phase_id, step_number, title, description, type, is_required, estimated_minutes) 
SELECT 
  p.id, 
  3, 
  'Competitive Landscape', 
  'Map existing ministries and service gaps in the community.', 
  'form', 
  FALSE,
  45
FROM clergy_phases p WHERE p.phase_number = 2
ON CONFLICT (phase_id, step_number) DO NOTHING;

-- Seed steps for Phase 3: Vision & Mission (3 steps)
INSERT INTO clergy_steps (phase_id, step_number, title, description, type, is_required, estimated_minutes) 
SELECT 
  p.id, 
  1, 
  'Vision Statement', 
  'Craft a compelling vision statement for the future.', 
  'document', 
  TRUE,
  90
FROM clergy_phases p WHERE p.phase_number = 3
ON CONFLICT (phase_id, step_number) DO NOTHING;

INSERT INTO clergy_steps (phase_id, step_number, title, description, type, is_required, estimated_minutes) 
SELECT 
  p.id, 
  2, 
  'Mission Statement', 
  'Define your church''s core mission and purpose.', 
  'document', 
  TRUE,
  60
FROM clergy_phases p WHERE p.phase_number = 3
ON CONFLICT (phase_id, step_number) DO NOTHING;

INSERT INTO clergy_steps (phase_id, step_number, title, description, type, is_required, estimated_minutes) 
SELECT 
  p.id, 
  3, 
  'Core Values', 
  'Identify and articulate your church''s core values.', 
  'document', 
  TRUE,
  60
FROM clergy_phases p WHERE p.phase_number = 3
ON CONFLICT (phase_id, step_number) DO NOTHING;

-- Seed steps for Phase 4-9 (simplified for brevity, you can expand)
INSERT INTO clergy_steps (phase_id, step_number, title, description, type, is_required, estimated_minutes) 
SELECT 
  p.id, 
  1, 
  'Ministry Structure Design', 
  'Design organizational structure and roles.', 
  'document', 
  TRUE,
  120
FROM clergy_phases p WHERE p.phase_number = 4
ON CONFLICT (phase_id, step_number) DO NOTHING;

INSERT INTO clergy_steps (phase_id, step_number, title, description, type, is_required, estimated_minutes) 
SELECT 
  p.id, 
  1, 
  'Program Design', 
  'Develop specific ministry programs.', 
  'document', 
  TRUE,
  180
FROM clergy_phases p WHERE p.phase_number = 5
ON CONFLICT (phase_id, step_number) DO NOTHING;

INSERT INTO clergy_steps (phase_id, step_number, title, description, type, is_required, estimated_minutes) 
SELECT 
  p.id, 
  1, 
  'Resource Planning', 
  'Plan budgets and resource allocation.', 
  'document', 
  TRUE,
  120
FROM clergy_phases p WHERE p.phase_number = 6
ON CONFLICT (phase_id, step_number) DO NOTHING;

INSERT INTO clergy_steps (phase_id, step_number, title, description, type, is_required, estimated_minutes) 
SELECT 
  p.id, 
  1, 
  'Implementation Timeline', 
  'Create detailed implementation timeline.', 
  'document', 
  TRUE,
  90
FROM clergy_phases p WHERE p.phase_number = 7
ON CONFLICT (phase_id, step_number) DO NOTHING;

INSERT INTO clergy_steps (phase_id, step_number, title, description, type, is_required, estimated_minutes) 
SELECT 
  p.id, 
  1, 
  'Evaluation Metrics', 
  'Establish evaluation and monitoring systems.', 
  'document', 
  TRUE,
  90
FROM clergy_phases p WHERE p.phase_number = 8
ON CONFLICT (phase_id, step_number) DO NOTHING;

INSERT INTO clergy_steps (phase_id, step_number, title, description, type, is_required, estimated_minutes) 
SELECT 
  p.id, 
  1, 
  'Improvement Processes', 
  'Develop continuous improvement frameworks.', 
  'document', 
  TRUE,
  120
FROM clergy_phases p WHERE p.phase_number = 9
ON CONFLICT (phase_id, step_number) DO NOTHING;

