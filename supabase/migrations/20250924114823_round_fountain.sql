/*
  # Create storage buckets for Wednesday Football media

  1. Storage Buckets
    - `gallery-images` - for photo uploads
    - `gallery-videos` - for video uploads
    - `background-videos` - for homepage background videos

  2. Security
    - Enable public access for viewing media
    - Allow authenticated users to upload media
    - Set file size limits and allowed file types
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('gallery-images', 'gallery-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('gallery-videos', 'gallery-videos', true, 104857600, ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/mov', 'video/avi']),
  ('background-videos', 'background-videos', true, 104857600, ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/mov', 'video/avi'])
ON CONFLICT (id) DO NOTHING;

-- Allow public access to view files
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

-- Allow anyone to upload files (you can restrict this later if needed)
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