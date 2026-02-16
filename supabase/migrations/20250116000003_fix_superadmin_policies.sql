-- Corregir políticas RLS para superadmins
-- Asegurar que los superadmins puedan ver todos los datos necesarios

-- Eliminar políticas anteriores de superadmin en profiles
DROP POLICY IF EXISTS "Superadmins can view profiles of school members" ON profiles;

-- Crear política simplificada para superadmins ver TODOS los perfiles
CREATE POLICY "Superadmins can view all profiles"
ON profiles FOR SELECT
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

-- Asegurar que la política de schools para superadmins tiene prioridad
-- Las políticas se evalúan en orden, y la primera que coincide se usa
-- Necesitamos recrear la política de superadmin con prioridad

-- Nota: La política "Public can view schools" ya existe y permite a cualquiera ver las escuelas
-- El problema es que los JOINs fallan si las políticas de las tablas relacionadas no permiten el acceso

-- Verificar que la política de superadmin para schools exista
-- (ya debería existir de la migración anterior)
