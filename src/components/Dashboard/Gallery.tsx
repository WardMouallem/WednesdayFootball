import React, { useState } from 'react';
import { Image as ImageIcon, Plus, X, Upload, ZoomIn, Video, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { uploadFile, deleteFile, extractFilePathFromUrl, isSupabaseStorageUrl } from '../../lib/storage';

export function Gallery() {
  const { currentUser, appData, updateAppData } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadType, setUploadType] = useState<'url' | 'file'>('url');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [enlargedMedia, setEnlargedMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingBackgroundVideo, setUploadingBackgroundVideo] = useState(false);

  // Check if URL is a video
  const isVideoUrl = (url: string): boolean => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowerUrl.includes(ext)) || 
           lowerUrl.includes('youtube.com') || 
           lowerUrl.includes('youtu.be') || 
           lowerUrl.includes('vimeo.com');
  };

  // Get YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Get YouTube thumbnail URL
  const getYouTubeThumbnail = (url: string): string => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
  };

  // Check if URL is YouTube
  const isYouTubeUrl = (url: string): boolean => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Add media from URL
  const addMediaFromUrl = () => {
    if (!newMediaUrl.trim()) return;

    const url = newMediaUrl.trim();
    const isVideo = isVideoUrl(url);
    
    if (isVideo) {
      const newVideos = [...appData.gallery.videos, url];
      updateAppData({
        gallery: {
          ...appData.gallery,
          videos: newVideos
        }
      });
    } else {
      const newImages = [...appData.gallery.images, url];
      updateAppData({
        gallery: {
          ...appData.gallery,
          images: newImages
        }
      });
    }

    setNewMediaUrl('');
    setShowAddForm(false);
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isBackgroundVideo = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (max 10MB for regular media, 100MB for background video)
    const maxSize = isBackgroundVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File size must be less than ${isBackgroundVideo ? '100MB' : '10MB'}`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      alert('Please select an image or video file');
      return;
    }

    setUploading(true);
    
    try {
      // Determine bucket based on file type and purpose
      let bucket: 'gallery-images' | 'gallery-videos' | 'background-videos';
      
      if (isBackgroundVideo) {
        bucket = 'background-videos';
      } else if (file.type.startsWith('image/')) {
        bucket = 'gallery-images';
      } else if (file.type.startsWith('video/')) {
        bucket = 'gallery-videos';
      } else {
        alert('Unsupported file type');
        setUploading(false);
        return;
      }
      
      // Upload to Supabase Storage
      const result = await uploadFile(file, bucket);
      
      if (result.success && result.url) {
        if (isBackgroundVideo) {
          // Update background video
          updateAppData({
            gallery: {
              ...appData.gallery,
              backgroundVideo: result.url
            }
          });
          setShowAddForm(false);
        } else if (file.type.startsWith('image/')) {
          // Add to images
          const newImages = [...appData.gallery.images, result.url];
          updateAppData({
            gallery: {
              ...appData.gallery,
              images: newImages
            }
          });
        } else if (file.type.startsWith('video/')) {
          // Add to videos
          const newVideos = [...appData.gallery.videos, result.url];
          updateAppData({
            gallery: {
              ...appData.gallery,
              videos: newVideos
            }
          });
        }
        
        setShowAddForm(false);
      } else {
        console.error('Upload failed:', result.error);
        alert(`Upload failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading file. Please try again.');
    } finally {
      setUploading(false);
      if (isBackgroundVideo) {
        setUploadingBackgroundVideo(false);
      }
    }
    
    // Clear the input
    e.target.value = '';
  };

  // Handle background video upload for homepage
  const handleBackgroundVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadingBackgroundVideo(true);
    await handleFileUpload(e, true);
    setUploadingBackgroundVideo(false);
  };

  // Remove image
  const removeImage = async (index: number) => {
    const imageUrl = appData.gallery.images[index];
    
    // If it's a Supabase Storage URL, delete the file
    if (isSupabaseStorageUrl(imageUrl)) {
      const filePath = extractFilePathFromUrl(imageUrl, 'gallery-images');
      if (filePath) {
        await deleteFile('gallery-images', filePath);
      }
    }
    
    const newImages = appData.gallery.images.filter((_, i) => i !== index);
    updateAppData({
      gallery: {
        ...appData.gallery,
        images: newImages
      }
    });
  };

  // Remove video
  const removeVideo = async (index: number) => {
    const videoUrl = appData.gallery.videos[index];
    
    // If it's a Supabase Storage URL, delete the file
    if (isSupabaseStorageUrl(videoUrl)) {
      const filePath = extractFilePathFromUrl(videoUrl, 'gallery-videos');
      if (filePath) {
        await deleteFile('gallery-videos', filePath);
      }
    }
    
    const newVideos = appData.gallery.videos.filter((_, i) => i !== index);
    updateAppData({
      gallery: {
        ...appData.gallery,
        videos: newVideos
      }
    });
  };

  // Open YouTube video in new tab
  const openYouTubeVideo = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Handle media click
  const handleMediaClick = (url: string, type: 'image' | 'video') => {
    if (type === 'video' && isYouTubeUrl(url)) {
      openYouTubeVideo(url);
    } else {
      setEnlargedMedia({ url, type });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Enlarged Media Modal */}
      {enlargedMedia && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setEnlargedMedia(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center">
            {enlargedMedia.type === 'image' ? (
              <img
                src={enlargedMedia.url}
                alt="Enlarged view"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <video
                src={enlargedMedia.url}
                controls
                autoPlay
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <button
              onClick={() => setEnlargedMedia(null)}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-blue-600" />
            Gallery
          </h2>
          
          {currentUser?.isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Media
              </button>
              <button
                onClick={() => document.getElementById('background-video-upload')?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                <Video className="w-4 h-4" />
                Add Background Video
              </button>
              <input
                id="background-video-upload"
                type="file"
                accept="video/*"
                onChange={handleBackgroundVideoUpload}
                disabled={uploadingBackgroundVideo}
                className="hidden"
              />
              {uploadingBackgroundVideo && (
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-sm">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  <span>Uploading background video...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Media Form */}
        {showAddForm && currentUser?.isAdmin && (
          <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Media</h3>
            
            {/* Upload Type Selection */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setUploadType('url')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  uploadType === 'url'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                <ExternalLink className="w-4 h-4" />
                From URL
              </button>
              <button
                onClick={() => setUploadType('file')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  uploadType === 'file'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload File
              </button>
            </div>
            
            {uploadType === 'url' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Media URL (Image, Video, or YouTube)
                  </label>
                  <input
                    type="url"
                    value={newMediaUrl}
                    onChange={(e) => setNewMediaUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg or https://youtube.com/watch?v=..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={addMediaFromUrl}
                    disabled={!newMediaUrl.trim()}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
                  >
                    Add Media
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewMediaUrl('');
                    }}
                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Upload File (Image or Video, max 10MB)
                  </label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
                  />
                </div>
                {uploading && (
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span>Processing file...</span>
                  </div>
                )}
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewMediaUrl('');
                  }}
                  className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* Media Display */}
        {(appData.gallery.images.length === 0 && appData.gallery.videos.length === 0 && !appData.gallery.backgroundVideo) ? (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-2">No media uploaded yet</p>
            <p className="text-gray-400 dark:text-gray-500">
              {currentUser?.isAdmin ? 'Click "Add Media" to get started' : 'Ask an admin to add some photos and videos'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Background Video Section */}
            {appData.gallery.backgroundVideo && currentUser?.isAdmin && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Video className="w-5 h-5 text-purple-600" />
                  Homepage Background Video
                </h3>
                <div className="relative group">
                  <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
                    <video
                      src={appData.gallery.backgroundVideo}
                      controls
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  
                  <button
                    onClick={async () => {
                      // If it's a Supabase Storage URL, delete the file
                      if (isSupabaseStorageUrl(appData.gallery.backgroundVideo!)) {
                        const filePath = extractFilePathFromUrl(appData.gallery.backgroundVideo!, 'background-videos');
                        if (filePath) {
                          await deleteFile('background-videos', filePath);
                        }
                      }
                      
                      updateAppData({
                        gallery: {
                          ...appData.gallery,
                          backgroundVideo: undefined
                        }
                      });
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                    title="Remove background video"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  This video is currently playing in the background of the homepage.
                </p>
              </div>
            )}

            {/* Images Section */}
            {appData.gallery.images.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                  Photos ({appData.gallery.images.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {appData.gallery.images.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <div 
                        className="relative cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        onClick={() => handleMediaClick(imageUrl, 'image')}
                      >
                        <img
                          src={imageUrl}
                          alt={`Gallery image ${index + 1}`}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=400';
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                          <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      
                      {currentUser?.isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                          title="Delete image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos Section */}
            {appData.gallery.videos.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Video className="w-5 h-5 text-red-600" />
                  Videos ({appData.gallery.videos.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {appData.gallery.videos.map((videoUrl, index) => (
                    <div key={index} className="relative group">
                      <div 
                        className="relative cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        onClick={() => handleMediaClick(videoUrl, 'video')}
                      >
                        {isYouTubeUrl(videoUrl) ? (
                          <div className="relative w-full h-48">
                            <img
                              src={getYouTubeThumbnail(videoUrl)}
                              alt={`YouTube video ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=400';
                              }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                              <div className="bg-red-600 rounded-full p-4 shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                              </div>
                            </div>
                            <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                              YouTube
                            </div>
                          </div>
                        ) : (
                          <div className="relative w-full h-48">
                            <video
                              src={videoUrl}
                              className="w-full h-full object-cover"
                              preload="metadata"
                              muted
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                              <div className="bg-blue-600 rounded-full p-4 shadow-lg">
                                <Video className="w-8 h-8 text-white" />
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                          <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      
                      {currentUser?.isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeVideo(index);
                          }}
                          className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                          title="Delete video"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}