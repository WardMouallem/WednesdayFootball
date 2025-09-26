import { supabase } from './supabase';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

// Upload file to Supabase Storage
export async function uploadFile(
  file: File,
  bucket: 'gallery-images' | 'gallery-videos' | 'background-videos',
  path?: string
): Promise<UploadResult> {
  try {
    // Generate unique filename if path not provided
    const fileName = path || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.name}`;
    
    // Upload file to storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      
      // Handle specific bucket not found error
      if (error.message?.includes('Bucket not found') || error.message?.includes('bucket does not exist')) {
        return { 
          success: false, 
          error: `Storage bucket '${bucket}' not found. Please ensure the bucket is created in your Supabase project dashboard with public access enabled.` 
        };
      }
      
      // Handle permission errors
      if (error.message?.includes('permission') || error.message?.includes('policy')) {
        return { 
          success: false, 
          error: `Permission denied. Please ensure the storage bucket '${bucket}' has proper RLS policies configured.` 
        };
      }
      
      return { success: false, error: `Upload failed: ${error.message}` };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { 
      success: true, 
      url: urlData.publicUrl 
    };
  } catch (error) {
    console.error('Upload error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    };
  }
}

// Delete file from Supabase Storage
export async function deleteFile(
  bucket: 'gallery-images' | 'gallery-videos' | 'background-videos',
  path: string
): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}

// Extract file path from Supabase Storage URL
export function extractFilePathFromUrl(url: string, bucket: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === bucket);
    
    if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
      return pathParts.slice(bucketIndex + 1).join('/');
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting file path:', error);
    return null;
  }
}

// Check if URL is from Supabase Storage
export function isSupabaseStorageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('supabase.co') && urlObj.pathname.includes('/storage/v1/object/public/');
  } catch {
    return false;
  }
}