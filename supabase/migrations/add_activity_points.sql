-- Add activity_points column to profiles table
-- This column stores the total points a user has earned from various activities

-- Add the column with default value 0
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS activity_points INTEGER DEFAULT 0;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_activity_points ON profiles(activity_points DESC);

-- Add comment
COMMENT ON COLUMN profiles.activity_points IS 'Total activity points earned by the user through completing lessons, posting in forum, etc.';
