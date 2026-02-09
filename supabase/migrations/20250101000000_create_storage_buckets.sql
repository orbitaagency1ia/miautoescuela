-- Create storage buckets for school logos and banners
-- First, we need to insert into storage.buckets
-- Note: This may need to be done manually in Supabase dashboard as storage buckets
-- are managed separately from the database

-- Insert storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('school-logos', 'school-logos', true),
  ('school-banners', 'school-banners', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for school-logos
-- Only owners can upload logos for their schools
CREATE POLICY "Owners can upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'school-logos'
  AND (
    EXISTS (
      SELECT 1 FROM school_members sm
      JOIN schools s ON s.id = sm.school_id
      WHERE sm.user_id = auth.uid()
      AND sm.role = 'owner'
      AND sm.status = 'active'
      AND s.id = (storage.foldername(text name))[1]
    )
  )
);

-- Anyone can view logos (public)
CREATE POLICY "Public can view logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'school-logos');

-- Owners can delete their school logos
CREATE POLICY "Owners can delete logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'school-logos'
  AND (
    EXISTS (
      SELECT 1 FROM school_members sm
      JOIN schools s ON s.id = sm.school_id
      WHERE sm.user_id = auth.uid()
      AND sm.role = 'owner'
      AND sm.status = 'active'
      AND s.id = (storage.foldername(text name))[1]
    )
  )
);

-- Create policies for school-banners
-- Only owners can upload banners for their schools
CREATE POLICY "Owners can upload banners"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'school-banners'
  AND (
    EXISTS (
      SELECT 1 FROM school_members sm
      JOIN schools s ON s.id = sm.school_id
      WHERE sm.user_id = auth.uid()
      AND sm.role = 'owner'
      AND sm.status = 'active'
      AND s.id = (storage.foldername(text name))[1]
    )
  )
);

-- Anyone can view banners (public)
CREATE POLICY "Public can view banners"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'school-banners');

-- Owners can delete their school banners
CREATE POLICY "Owners can delete banners"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'school-banners'
  AND (
    EXISTS (
      SELECT 1 FROM school_members sm
      JOIN schools s ON s.id = sm.school_id
      WHERE sm.user_id = auth.uid()
      AND sm.role = 'owner'
      AND sm.status = 'active'
      AND s.id = (storage.foldername(text name))[1]
    )
  )
);
