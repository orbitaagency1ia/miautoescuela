-- Create school-assets storage bucket for logos and banners
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'school-assets',
  'school-assets',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create policies for school-assets bucket
-- Allow public read access
CREATE POLICY "school-assets-public-read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'school-assets');

-- Allow authenticated users to upload to their school folder
CREATE POLICY "school-assets-upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'school-assets' AND
  (storage.foldername(name))[1] = (
    SELECT school_id FROM school_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    LIMIT 1
  )
);

-- Allow school owners to update their assets
CREATE POLICY "school-assets-update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'school-assets' AND
  (storage.foldername(name))[1] = (
    SELECT school_id FROM school_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    LIMIT 1
  )
);

-- Allow school owners to delete their assets
CREATE POLICY "school-assets-delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'school-assets' AND
  (storage.foldername(name))[1] = (
    SELECT school_id FROM school_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    LIMIT 1
  )
);
