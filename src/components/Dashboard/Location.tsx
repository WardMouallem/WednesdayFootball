import React, { useState } from 'react';
import { MapPin, Edit3, Save, X, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Location() {
  const { currentUser, appData, updateAppData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [mapType, setMapType] = useState<'embed' | 'image'>('embed');
  const [editedLocation, setEditedLocation] = useState({
    ...appData.location,
    googleMapsUrl: appData.location.googleMapsUrl || '',
    wazeUrl: appData.location.wazeUrl || '',
    mapImageUrl: appData.location.mapImageUrl || ''
  });

  const handleSave = () => {
    updateAppData({ location: editedLocation });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedLocation({
      ...appData.location,
      googleMapsUrl: appData.location.googleMapsUrl || '',
      wazeUrl: appData.location.wazeUrl || '',
      mapImageUrl: appData.location.mapImageUrl || ''
    });
    setIsEditing(false);
  };

  const openInGoogleMaps = () => {
    if (appData.location.googleMapsUrl) {
      window.open(appData.location.googleMapsUrl, '_blank');
    } else {
      const encodedAddress = encodeURIComponent(appData.location.address);
      window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank');
    }
  };

  const openInWaze = () => {
    if (appData.location.wazeUrl) {
      window.open(appData.location.wazeUrl, '_blank');
    } else {
      const encodedAddress = encodeURIComponent(appData.location.address);
      window.open(`https://waze.com/ul?q=${encodedAddress}`, '_blank');
    }
  };

  const handleMapImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setEditedLocation(prev => ({ ...prev, mapImageUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 relative">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            Location
          </h2>
          
          {currentUser?.isAdmin && (
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stadium Name
              </label>
              <input
                type="text"
                value={editedLocation.name}
                onChange={(e) => setEditedLocation(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address
              </label>
              <input
                type="text"
                value={editedLocation.address}
                onChange={(e) => setEditedLocation(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Google Maps Button URL (optional)
              </label>
              <input
                type="url"
                value={editedLocation.googleMapsUrl}
                onChange={(e) => setEditedLocation(prev => ({ ...prev, googleMapsUrl: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://maps.google.com/..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Map Type
              </label>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="embed"
                    checked={mapType === 'embed'}
                    onChange={(e) => setMapType(e.target.value as 'embed' | 'image')}
                    className="mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Embedded Map</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="image"
                    checked={mapType === 'image'}
                    onChange={(e) => setMapType(e.target.value as 'embed' | 'image')}
                    className="mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Map Image</span>
                </label>
              </div>
            </div>
            
            {mapType === 'embed' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Map Embed URL (for display)
                </label>
                <input
                  type="url"
                  value={editedLocation.mapUrl}
                  onChange={(e) => setEditedLocation(prev => ({ ...prev, mapUrl: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://maps.google.com/maps?q=...&output=embed"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Map Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMapImageUpload}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {editedLocation.mapImageUrl && (
                  <div className="mt-4">
                    <img
                      src={editedLocation.mapImageUrl}
                      alt="Map preview"
                      className="w-full max-w-md h-48 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Waze Button URL (optional)
              </label>
              <input
                type="url"
                value={editedLocation.wazeUrl}
                onChange={(e) => setEditedLocation(prev => ({ ...prev, wazeUrl: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://waze.com/ul?..."
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {appData.location.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {appData.location.address}
              </p>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={openInGoogleMaps}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Google Maps
                </button>
                <button
                  onClick={openInWaze}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Waze
                </button>
              </div>
            </div>
            
            {appData.location.mapImageUrl ? (
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img
                  src={appData.location.mapImageUrl}
                  alt="Location Map"
                  className="w-full max-w-none object-contain rounded-lg"
                  style={{ maxHeight: 'none' }}
                />
              </div>
            ) : appData.location.mapUrl ? (
              <div className="rounded-lg overflow-hidden shadow-lg">
                <iframe
                  src={appData.location.mapUrl}
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full"
                  title="Location Map"
                />
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No map configured yet
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}