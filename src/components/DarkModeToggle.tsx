import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useAuth();

  return (
    <button
      onClick={toggleDarkMode}
      className="fixed top-4 right-4 z-50 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-blue-600" />
      )}
    </button>
  );
}