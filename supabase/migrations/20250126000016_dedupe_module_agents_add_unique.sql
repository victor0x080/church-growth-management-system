-- Remove duplicate rows in module_agents, keeping the earliest id per (module_name, agent_name)
WITH ranked AS (
  SELECT id,
         module_name,
         agent_name,
         ROW_NUMBER() OVER (PARTITION BY module_name, agent_name ORDER BY created_at, id) AS rn
  FROM module_agents
)
DELETE FROM module_agents ma
USING ranked r
WHERE ma.id = r.id
  AND r.rn > 1;

-- Add a unique constraint to prevent future duplicates
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'module_agents_module_name_agent_name_key'
  ) THEN
    ALTER TABLE module_agents
    ADD CONSTRAINT module_agents_module_name_agent_name_key UNIQUE (module_name, agent_name);
  END IF;
END $$;
