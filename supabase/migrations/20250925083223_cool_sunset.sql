-- Step 2: Create upload policies
CREATE POLICY "Allow upload gallery images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'gallery-images');

CREATE POLICY "Allow upload gallery videos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'gallery-videos');

CREATE POLICY "Allow upload background videos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'background-videos');