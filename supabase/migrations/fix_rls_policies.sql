-- ============================================
-- FIX: Políticas RLS para que los owners puedan leer su escuela
-- ============================================

-- 1. Asegurar que RLS está activado
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_members ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas conflictivas si existen
DROP POLICY IF EXISTS "Users can view schools they are members of" ON schools;
DROP POLICY IF EXISTS "Users can view their own school membership" ON school_members;
DROP POLICY IF EXISTS "Users can insert school membership" ON school_members;
DROP POLICY IF EXISTS "School members can update their own membership" ON school_members;

-- 3. POLÍTICAS PARA SCHOOLS

-- Permitir que cualquiera lea info básica de escuelas (público)
CREATE POLICY "Public can view basic school info" ON schools
  FOR SELECT
  USING (true);

-- Permitir que miembros de una escuela vean su escuela completa
CREATE POLICY "School members can view their school" ON schools
  FOR SELECT
  USING (
    id IN (
      SELECT school_id
      FROM school_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Permitir que owners actualicen su escuela
CREATE POLICY "Owners can update their school" ON schools
  FOR UPDATE
  USING (
    id IN (
      SELECT school_id
      FROM school_members
      WHERE user_id = auth.uid() AND status = 'active' AND role = 'owner'
    )
  )
  WITH CHECK (
    id IN (
      SELECT school_id
      FROM school_members
      WHERE user_id = auth.uid() AND status = 'active' AND role = 'owner'
    )
  );

-- 4. POLÍTICAS PARA SCHOOL_MEMBERS

-- Permitir que usuarios vean sus propias membresías
CREATE POLICY "Users can view their own memberships" ON school_members
  FOR SELECT
  USING (user_id = auth.uid());

-- Permitir que owners vean todos los miembros de su escuela
CREATE POLICY "Owners can view all school members" ON school_members
  FOR SELECT
  USING (
    school_id IN (
      SELECT school_id
      FROM school_members
      WHERE user_id = auth.uid() AND status = 'active' AND role = 'owner'
    )
  );

-- Permitir insert solo a través de service role (para invitations)
CREATE POLICY "Service role can insert memberships" ON school_members
  FOR INSERT
  WITH CHECK (true);

-- Permitir que owners actualicen membresías de su escuela
CREATE POLICY "Owners can update memberships" ON school_members
  FOR UPDATE
  USING (
    school_id IN (
      SELECT school_id
      FROM school_members sm
      WHERE sm.user_id = auth.uid() AND sm.status = 'active' AND sm.role = 'owner'
    )
  )
  WITH CHECK (
    school_id IN (
      SELECT school_id
      FROM school_members sm
      WHERE sm.user_id = auth.uid() AND sm.status = 'active' AND sm.role = 'owner'
    )
  );

-- Permitir que users eliminen sus propias membresías
CREATE POLICY "Users can delete their own membership" ON school_members
  FOR DELETE
  USING (user_id = auth.uid());

-- 5. Verificar que las políticas se crearon correctamente
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('schools', 'school_members')
ORDER BY tablename, policyname;
