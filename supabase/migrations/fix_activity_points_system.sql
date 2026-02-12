-- Fix activity points system
-- Ensure all profiles have activity_points and proper RLS policies

-- 1. Ensure activity_points column exists with default value
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'activity_points'
    ) THEN
        ALTER TABLE profiles ADD COLUMN activity_points INTEGER DEFAULT 0;
    END IF;
END $$;

-- 2. Update any existing profiles that have NULL activity_points
UPDATE profiles
SET activity_points = 0
WHERE activity_points IS NULL;

-- 3. Create index if not exists
CREATE INDEX IF NOT EXISTS idx_profiles_activity_points ON profiles(activity_points DESC);

-- 4. Add comment
COMMENT ON COLUMN profiles.activity_points IS 'Total activity points earned by the user through completing lessons, posting in forum, etc.';

-- 5. Ensure RLS policy allows users to update their own activity_points
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 6. Ensure RLS policy allows users to view their own activity_points
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());
