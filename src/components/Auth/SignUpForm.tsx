import React, { useState } from 'react';
import { ArrowLeft, UserPlus, AlertCircle, CheckCircle, LogIn, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { isValidIsraeliPhoneNumber } from '../../utils/validation';

interface SignUpFormProps {
  onBack: () => void;
}

export function SignUpForm({ onBack }: SignUpFormProps) {
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ username: string; phoneNumber: string; playerName: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { signUp, signIn } = useAuth();
  const { t } = useLanguage();

  const validateUsername = (username: string): string | null => {
    if (username.length < 5) {
      return 'Username must be at least 5 characters long';
    }
    if (username.length > 20) {
      return 'Username must be no more than 20 characters long';
    }
    if (username.includes(' ')) {
      return 'Username cannot contain spaces';
    }
    // Check for valid characters (English letters, numbers, symbols - no spaces)
    const validPattern = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]+$/;
    if (!validPattern.test(username)) {
      return 'Username can only contain English letters, numbers, and symbols (no spaces)';
    }
    return null;
  };

  const validatePlayerName = (playerName: string): string | null => {
    if (playerName.length < 2) {
      return 'Player name must be at least 2 characters long';
    }
    if (playerName.length > 30) {
      return 'Player name must be no more than 30 characters long';
    }
    return null;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate username format
    const usernameError = validateUsername(username);
    if (usernameError) {
      setError(usernameError);
      return;
    }
    
    // Validate player name format
    const playerNameError = validatePlayerName(playerName);
    if (playerNameError) {
      setError(playerNameError);
      return;
    }
    
    // Validate phone number format
    if (!isValidIsraeliPhoneNumber(phoneNumber)) {
      setError('Please enter a valid Israeli phone number');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);

    const result = await signUp(username, phoneNumber, playerName);
    
    if (result.success) {
      setSuccess({ username, phoneNumber, playerName });
    } else {
      setError(result.error || 'Registration failed');
    }
    
    setIsLoading(false);
  };

  const handleAutoSignIn = async () => {
    if (!success) return;
    
    setIsSigningIn(true);
    const result = await signIn(success.username, success.phoneNumber);
    if (!result.success) {
      setError(result.error || 'Sign in failed');
      setIsSigningIn(false);
    }
    // The AuthContext will handle the redirect to dashboard
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
            <p className="text-green-800 dark:text-green-200 font-medium">
              Registration request submitted successfully!
            </p>
            <p className="text-green-700 dark:text-green-300 text-sm mt-2">
              Your account ({success.username}) is pending admin approval. You'll be able to sign in once an admin approves your request.
            </p>
            
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
              <p className="text-blue-800 dark:text-blue-200 font-medium text-sm mb-2">
                📱 Want to receive Telegram notifications?
              </p>
              <p className="text-blue-700 dark:text-blue-300 text-xs mb-2">
                To get game updates and notifications on Telegram:
              </p>
              <ol className="text-blue-700 dark:text-blue-300 text-xs space-y-1 ml-4">
                <li>1. Open Telegram app</li>
                <li>2. Search for our bot: <code className="bg-blue-200 dark:bg-blue-800 px-1 rounded">@WednesdayFootballBot</code></li>
                <li>3. Send <code className="bg-blue-200 dark:bg-blue-800 px-1 rounded">/start {success.username}</code></li>
              </ol>
              <p className="text-blue-600 dark:text-blue-400 text-xs mt-2">
                This will link your account for notifications!
              </p>
            </div>
          </div>
          
          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            {t('auth.back')}
          </button>
        </div>
      </div>
    );
  }

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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('auth.signUp')}</h2>
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
            
            {/* Username Guidelines Box */}
            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Username Guidelines:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Your username will be used when logging in</li>
                    <li>• Your username is not your player name</li>
                    <li>• You can write English letters, numbers and symbols</li>
                    <li>• Must be 5-20 characters long</li>
                    <li>• Spaces are not allowed</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              placeholder="Enter your username (5-20 characters)"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('auth.playerName')}
            </label>
            
            {/* Player Name Guidelines Box */}
            <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-800 dark:text-green-200">
                  <p className="font-medium mb-1">Player Name Guidelines:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• This is your actual name that will appear in game registration lists</li>
                    <li>• Can contain spaces and special characters</li>
                    <li>• Recommended to use your real name for easy identification</li>
                    <li>• Must be 2-30 characters long</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              placeholder="Enter your player name (2-30 characters)"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('auth.phoneNumber')}
            </label>
            <input
              type="tel"
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
            <UserPlus className="w-5 h-5" />
            {isLoading ? t('auth.creatingAccount') : t('auth.signUp')}
          </button>
        </form>
      </div>
    </div>
  );
}