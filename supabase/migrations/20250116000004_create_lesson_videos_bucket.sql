-- Crear bucket para videos de lecciones con tamaño aumentado

-- Insertar o actualizar el bucket de lesson-videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson-videos',
  'lesson-videos',
  false,
  5368709120, -- 5GB en bytes (5 * 1024 * 1024 * 1024)
  ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/mpeg']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 5368709120,
  allowed_mime_types = ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/mpeg'];

-- Eliminar políticas anteriores si existen
DROP POLICY IF EXISTS "Owners and admins can upload lesson videos" ON storage.objects;
DROP POLICY IF EXISTS "Students can view lesson videos" ON storage.objects;
DROP POLICY IF EXISTS "Owners and admins can delete lesson videos" ON storage.objects;

-- Función auxiliar para extraer el school_id del path del archivo
CREATE OR REPLACE FUNCTION extract_school_id_from_path(path text)
RETURNS text AS $$
BEGIN
  -- El formato del path es: schoolId/timestamp-filename.ext
  -- Extraemos la primera parte antes del primer '/'
  RETURN split_part(path, '/', 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Permitir que owners y admins suban videos para su escuela
CREATE POLICY "Owners and admins can upload lesson videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'lesson-videos'
  AND (
    EXISTS (
      SELECT 1 FROM school_members sm
      WHERE sm.user_id = auth.uid()
      AND sm.role IN ('owner', 'admin')
      AND sm.status = 'active'
      AND sm.school_id = extract_school_id_from_path(name)
    )
  )
);

-- Permitir que los estudiantes de la escuela vean los videos
CREATE POLICY "Students can view lesson videos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'lesson-videos'
  AND (
    EXISTS (
      SELECT 1 FROM school_members sm
      WHERE sm.user_id = auth.uid()
      AND sm.status = 'active'
      AND sm.school_id = extract_school_id_from_path(name)
    )
  )
);

-- Permitir que owners y admins eliminen videos de su escuela
CREATE POLICY "Owners and admins can delete lesson videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'lesson-videos'
  AND (
    EXISTS (
      SELECT 1 FROM school_members sm
      WHERE sm.user_id = auth.uid()
      AND sm.role IN ('owner', 'admin')
      AND sm.status = 'active'
      AND sm.school_id = extract_school_id_from_path(name)
    )
  )
);
