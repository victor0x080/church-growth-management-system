-- Seed bundles that group related modules together with discount pricing
-- Bundle prices are calculated to provide ~40-50% discount compared to individual module prices
INSERT INTO bundles (bundle_id, name, description, price) VALUES
('foundational-modules', 'Foundational Modules Bundle', 'Essential modules for church operations: Community Growth, Pastoral Care, and Communication', 199.99),
('pastoral-care-suite', 'Pastoral Care Suite', 'Comprehensive pastoral care and member engagement system', 179.99),
('content-engagement-hub', 'Content & Engagement Hub', 'AI-powered content management and social media suite', 149.99),
('volunteer-coordination', 'Volunteer Coordination Suite', 'Complete volunteer matching and micro-volunteering platform', 129.99),
('communication-platform', 'Communication Platform', 'Multi-channel communication and email management system', 99.99),
('new-member-suite', 'New Member Onboarding Suite', 'Everything you need to onboard and engage new members', 169.99),
('social-media-content', 'Social Media & Content Bundle', 'Social media management and content generation tools', 89.99),
('full-suite', 'Complete Church Management Suite', 'All modules included - best value for comprehensive church management', 799.99)
ON CONFLICT (bundle_id) DO UPDATE 
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      price = EXCLUDED.price;

-- Map modules to bundles
-- Foundational Modules bundle (Community Growth + Pastoral Care + Communication = $479.97 individual, $379.99 bundle)
INSERT INTO bundle_modules (bundle_id, module_name) VALUES
('foundational-modules', 'Community Growth and Strengthening'),
('foundational-modules', 'Proactive Pastoral Care Module'),
('foundational-modules', 'Communication and engagement')
ON CONFLICT (bundle_id, module_name) DO NOTHING;

-- Pastoral Care Suite bundle (Pastoral Care + New Member + Social Support = $449.97 individual, $349.99 bundle)
INSERT INTO bundle_modules (bundle_id, module_name) VALUES
('pastoral-care-suite', 'Proactive Pastoral Care Module'),
('pastoral-care-suite', 'New Member Engagement & Onboarding (NMEO)'),
('pastoral-care-suite', 'Social support')
ON CONFLICT (bundle_id, module_name) DO NOTHING;

-- Content & Engagement Hub bundle (RAG + Social Media + Communication = $319.97 individual, $289.99 bundle)
INSERT INTO bundle_modules (bundle_id, module_name) VALUES
('content-engagement-hub', 'Content Augmentation & Retrieval System (RAG)'),
('content-engagement-hub', 'Social Media Manager'),
('content-engagement-hub', 'Communication and engagement')
ON CONFLICT (bundle_id, module_name) DO NOTHING;

-- Volunteer Coordination Suite bundle (Micro-Volunteering + Intelligent = $289.98 individual, $259.99 bundle)
INSERT INTO bundle_modules (bundle_id, module_name) VALUES
('volunteer-coordination', 'Intelligent Micro-Volunteering Module'),
('volunteer-coordination', 'Micro-Volunteering')
ON CONFLICT (bundle_id, module_name) DO NOTHING;

-- Communication Platform bundle (Email + Communication = $209.98 individual, $179.99 bundle)
INSERT INTO bundle_modules (bundle_id, module_name) VALUES
('communication-platform', 'Email Management'),
('communication-platform', 'Communication and engagement')
ON CONFLICT (bundle_id, module_name) DO NOTHING;

-- New Member Onboarding Suite (New Member + Social Support = $299.98 individual, $319.99 bundle with Ministry Management)
INSERT INTO bundle_modules (bundle_id, module_name) VALUES
('new-member-suite', 'New Member Engagement & Onboarding (NMEO)'),
('new-member-suite', 'Social support'),
('new-member-suite', 'Ministry Management')
ON CONFLICT (bundle_id, module_name) DO NOTHING;

-- Social Media & Content Bundle (Social Media + Content RAG = $189.98 individual, $169.99 bundle)
INSERT INTO bundle_modules (bundle_id, module_name) VALUES
('social-media-content', 'Social Media Manager'),
('social-media-content', 'Content Augmentation & Retrieval System (RAG)')
ON CONFLICT (bundle_id, module_name) DO NOTHING;

-- Full Suite (All modules - $1529.92 individual, $1499.99 bundle)
INSERT INTO bundle_modules (bundle_id, module_name) VALUES
('full-suite', 'Community Growth and Strengthening'),
('full-suite', 'Proactive Pastoral Care Module'),
('full-suite', 'Intelligent Micro-Volunteering Module'),
('full-suite', 'Communication and engagement'),
('full-suite', 'Content Augmentation & Retrieval System (RAG)'),
('full-suite', 'Email Management'),
('full-suite', 'New Member Engagement & Onboarding (NMEO)'),
('full-suite', 'Social Media Manager'),
('full-suite', 'Ministry Management'),
('full-suite', 'Micro-Volunteering'),
('full-suite', 'Social support')
ON CONFLICT (bundle_id, module_name) DO NOTHING;

