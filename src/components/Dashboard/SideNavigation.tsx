import React, { useState } from 'react';
import { Home, Calendar, FileText, MapPin, Image, Users, ChevronRight, User, Trophy } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface SideNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const baseSections = [
  { id: 'home', label: 'Homepage', icon: Home },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'game', label: 'Next Game List', icon: Calendar },
  { id: 'stats', label: 'Stats', icon: Trophy },
  { id: 'rules', label: 'House Rules', icon: FileText },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'gallery', label: 'Gallery', icon: Image },
];

const adminSections = [
  { id: 'users', label: 'Registered Users', icon: Users },
];

export function SideNavigation({ activeSection, onSectionChange }: SideNavigationProps) {
  const { currentUser, appData } = useAuth();
  const { t } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);
  
  const baseSections = [
    { id: 'home', label: t('nav.homepage'), icon: Home },
    { id: 'profile', label: t('nav.profile'), icon: User },
    { id: 'game', label: t('nav.nextGame'), icon: Calendar },
    { id: 'stats', label: t('nav.stats'), icon: Trophy },
    { id: 'rules', label: t('nav.houseRules'), icon: FileText },
    { id: 'location', label: t('nav.location'), icon: MapPin },
    { id: 'gallery', label: t('nav.gallery'), icon: Image },
  ];

  const adminSections = [
    { id: 'users', label: t('nav.users'), icon: Users },
  ];

  const sections = currentUser?.isAdmin 
    ? [...baseSections, ...adminSections]
    : baseSections;

  return (
    <div
      className="fixed left-0 top-1/2 transform -translate-y-1/2 z-40 transition-all duration-300 ease-in-out"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`bg-white dark:bg-gray-800 shadow-lg rounded-r-xl border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        isHovered ? 'w-64' : 'w-12'
      }`}>
        {/* Hover indicator */}
        <div className={`flex items-center justify-center h-12 border-b border-gray-200 dark:border-gray-700 ${
          isHovered ? 'bg-blue-50 dark:bg-blue-900/20' : ''
        }`}>
          <ChevronRight className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${
            isHovered ? 'rotate-90' : ''
          }`} />
        </div>

        {/* Navigation items */}
        <div className="py-4">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-r-4 border-blue-600'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={!isHovered ? section.label : undefined}
              >
                <div className="relative flex-shrink-0">
                  <Icon className="w-5 h-5" />
                  {section.id === 'users' && currentUser?.isAdmin && appData.pendingUsers?.length > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-bold">
                      {appData.pendingUsers.length}
                    </div>
                  )}
                </div>
                <span className={`font-medium whitespace-nowrap transition-all duration-300 ${
                  isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`}>
                  {section.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}