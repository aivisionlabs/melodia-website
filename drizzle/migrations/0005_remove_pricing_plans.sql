-- =====================================================
-- REMOVE PRICING_PLANS TABLE MIGRATION
-- =====================================================
-- This migration removes the pricing_plans table and all related data
-- Date: 2025-01-04
-- =====================================================

-- Step 1: Drop the trigger first (if it exists)
DROP TRIGGER IF EXISTS update_pricing_plans_updated_at ON pricing_plans;

-- Step 2: Drop the pricing_plans table
-- Note: CASCADE will handle any dependent objects
DROP TABLE IF EXISTS pricing_plans CASCADE;

-- Step 3: Verify the table has been removed
SELECT
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'pricing_plans';

-- If the query returns no rows, the table has been successfully removed
