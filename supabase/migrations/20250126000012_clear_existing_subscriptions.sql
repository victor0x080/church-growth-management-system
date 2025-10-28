-- Clear all existing bundles, modules, and agents
-- This allows you to start fresh with new data

-- Note: After running this migration, you'll need to recreate your bundles
-- in a new migration (e.g., 20250126000013_create_new_bundles.sql)

-- Delete all church bundle subscriptions
TRUNCATE TABLE church_bundles CASCADE;

-- Delete all church module subscriptions
TRUNCATE TABLE church_modules CASCADE;

-- Delete all church agent subscriptions
TRUNCATE TABLE church_agents CASCADE;

-- Delete all bundle-module relationships
TRUNCATE TABLE bundle_modules CASCADE;

-- Delete all bundles
TRUNCATE TABLE bundles CASCADE;

