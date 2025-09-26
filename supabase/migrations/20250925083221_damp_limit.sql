-- Step 1: Create basic read policies for public access
CREATE POLICY "Public read gallery images" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery-images');

CREATE POLICY "Public read gallery videos" ON storage.objects  
  FOR SELECT USING (bucket_id = 'gallery-videos');

CREATE POLICY "Public read background videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'background-videos');