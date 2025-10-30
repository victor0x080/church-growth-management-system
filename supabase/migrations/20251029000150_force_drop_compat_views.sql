-- Force-drop any lingering views/tables that conflict with compatibility views
-- This makes subsequent migrations idempotent regardless of prior state

-- Drop views first (safe if they don't exist)
DROP VIEW IF EXISTS available_modules CASCADE;
DROP VIEW IF EXISTS module_agents CASCADE;
DROP VIEW IF EXISTS bundles CASCADE;

-- Also drop tables if they exist with the same names
DROP TABLE IF EXISTS available_modules CASCADE;
DROP TABLE IF EXISTS module_agents CASCADE;
DROP TABLE IF EXISTS bundles CASCADE;


