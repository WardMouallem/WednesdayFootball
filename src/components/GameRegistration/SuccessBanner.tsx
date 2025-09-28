import React from 'react';

const SuccessBanner = ({ type, playerName, isVisible, onClose }) => {
  if (!isVisible) return null;

  const bannerConfig = {
    playerRegistered: {
      message: `Player "${playerName}" Registered Successfully! 🎉`,
      bgColor: 'bg-green-500'
    },
    selfRegistered: {
      message: 'You have been registered successfully! ⚽',
      bgColor: 'bg-blue-500'
    },
    gameOn: {
      message: 'GAME ON! 🏆 18 players confirmed - Match is ready!',
      bgColor: 'bg-orange-500'
    },
    gameOff: {
      message: 'Game needs more players - registration reopened',
      bgColor: 'bg-yellow-500'
    }
  };

  const config = bannerConfig[type] || bannerConfig.playerRegistered;

  return (
    <div className={`${config.bgColor} text-white p-4 rounded-lg shadow-lg mb-4 animate-fade-in`}>
      <div className="flex justify-between items-center">
        <span className="font-semibold text-lg">{config.message}</span>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 text-xl font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default SuccessBanner;
