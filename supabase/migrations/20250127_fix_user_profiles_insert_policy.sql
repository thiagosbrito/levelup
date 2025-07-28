-- Fix user profile creation by adding missing INSERT policies
-- 
-- Issue: Users can register in auth.users but user profile creation fails
-- Root cause: RLS policies only allow SELECT/UPDATE, missing INSERT policy
-- Solution: Add INSERT policies for both authenticated users and service role

-- Allow authenticated users to insert their own profile (for the trigger)
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Allow service role to insert user profiles (backup for triggers)
CREATE POLICY "Service role can insert user profiles" ON user_profiles
    FOR INSERT 
    TO service_role
    WITH CHECK (true);