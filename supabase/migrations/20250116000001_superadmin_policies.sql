-- Políticas RLS para permitir que superadmins vean los miembros de todas las escuelas

-- Eliminar políticas anteriores si existen
DROP POLICY IF EXISTS "Superadmins can view all school members" ON school_members;
DROP POLICY IF EXISTS "Superadmins can view profiles of school members" ON profiles;

-- Permitir que superadmins vean todos los miembros de cualquier escuela
-- Se verifica por email o por role en JWT
CREATE POLICY "Superadmins can view all school members"
ON school_members FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (
      auth.users.email LIKE '%@miautoescuela.com'
      OR auth.users.email LIKE '%@admin.com'
      OR auth.users.email = 'kevinubeda231@gmail.com'
      OR (auth.jwt()::jsonb->>'role') = 'admin'
    )
  )
);

-- Permitir que superadmins vean los profiles de los miembros
CREATE POLICY "Superadmins can view profiles of school members"
ON profiles FOR SELECT
USING (
  user_id IN (
    SELECT user_id FROM school_members
  ) AND EXISTS (
    SELECT 1
    FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (
      auth.users.email LIKE '%@miautoescuela.com'
      OR auth.users.email LIKE '%@admin.com'
      OR auth.users.email = 'kevinubeda231@gmail.com'
      OR (auth.jwt()::jsonb->>'role') = 'admin'
    )
  )
);
