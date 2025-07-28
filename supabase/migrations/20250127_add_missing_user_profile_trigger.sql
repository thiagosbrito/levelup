-- Add missing trigger for automatic user profile creation
-- 
-- Issue: Users register in auth.users but trigger to create user_profiles is missing
-- Root cause: Trigger was defined in schema but not actually created in database
-- Solution: Create the missing trigger

-- Create trigger to automatically create user profile when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();