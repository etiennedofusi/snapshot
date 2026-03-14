-- Storage bucket for product photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "auth_users_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'products');

-- Allow public read
CREATE POLICY "public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'products');

-- Allow owners to delete their own files
CREATE POLICY "auth_users_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'products');
