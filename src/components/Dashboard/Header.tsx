import React from 'react';
import { LogOut, Users, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

export function Header() {
  const { currentUser, signOut, syncData } = useAuth();
  const { t } = useLanguage();
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    syncData();
    setTimeout(() => setIsSyncing(false), 500);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <div className="mr-3">
              <img 
                src="/logo.png" 
                alt="Wednesday Football Logo" 
                className="w-10 h-10 rounded-lg shadow-md"
                onError={(e) => {
                  // Fallback to icon if logo fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="hidden flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <button
                onClick={() => window.location.hash = '#home'}
                className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              >
                Wednesday Football
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Welcome to the one and only {currentUser?.username}!
                {currentUser?.isAdmin && (
                  <span className="ml-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
                    {t('common.admin')}
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              title="Sync data"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm sm:text-base whitespace-nowrap">{t('common.signOut')}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}