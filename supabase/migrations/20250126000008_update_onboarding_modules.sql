-- Update onboarding modules: Remove old modules and add new ones

-- First, delete the old modules that should be removed
DELETE FROM church_modules WHERE module_name IN (
  'Pastoral Care System',
  'Volunteer Management',
  'Intelligent Micro-Volunteering',
  'Communication System',
  'Proactive Pastoral Care',
  'New Member Engagement & Onboarding (NME&O)'
);

-- Delete agents associated with deleted modules
DELETE FROM church_agents WHERE module_name IN (
  'Pastoral Care System',
  'Volunteer Management',
  'Intelligent Micro-Volunteering',
  'Communication System',
  'Proactive Pastoral Care',
  'New Member Engagement & Onboarding (NME&O)'
);

-- Note: This migration assumes modules are selected during onboarding and stored in church_modules table
-- The actual module selection happens in the Onboarding.tsx component
-- This SQL just cleans up old module references

-- If you want to pre-populate available modules for selection, you could create a reference table:
-- But since modules are selected via the Onboarding component, we'll keep the current approach

