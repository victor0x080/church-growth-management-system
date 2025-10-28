-- Ensure price column exists before seeding
ALTER TABLE available_modules
ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2);
