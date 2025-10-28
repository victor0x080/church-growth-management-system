-- Add price column to agents and seed defaults
ALTER TABLE module_agents
ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2);

-- Seed a default price for agents that do not have one yet
UPDATE module_agents
SET price = 2.50
WHERE price IS NULL;
