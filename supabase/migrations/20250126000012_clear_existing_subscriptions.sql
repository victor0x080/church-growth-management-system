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

-- Delete all bundle-module relationships (if table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'bundle_modules' AND table_type = 'BASE TABLE'
  ) THEN
    TRUNCATE TABLE bundle_modules CASCADE;
  END IF;

  -- Delete all bundles: if 'bundles' is a table, truncate; if it's a view, clear the underlying table
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'bundles' AND table_type = 'BASE TABLE'
  ) THEN
    TRUNCATE TABLE bundles CASCADE;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'catalog_bundles' AND table_type = 'BASE TABLE'
  ) THEN
    DELETE FROM catalog_bundles;
  END IF;
END $$;

