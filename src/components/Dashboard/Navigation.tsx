import React from 'react';
import { Calendar, FileText, MapPin, Image, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const baseSections = [
  { id: 'game', label: 'Next Game List', icon: Calendar },
  { id: 'rules', label: 'House Rules', icon: FileText },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'gallery', label: 'Gallery', icon: Image },
];

const adminSections = [
  { id: 'users', label: 'Registered Users', icon: Users },
];

export function Navigation({ activeSection, onSectionChange }: NavigationProps) {
  const { currentUser } = useAuth();
  
  const sections = currentUser?.isAdmin 
    ? [...baseSections, ...adminSections]
    : baseSections;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto py-4">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {section.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}