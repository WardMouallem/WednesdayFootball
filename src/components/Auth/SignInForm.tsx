import React, { useState } from 'react';
import { ArrowLeft, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { isValidIsraeliPhoneNumber } from '../../utils/validation';

interface SignInFormProps {
  onBack: () => void;
}

export function SignInForm({ onBack }: SignInFormProps) {
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, appData } = useAuth();
  const { t } = useLanguage();

  // Check if the entered username is an admin
  React.useEffect(() => {
    const user = appData.users.find(u => u.username === username);
    setIsAdmin(user?.isAdmin || false);
  }, [username, appData.users]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate phone number format for regular users only
    if (!isAdmin && !isValidIsraeliPhoneNumber(phoneNumber)) {
      setError('Please enter a valid Israeli phone number');
      return;
    }
    
    setIsLoading(true);

    const result = await signIn(username, phoneNumber);
    
    if (!result.success) {
      setError(result.error || 'Invalid username or phone number');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('auth.signIn')}</h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('auth.username')}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isAdmin ? t('auth.password') : t('auth.phoneNumber')}
            </label>
            <input
              type={isAdmin ? 'password' : 'tel'}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            <LogIn className="w-5 h-5" />
            {isLoading ? t('auth.signingIn') : t('auth.signIn')}
          </button>
        </form>
      </div>
    </div>
  );
}