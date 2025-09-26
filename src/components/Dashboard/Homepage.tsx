import React from 'react';
import { Calendar, Users, MessageCircle, Edit3, Save, X, Trophy, Globe, MapPin, Smartphone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface HomepageProps {
  onNavigateToGame: () => void;
}

export function Homepage({ onNavigateToGame }: HomepageProps) {
  const { currentUser, appData, updateAppData } = useAuth();
  const { t } = useLanguage();
  const [isEditingWhatsApp, setIsEditingWhatsApp] = React.useState(false);
  const [isEditingTotalGames, setIsEditingTotalGames] = React.useState(false);
  const [editedWhatsAppUrl, setEditedWhatsAppUrl] = React.useState(appData.whatsappGroupUrl);
  const [editedTotalGames, setEditedTotalGames] = React.useState(appData.totalGames || 0);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  // Filter only image URLs from gallery (exclude videos and data URLs that might be videos)
  const galleryImages = React.useMemo(() => {
    return appData.gallery.images.filter(url => {
      // Exclude data URLs that might be videos
      if (url.startsWith('data:video/')) return false;
      // Include regular image URLs and data URLs that are images
      return true;
    });
  }, [appData.gallery.images]);

  // Carousel effect - change image every 4 seconds
  React.useEffect(() => {
    if (galleryImages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % galleryImages.length
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [galleryImages.length]);

  const handleSaveWhatsApp = () => {
    updateAppData({ whatsappGroupUrl: editedWhatsAppUrl });
    setIsEditingWhatsApp(false);
  };

  const handleCancelWhatsApp = () => {
    setEditedWhatsAppUrl(appData.whatsappGroupUrl);
    setIsEditingWhatsApp(false);
  };

  const handleSaveTotalGames = () => {
    updateAppData({ totalGames: editedTotalGames });
    setIsEditingTotalGames(false);
  };

  const handleCancelTotalGames = () => {
    setEditedTotalGames(appData.totalGames || 0);
    setIsEditingTotalGames(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 relative">
      {/* Image Carousel (only if no background video) */}
      {!appData.gallery.backgroundVideo && galleryImages.length > 0 && (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          {galleryImages.map((imageUrl, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-30' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url(${imageUrl})`,
                filter: 'blur(1px)'
              }}
            />
          ))}
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black bg-opacity-20 dark:bg-opacity-40" />
        </div>
      )}
      
      <div className="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-8 text-center border border-white/20 dark:border-gray-700/50 pointer-events-auto">
        <div className="mb-8">
          <div className="mb-6">
            <img 
              src="/logo.png" 
              alt="Wednesday Football Logo" 
              className="w-24 h-24 mx-auto rounded-full shadow-xl"
              onError={(e) => {
                // Fallback to icon if logo fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="hidden inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full">
              <Users className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('homepage.welcome')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            {t('homepage.subtitle')}
          </p>
        </div>

        <div className="mb-8">
          <button
            onClick={onNavigateToGame}
            className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors duration-200 text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Calendar className="w-6 h-6" />
            {t('homepage.registerButton')}
          </button>
        </div>

        {/* Total Games Section - Only visible to admins */}
        {currentUser?.isAdmin && (
          <div className="mb-8 p-4 bg-blue-50/80 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-gray-700 dark:text-gray-300">
                {t('homepage.totalGames')} 
              </span>
              {currentUser?.isSuperAdmin && !isEditingTotalGames && (
                <button
                  onClick={() => setIsEditingTotalGames(true)}
                  className="ml-2 p-1 text-blue-500 hover:text-blue-700 transition-colors"
                  title="Edit total games"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {isEditingTotalGames && currentUser?.isSuperAdmin ? (
              <div className="space-y-3">
                <input
                  type="number"
                  min="0"
                  value={editedTotalGames}
                  onChange={(e) => setEditedTotalGames(parseInt(e.target.value) || 0)}
                  className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white text-center backdrop-blur-sm"
                />
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={handleSaveTotalGames}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors text-sm"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancelTotalGames}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors text-sm"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {appData.totalGames || 0}
              </span>
            )}
          </div>
        )}

        {/* WhatsApp Group Link Section */}
        <div className="mb-8 p-4 bg-green-50/80 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 mb-3">
            <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-gray-700 dark:text-gray-300">
              {t('homepage.whatsappText')} 
            </span>
            {currentUser?.isSuperAdmin && !isEditingWhatsApp && (
              <button
                onClick={() => setIsEditingWhatsApp(true)}
                className="ml-2 p-1 text-blue-500 hover:text-blue-700 transition-colors"
                title="Edit WhatsApp link"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {isEditingWhatsApp && currentUser?.isSuperAdmin ? (
            <div className="space-y-3">
              <input
                type="url"
                value={editedWhatsAppUrl}
                onChange={(e) => setEditedWhatsAppUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white text-sm backdrop-blur-sm"
                placeholder="https://chat.whatsapp.com/..."
              />
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleSaveWhatsApp}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors text-sm"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={handleCancelWhatsApp}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors text-sm"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <a
              href={appData.whatsappGroupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium underline transition-colors"
            >
              {t('homepage.whatsappLink')}
              <MessageCircle className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Quick Actions Section */}
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">
            🚀 {t('homepage.quickActions')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="https://wednesdayleague.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Globe className="w-5 h-5" />
              <span>{t('homepage.register')}</span>
            </a>
            <a
              href="https://waze.com/ul/hsvbfedkeh"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <MapPin className="w-5 h-5" />
              <span>{t('homepage.wazeNavigation')}</span>
            </a>
            <a
              href="https://link.payboxapp.com/DEwehas1qibptxDEA"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Smartphone className="w-5 h-5" />
              <span>{t('homepage.payboxPayment')}</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 bg-blue-50/80 dark:bg-blue-900/30 rounded-lg backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('homepage.weeklyGames')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {t('homepage.weeklyGamesDesc')}
            </p>
          </div>

          <div className="p-6 bg-green-50/80 dark:bg-green-900/30 rounded-lg backdrop-blur-sm border border-green-200/50 dark:border-green-700/50">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('homepage.community')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {t('homepage.communityDesc')}
            </p>
          </div>

          <div className="p-6 bg-purple-50/80 dark:bg-purple-900/30 rounded-lg backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/50">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('homepage.fairPlay')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {t('homepage.fairPlayDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}