-- Fix RLS policies for profiles table to allow user signup
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Allow authenticated users to insert their own profile during signup
CREATE POLICY "Allow authenticated users to insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Also need to add policy for user_roles table to allow signup  
-- Allow authenticated users to insert their own role during signup
CREATE POLICY "Allow users to insert own role"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

