import React from 'react';
import { Users, LogIn, UserPlus } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface WelcomePageProps {
  onShowSignIn: () => void;
  onShowSignUp: () => void;
}

export function WelcomePage({ onShowSignIn, onShowSignUp }: WelcomePageProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300">
        <div className="text-center mb-8">
          <div className="mb-4">
            <img 
              src="/logo.png" 
              alt="Wednesday Football Logo" 
              className="w-20 h-20 mx-auto rounded-full shadow-lg"
              onError={(e) => {
                // Fallback to icon if logo fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="hidden inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Wednesday Football
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Join our weekly football community
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={onShowSignIn}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            <LogIn className="w-5 h-5" />
            {t('auth.signIn')}
          </button>
          
          <button
            onClick={onShowSignUp}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-4 border-2 border-blue-600 rounded-lg transition-colors duration-200"
          >
            <UserPlus className="w-5 h-5" />
            {t('auth.signUp')}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Every Wednesday at 20:30
        </div>
      </div>
    </div>
  );
}