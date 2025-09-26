-- Step 3: Create delete policies  
CREATE POLICY "Allow delete gallery images" ON storage.objects
  FOR DELETE USING (bucket_id = 'gallery-images');

CREATE POLICY "Allow delete gallery videos" ON storage.objects
  FOR DELETE USING (bucket_id = 'gallery-videos');

CREATE POLICY "Allow delete background videos" ON storage.objects
  FOR DELETE USING (bucket_id = 'background-videos');