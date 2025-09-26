import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="fixed top-4 left-4 z-50 flex items-center gap-2 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
      aria-label="Toggle language"
      title={`Switch to ${language === 'en' ? 'Arabic' : 'English'}`}
    >
      <Languages className="w-5 h-5 text-blue-600" />
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {language === 'en' ? 'عربي' : 'English'}
      </span>
    </button>
  );
}