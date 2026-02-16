-- Actualizar políticas RLS para gestión de suscripciones
-- Permitir que owners y admins gestionen las suscripciones de sus escuelas

-- Eliminar política anterior si existe
DROP POLICY IF EXISTS "Admins can view school members" ON school_members;

-- Permitir que admins también puedan ver todos los miembros de su escuela
CREATE POLICY "Admins can view school members"
ON school_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM school_members AS sm
    WHERE sm.school_id = school_members.school_id
    AND sm.user_id = auth.uid()
    AND sm.role IN ('owner', 'admin')
    AND sm.status = 'active'
  )
);

-- Eliminar política anterior de escuelas
DROP POLICY IF EXISTS "Admins can manage schools" ON schools;

-- Permitir que admins y owners gestionen escuelas
CREATE POLICY "Admins and owners can manage schools"
ON schools FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM school_members
    WHERE school_id = schools.id
    AND user_id = auth.uid()
    AND role IN ('admin', 'owner')
    AND status = 'active'
  )
);
