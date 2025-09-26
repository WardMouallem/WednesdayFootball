import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { DarkModeToggle } from './components/DarkModeToggle';
import { LanguageToggle } from './components/LanguageToggle';
import { WelcomePage } from './components/Auth/WelcomePage';
import { SignInForm } from './components/Auth/SignInForm';
import { SignUpForm } from './components/Auth/SignUpForm';
import { Dashboard } from './components/Dashboard/Dashboard';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { currentUser, isLoading } = useAuth();
  const [authView, setAuthView] = useState<'welcome' | 'signin' | 'signup'>('welcome');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentUser) {
    return <Dashboard />;
  }

  return (
    <>
      {authView === 'welcome' && (
        <>
          <DarkModeToggle />
          <LanguageToggle />
          <WelcomePage
            onShowSignIn={() => setAuthView('signin')}
            onShowSignUp={() => setAuthView('signup')}
          />
        </>
      )}
      {authView === 'signin' && (
        <>
          <DarkModeToggle />
          <LanguageToggle />
          <SignInForm onBack={() => setAuthView('welcome')} />
        </>
      )}
      {authView === 'signup' && (
        <>
          <DarkModeToggle />
          <LanguageToggle />
          <SignUpForm onBack={() => setAuthView('welcome')} />
        </>
      )}
    </>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;