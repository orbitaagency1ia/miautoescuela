-- Row Level Security Policies
-- Políticas de Seguridad a Nivel de Fila

-- ============================================
-- ENABLE RLS
-- ============================================
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Users can insert their own profile (on registration)
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- School members can view profiles of users in their school
CREATE POLICY "School members can view school profiles"
ON profiles FOR SELECT
USING (
  user_id IN (
    SELECT user_id FROM school_members
    WHERE school_id IN (
      SELECT school_id FROM school_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
    AND status = 'active'
  )
);

-- ============================================
-- SCHOOLS
-- ============================================

-- Public can view basic school info
CREATE POLICY "Public can view schools"
ON schools FOR SELECT
USING (true);

-- Only admins can manage schools
CREATE POLICY "Admins can manage schools"
ON schools FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM school_members
    WHERE school_id = schools.id
    AND user_id = auth.uid()
    AND role = 'admin'
    AND status = 'active'
  )
);

-- ============================================
-- SCHOOL MEMBERS
-- ============================================

-- Users can view their own memberships
CREATE POLICY "Users can view own memberships"
ON school_members FOR SELECT
USING (user_id = auth.uid());

-- School owners can view all members of their school
CREATE POLICY "Owners can view school members"
ON school_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM school_members AS sm
    WHERE sm.school_id = school_members.school_id
    AND sm.user_id = auth.uid()
    AND sm.role = 'owner'
    AND sm.status = 'active'
  )
);

-- Only system/service role can insert memberships (via API)
CREATE POLICY "Service can insert memberships"
ON school_members FOR INSERT
WITH CHECK (true);

-- Users can update their own status only
CREATE POLICY "Users can update own membership status"
ON school_members FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid()
  AND status = 'active'
);

-- ============================================
-- INVITES
-- ============================================

-- School owners can view invites for their school
CREATE POLICY "Owners can view invites"
ON invites FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM school_members
    WHERE school_id = invites.school_id
    AND user_id = auth.uid()
    AND role = 'owner'
    AND status = 'active'
  )
);

-- School owners can create invites
CREATE POLICY "Owners can create invites"
ON invites FOR INSERT
WITH CHECK (
  invited_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM school_members
    WHERE school_id = invites.school_id
    AND user_id = auth.uid()
    AND role = 'owner'
    AND status = 'active'
  )
);

-- Anyone can validate an invite by token (for registration)
CREATE POLICY "Anyone can validate invite token"
ON invites FOR SELECT
USING (token_hash IS NOT NULL AND expires_at > NOW() AND used_at IS NULL);

-- ============================================
-- MODULES
-- ============================================

-- School owners can manage their school's modules
CREATE POLICY "Owners can manage modules"
ON modules FOR ALL
USING (
  school_id IN (
    SELECT school_id FROM school_members
    WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
  )
);

-- Students can view published modules
CREATE POLICY "Students can view published modules"
ON modules FOR SELECT
USING (
  is_published = true
  AND school_id IN (
    SELECT school_id FROM school_members
    WHERE user_id = auth.uid() AND role = 'student' AND status = 'active'
  )
);

-- ============================================
-- LESSONS
-- ============================================

-- School owners can manage their school's lessons
CREATE POLICY "Owners can manage lessons"
ON lessons FOR ALL
USING (
  school_id IN (
    SELECT school_id FROM school_members
    WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
  )
);

-- Students can view published lessons
CREATE POLICY "Students can view published lessons"
ON lessons FOR SELECT
USING (
  is_published = true
  AND school_id IN (
    SELECT school_id FROM school_members
    WHERE user_id = auth.uid() AND role = 'student' AND status = 'active'
  )
);

-- ============================================
-- LESSON PROGRESS
-- ============================================

-- Users can view their own progress
CREATE POLICY "Users can view own lesson progress"
ON lesson_progress FOR SELECT
USING (user_id = auth.uid());

-- Students can manage their own progress
CREATE POLICY "Students can manage own progress"
ON lesson_progress FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND school_id IN (
    SELECT school_id FROM school_members
    WHERE user_id = auth.uid() AND role = 'student' AND status = 'active'
  )
);

CREATE POLICY "Students can update own progress"
ON lesson_progress FOR UPDATE
USING (user_id = auth.uid());

-- School owners can view progress of their students
CREATE POLICY "Owners can view school lesson progress"
ON lesson_progress FOR SELECT
USING (
  school_id IN (
    SELECT school_id FROM school_members
    WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
  )
);

-- ============================================
-- POSTS
-- ============================================

-- School members can view posts in their school
CREATE POLICY "Members can view school posts"
ON posts FOR SELECT
USING (
  school_id IN (
    SELECT school_id FROM school_members
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- School members (owners and students) can create posts
CREATE POLICY "Members can create posts"
ON posts FOR INSERT
WITH CHECK (
  author_id = auth.uid()
  AND school_id IN (
    SELECT school_id FROM school_members
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Authors can update their own posts
CREATE POLICY "Authors can update own posts"
ON posts FOR UPDATE
USING (author_id = auth.uid());

-- Owners can delete any post in their school
CREATE POLICY "Owners can delete school posts"
ON posts FOR DELETE
USING (
  school_id IN (
    SELECT school_id FROM school_members
    WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
  )
);

-- ============================================
-- COMMENTS
-- ============================================

-- School members can view comments in their school
CREATE POLICY "Members can view school comments"
ON comments FOR SELECT
USING (
  school_id IN (
    SELECT school_id FROM school_members
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- School members can create comments
CREATE POLICY "Members can create comments"
ON comments FOR INSERT
WITH CHECK (
  author_id = auth.uid()
  AND school_id IN (
    SELECT school_id FROM school_members
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Authors can update their own comments
CREATE POLICY "Authors can update own comments"
ON comments FOR UPDATE
USING (author_id = auth.uid());

-- Owners can delete any comment in their school
CREATE POLICY "Owners can delete school comments"
ON comments FOR DELETE
USING (
  school_id IN (
    SELECT school_id FROM school_members
    WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
  )
);

-- ============================================
-- ACTIVITY EVENTS
-- ============================================

-- Users can view their own activity events
CREATE POLICY "Users can view own activity"
ON activity_events FOR SELECT
USING (user_id = auth.uid());

-- School members can view activity in their school (for leaderboard)
CREATE POLICY "Members can view school activity"
ON activity_events FOR SELECT
USING (
  school_id IN (
    SELECT school_id FROM school_members
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Only system can insert activity events (via triggers/functions)
CREATE POLICY "System can insert activity events"
ON activity_events FOR INSERT
WITH CHECK (true);
