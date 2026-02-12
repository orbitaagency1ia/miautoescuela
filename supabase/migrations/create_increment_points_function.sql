-- RPC function to safely increment/decrement activity points
-- This function bypasses RLS and allows safe updates to activity_points

CREATE OR REPLACE FUNCTION increment_activity_points(
    p_user_id UUID,
    p_delta INTEGER
)
RETURNS INTEGER AS $$
DECLARE
    v_current_points INTEGER;
    v_new_points INTEGER;
BEGIN
    -- Get current points
    SELECT COALESCE(activity_points, 0) INTO v_current_points
    FROM profiles
    WHERE user_id = p_user_id;

    -- If profile doesn't exist, create it first
    IF NOT FOUND THEN
        v_current_points := 0;
        INSERT INTO profiles (user_id, full_name, activity_points)
        VALUES (
            p_user_id,
            COALESCE(
                (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = p_user_id),
                (SELECT email FROM auth.users WHERE id = p_user_id),
                'Usuario'
            ),
            0
        );
    END IF;

    -- Calculate new points (ensure it doesn't go below 0)
    v_new_points := GREATEST(0, v_current_points + p_delta);

    -- Update the points
    UPDATE profiles
    SET activity_points = v_new_points,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    RETURN v_new_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_activity_points(UUID, INTEGER) TO authenticated;
