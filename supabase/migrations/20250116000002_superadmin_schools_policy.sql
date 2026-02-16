-- Políticas RLS para permitir que superadmins vean todas las escuelas

-- Eliminar política anterior si existe
DROP POLICY IF EXISTS "Superadmins can view all schools" ON schools;

-- Permitir que superadmins vean todas las escuelas
-- Se verifica por email o por role en JWT
CREATE POLICY "Superadmins can view all schools"
ON schools FOR SELECT
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
