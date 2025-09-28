import React from 'react';

// Temporary fix for JS component in TS environment
const RegistrationManager = React.lazy(() => 
  import('../GameRegistration/RegistrationManager')
);

const NextGameList: React.FC = () => {
  return (
    <div className="next-game-list">
      {/* Header Section - Keep your existing style */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          🏆 Next Wednesday Football Game
        </h2>
        <p className="text-gray-600">
          Register yourself or other players for the upcoming match. Game requires 18 players to start.
        </p>
      </div>

      {/* Registration Manager with Error Boundary */}
      <React.Suspense fallback={<div>Loading registration system...</div>}>
        <RegistrationManager />
      </React.Suspense>

      {/* Additional Info Section */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">📋 Game Information</h3>
        <ul className="text-yellow-700 text-sm space-y-1">
          <li>• Location: City Football Stadium</li>
          <li>• Time: Wednesday, 8:00 PM</li>
          <li>• Required: 18 players minimum</li>
          <li>• Format: 9v9 with substitutes</li>
        </ul>
      </div>
    </div>
  );
};

export default NextGameList;
