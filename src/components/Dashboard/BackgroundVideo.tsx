import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface BackgroundVideoProps {
  show: boolean;
}

export function BackgroundVideo({ show }: BackgroundVideoProps) {
  const { appData } = useAuth();

  if (!show || !appData.gallery.backgroundVideo) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <video
        key="shared-background-video" // Consistent key to prevent recreation
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          filter: 'blur(1px)',
          opacity: 0.3
        }}
      >
        <source src={appData.gallery.backgroundVideo} type="video/mp4" />
      </video>
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-40 dark:bg-opacity-60" />
    </div>
  );
}