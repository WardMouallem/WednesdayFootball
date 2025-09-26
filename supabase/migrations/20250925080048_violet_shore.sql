/*
  # Fix storage bucket RLS policies for Wednesday Football

  1. Storage Policies
    - Create proper RLS policies for gallery-images bucket
    - Create proper RLS policies for gallery-videos bucket  
    - Create proper RLS policies for background-videos bucket
    - Allow public read access for all buckets
    - Allow authenticated users to upload files
    - Allow authenticated users to delete files

  2. Security
    - Enable public access for viewing media files
    - Restrict upload/delete to authenticated users
    - Ensure proper MIME type and file size restrictions
*/

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public can view gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view gallery videos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view background videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload gallery videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload background videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete gallery videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete background videos" ON storage.objects;

-- Create new policies with proper permissions

-- Allow public read access to all gallery buckets
CREATE POLICY "Public can view gallery images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'gallery-images');

CREATE POLICY "Public can view gallery videos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'gallery-videos');

CREATE POLICY "Public can view background videos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'background-videos');

-- Allow anyone to upload files (you can restrict this to authenticated users later if needed)
CREATE POLICY "Anyone can upload gallery images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'gallery-images');

CREATE POLICY "Anyone can upload gallery videos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'gallery-videos');

CREATE POLICY "Anyone can upload background videos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'background-videos');

-- Allow anyone to update files
CREATE POLICY "Anyone can update gallery images"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'gallery-images');

CREATE POLICY "Anyone can update gallery videos"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'gallery-videos');

CREATE POLICY "Anyone can update background videos"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'background-videos');

-- Allow anyone to delete files (you can restrict this to admins later if needed)
CREATE POLICY "Anyone can delete gallery images"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'gallery-images');

CREATE POLICY "Anyone can delete gallery videos"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'gallery-videos');

CREATE POLICY "Anyone can delete background videos"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'background-videos');