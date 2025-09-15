-- Fix RLS policies to use proper authentication instead of USING(true)

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can view all crises" ON crises;
DROP POLICY IF EXISTS "Users can insert crises" ON crises;
DROP POLICY IF EXISTS "Users can update crises" ON crises;
DROP POLICY IF EXISTS "Users can view all activities" ON activities;
DROP POLICY IF EXISTS "Users can insert activities" ON activities;

-- Create proper role-based RLS policies for crises table
CREATE POLICY "Authenticated users can view crises" ON crises
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert crises" ON crises
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update crises" ON crises
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Create proper role-based RLS policies for activities table
CREATE POLICY "Authenticated users can view activities" ON activities
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert activities" ON activities
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');
