-- Add DELETE policies to allow users to unsubscribe bundles, modules, and agents

-- Ensure RLS is enabled (harmless if already enabled)
ALTER TABLE church_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_agents ENABLE ROW LEVEL SECURITY;

-- church_bundles: allow users to delete bundles from their church
DROP POLICY IF EXISTS "Users can delete bundles from their church" ON church_bundles;
CREATE POLICY "Users can delete bundles from their church"
  ON church_bundles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.church_id = church_bundles.church_id
      AND profiles.id = auth.uid()
    )
  );

-- church_modules: allow users to delete modules for their own church
DROP POLICY IF EXISTS "Users can delete their church modules" ON church_modules;
CREATE POLICY "Users can delete their church modules"
  ON church_modules FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.church_id = church_modules.church_id
      AND profiles.id = auth.uid()
    )
  );

-- church_agents: allow users to delete agents for their own church
DROP POLICY IF EXISTS "Users can delete their church agents" ON church_agents;
CREATE POLICY "Users can delete their church agents"
  ON church_agents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.church_id = church_agents.church_id
      AND profiles.id = auth.uid()
    )
  );
