# Unsubscribe Logic Update

## Problem
When unsubscribing from a bundle, the related modules and agents were not being deleted. Similarly, when unsubscribing from a module, agents were not always being removed.

## Solution
Updated the unsubscribe logic to properly cascade deletions and handle edge cases.

## Changes Made

### 1. Bundle Unsubscribe (`handleUnsubscribeBundle`)

**Old Behavior:**
- Only deleted the bundle from `church_bundles` table
- Left modules and agents in place

**New Behavior:**
1. Get all modules included in the bundle being unsubscribed
2. Delete the bundle from `church_bundles`
3. **Smart Module Deletion:**
   - For each module in the bundle, check if it exists in any other active bundle
   - Only delete modules that are NOT in any other bundle
   - This prevents deleting modules that are still needed in other bundles
4. Delete the module from `church_modules`
5. Delete all agents associated with that module from `church_agents`

**Example:**
```
User has:
- Bundle A: [Module 1, Module 2, Module 3]
- Bundle B: [Module 2, Module 4]

If user unsubscribes from Bundle A:
- Module 1 and Module 3 are deleted (only in Bundle A)
- Module 2 is NOT deleted (it's in Bundle B)
- All agents for Module 1 and Module 3 are deleted
```

### 2. Module Unsubscribe (`handleUnsubscribeModule`)

**Behavior (already working):**
1. Delete the module from `church_modules`
2. Delete all agents associated with that module from `church_agents`

### 3. Agent Unsubscribe (`handleUnsubscribeAgent`)

**Behavior (already working):**
1. Delete the specific agent from `church_agents`

## Database Operations

### Unsubscribe Bundle:
```sql
-- 1. Delete bundle
DELETE FROM church_bundles WHERE church_id = ? AND bundle_id = ?

-- 2. For each module (that's only in this bundle):
DELETE FROM church_modules WHERE church_id = ? AND module_name = ?
DELETE FROM church_agents WHERE church_id = ? AND module_name = ?
```

### Unsubscribe Module:
```sql
-- 1. Delete module
DELETE FROM church_modules WHERE id = ?

-- 2. Delete all agents for this module
DELETE FROM church_agents WHERE church_id = ? AND module_name = ?
```

### Unsubscribe Agent:
```sql
-- 1. Delete agent
DELETE FROM church_agents WHERE id = ?
```

## User Experience

### Before:
- Unsubscribe bundle → Modules still visible
- Unsubscribe bundle → Agents still visible
- Confusing for users

### After:
- Unsubscribe bundle → Modules removed (unless in other bundles)
- Unsubscribe bundle → Agents removed
- Clean, predictable behavior

## Edge Cases Handled

1. **Module in Multiple Bundles**: 
   - If user unsubscribes from Bundle A, but the module is also in Bundle B
   - The module is NOT deleted
   - Prevents accidental loss of modules

2. **Agents Cleanup**:
   - When a module is deleted, all its agents are automatically deleted
   - Prevents orphaned agents

3. **Reload After Action**:
   - Data is reloaded after unsubscribe
   - UI updates to reflect changes
   - Toast notifications inform users

## Benefits

1. **Data Integrity**: No orphaned modules or agents
2. **Smart Cleanup**: Preserves modules that are in multiple bundles
3. **User-Friendly**: Clear, predictable behavior
4. **Complete Removal**: Truly unsubscribes when user expects it to

