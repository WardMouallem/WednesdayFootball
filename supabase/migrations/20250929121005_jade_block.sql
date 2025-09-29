/*
  # Fix storage policies for gallery buckets

  1. Storage Policies
    - Create public read policies for gallery buckets if they don't exist
    - Use IF NOT EXISTS equivalent approach to avoid conflicts
    
  2. Changes
    - Drop existing policies if they exist before creating new ones
    - This ensures clean policy creation without conflicts
*/

-- Drop existing policies if they exist (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Public read gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Public read gallery videos" ON storage.objects;
DROP POLICY IF EXISTS "Public read background videos" ON storage.objects;

-- Create public read policies for gallery buckets
CREATE POLICY "Public read gallery images" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery-images');

CREATE POLICY "Public read gallery videos" ON storage.objects  
  FOR SELECT USING (bucket_id = 'gallery-videos');

CREATE POLICY "Public read background videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'background-videos');