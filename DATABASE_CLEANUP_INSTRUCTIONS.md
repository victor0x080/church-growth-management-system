# Database Cleanup Instructions

## Issue
After deleting the database, old bundles, modules, and agents are still showing in the onboarding process because they are **hardcoded** in the source files.

## Current Status

### Database
- ✅ Migration created: `20250126000012_clear_existing_subscriptions.sql`
- This clears all bundles, modules, agents, and their relationships
- Uses `TRUNCATE` for fast cleanup

### Source Files (Still Need Updates)

1. **`src/pages/OnboardingStep1Modules.tsx`**
   - Has `MODULES` array with 27 hardcoded modules
   - **Status**: Started converting to load from database
   - **Needs**: Complete implementation to load from Supabase

2. **`src/pages/OnboardingStep2Agents.tsx`**
   - Has `MODULE_AGENTS` object with hardcoded agent configurations
   - **Status**: Still hardcoded
   - **Needs**: Convert to load from database

3. **`src/pages/OnboardingStep3Bundles.tsx`**
   - Already loads bundles from database ✅
   - Will show empty state after cleanup

## What to Do Next

### Option 1: Keep Hardcoded (Quick Fix)
1. **Revert** the changes to `OnboardingStep1Modules.tsx`
2. Keep the hardcoded `MODULES` array
3. Update the module names to match your new database

### Option 2: Database-Driven (Recommended)
1. Create a new table `available_modules`:
   ```sql
   CREATE TABLE available_modules (
     id UUID PRIMARY KEY,
     module_name TEXT UNIQUE NOT NULL,
     module_price DECIMAL(10, 2),
     category TEXT,
     description TEXT
   );
   ```
2. Create a new table `module_agents`:
   ```sql
   CREATE TABLE module_agents (
     id UUID PRIMARY KEY,
     module_name TEXT NOT NULL,
     agent_name TEXT NOT NULL,
     agent_price DECIMAL(10, 2),
     required BOOLEAN DEFAULT false
   );
   ```
3. Update the onboarding pages to load from these tables
4. Seed the tables with your new data

### Option 3: Keep Current Structure, Just Replace Data
1. Run the cleanup migration
2. Create a new migration with your new bundles/modules/agents
3. Keep the onboarding pages as they are

## Recommended Approach

I recommend **Option 3** for now:

1. **Run the cleanup migration** to remove old data
2. **Create a new migration** `20250126000013_create_new_bundles.sql` with your new data
3. **The onboarding will show empty state** until you add data to the database

This is the fastest way to get started with new data without changing the existing code structure.

## Next Steps

1. Do you want me to create a template for `20250126000013_create_new_bundles.sql`?
2. Do you want me to revert the changes to `OnboardingStep1Modules.tsx`?
3. What modules/bundles do you want to add to the new database?

