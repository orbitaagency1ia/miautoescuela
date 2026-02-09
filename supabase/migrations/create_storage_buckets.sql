-- ============================================
-- Crear Buckets de Storage para Logos y Banners
-- Ejecutar esto en el SQL Editor de Supabase
-- ============================================

-- 1. Insertar la extensión de storage si no existe
INSERT INTO extensions (name) VALUES ('storage') ON CONFLICT (name) DO NOTHING;

-- 2. Crear bucket para logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'school-logos',
  'school-logos',
  true,
  2097152, -- 2MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

-- 3. Crear bucket para banners
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'school-banners',
  'school-banners',
  true,
  5242880, -- 5MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

-- 4. Políticas RLS para school-logos

-- Permitir que cualquiera vea logos (público)
CREATE POLICY IF NOT EXISTS "Public can view logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'school-logos');

-- Permitir que authenticated suban logos si son owners
CREATE POLICY IF NOT EXISTS "Owners can upload logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'school-logos' AND
  auth.uid() IN (
    SELECT user_id FROM school_members
    WHERE school_id = (storage.foldername(name))[1]::uuid
    AND role = 'owner' AND status = 'active'
  )
);

-- Permitir que owners actualicen (reemplacen) logos
CREATE POLICY IF NOT EXISTS "Owners can update logos"
ON storage.objects FOR UPDATE
WITH CHECK (
  bucket_id = 'school-logos' AND
  auth.uid() IN (
    SELECT user_id FROM school_members
    WHERE school_id = (storage.foldername(name))[1]::uuid
    AND role = 'owner' AND status = 'active'
  )
);

-- Permitir que owners eliminen logos
CREATE POLICY IF NOT EXISTS "Owners can delete logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'school-logos' AND
  auth.uid() IN (
    SELECT user_id FROM school_members
    WHERE school_id = (storage.foldername(name))[1]::uuid
    AND role = 'owner' AND status = 'active'
  )
);

-- 5. Políticas RLS para school-banners

-- Permitir que cualquiera vea banners (público)
CREATE POLICY IF NOT EXISTS "Public can view banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'school-banners');

-- Permitir que authenticated suban banners si son owners
CREATE POLICY IF NOT EXISTS "Owners can upload banners"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'school-banners' AND
  auth.uid() IN (
    SELECT user_id FROM school_members
    WHERE school_id = (storage.foldername(name))[1]::uuid
    AND role = 'owner' AND status = 'active'
  )
);

-- Permitir que owners actualicen (reemplacen) banners
CREATE POLICY IF NOT EXISTS "Owners can update banners"
ON storage.objects FOR UPDATE
WITH CHECK (
  bucket_id = 'school-banners' AND
  auth.uid() IN (
    SELECT user_id FROM school_members
    WHERE school_id = (storage.foldername(name))[1]::uuid
    AND role = 'owner' AND status = 'active'
  )
);

-- Permitir que owners eliminen banners
CREATE POLICY IF NOT EXISTS "Owners can delete banners"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'school-banners' AND
  auth.uid() IN (
    SELECT user_id FROM school_members
    WHERE school_id = (storage.foldername(name))[1]::uuid
    AND role = 'owner' AND status = 'active'
  )
);

-- 6. Verificar que los buckets se crearon correctamente
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id IN ('school-logos', 'school-banners');
