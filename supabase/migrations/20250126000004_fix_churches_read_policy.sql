-- Fix churches policies to allow authenticated users to create churches during signup
-- This is needed for clergy signup flow

-- First, drop ALL existing policies on churches table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'churches') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON churches';
    END LOOP;
END $$;

-- Allow public to read churches (for signup dropdown)
CREATE POLICY "Allow public read churches"
  ON churches FOR SELECT
  USING (true);

-- Allow authenticated users to insert churches (for clergy signup)
CREATE POLICY "Allow authenticated insert churches"
  ON churches FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only admins can update churches
CREATE POLICY "Only admins can update churches"
  ON churches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Only admins can delete churches
CREATE POLICY "Only admins can delete churches"
  ON churches FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

