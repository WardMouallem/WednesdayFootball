/*
  # Fix storage policies for gallery buckets

  1. Storage Policies
    - Create public read policies for gallery buckets if they don't exist
    - Use IF NOT EXISTS equivalent for policies (DROP IF EXISTS + CREATE)
    
  2. Changes
    - Safely recreate policies to avoid duplicate errors
    - Ensure public read access for gallery-images, gallery-videos, and background-videos buckets
*/

-- Step 1: Drop existing policies if they exist (no error if they don't exist)
DROP POLICY IF EXISTS "Public read gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Public read gallery videos" ON storage.objects;
DROP POLICY IF EXISTS "Public read background videos" ON storage.objects;

-- Step 2: Create the policies fresh
CREATE POLICY "Public read gallery images" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery-images');

CREATE POLICY "Public read gallery videos" ON storage.objects  
  FOR SELECT USING (bucket_id = 'gallery-videos');

CREATE POLICY "Public read background videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'background-videos');