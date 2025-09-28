import React, { useState } from 'react';
import { DarkModeToggle } from '../DarkModeToggle';
import { LanguageToggle } from '../LanguageToggle';
import { BackgroundVideo } from './BackgroundVideo';
import { Header } from './Header';
import { SideNavigation } from './SideNavigation';
import { Homepage } from './Homepage';
import { Profile } from './Profile';
import NextGameList from './NextGameList';
import { Stats } from './Stats';
import { HouseRules } from './HouseRules';
import { Location } from './Location';
import { Gallery } from './Gallery';
import { RegisteredUsers } from './RegisteredUsers';

export function Dashboard() {
  const [activeSection, setActiveSection] = useState('home');

  // Sections that should show the background video
  const sectionsWithBackgroundVideo = ['home', 'stats', 'rules', 'location'];
  const showBackgroundVideo = sectionsWithBackgroundVideo.includes(activeSection);

  // Handle hash-based navigation for the header click
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'home') {
        setActiveSection('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <Homepage onNavigateToGame={() => setActiveSection('game')} />;
      case 'profile':
        return <Profile />;
      case 'game':
        return <NextGameList />;
      case 'stats':
        return <Stats />;
      case 'rules':
        return <HouseRules />;
      case 'location':
        return <Location />;
      case 'gallery':
        return <Gallery />;
      case 'users':
        return <RegisteredUsers />;
      default:
        return <NextGameList />;
    }
  };

  return (
    <div className="min-h-screen transition-colors">
      <BackgroundVideo show={showBackgroundVideo} />
      <DarkModeToggle />
      <LanguageToggle />
      <SideNavigation activeSection={activeSection} onSectionChange={setActiveSection} />
      <Header />
      <main className="py-8">
        {renderSection()}
      </main>
    </div>
  );
}