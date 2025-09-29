import React, { useState, useEffect } from 'react';
import { gameService } from '../../services/gameService';
import { useAuth } from '../../contexts/AuthContext';
import SuccessBanner from './SuccessBanner';
import PlayerList from './PlayerList';

const RegistrationManager: React.FC = () => {
  const { currentUser, appData, updateAppData } = useAuth();
  const [currentGame, setCurrentGame] = useState<any>(null);
  const [banner, setBanner] = useState({ visible: false, type: '', playerName: '' });
  const [loading, setLoading] = useState(false);

  // Load game data
  useEffect(() => {
    loadGameData();
    setupRealtimeSubscription();
  }, []);

  const loadGameData = async () => {
    try {
      const game = await gameService.getCurrentGame();
      setCurrentGame(game);
    } catch (error) {
      console.error('Error loading game:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    gameService.subscribeToRegistrations((payload: any) => {
      loadGameData(); // Reload when registrations change
    });
  };

  const showBanner = (type: string, playerName: string = '') => {
    setBanner({ visible: true, type, playerName });
    setTimeout(() => setBanner({ ...banner, visible: false }), 5000);
  };

  const registerPlayer = async (playerData: any, isSelfRegistered: boolean = false) => {
    if (!currentUser) {
      alert('Please log in to register players');
      return;
    }

    setLoading(true);
    try {
      const registration = await gameService.registerPlayer(
        { 
          ...playerData, 
          registeredBy: currentUser.id,
          userId: isSelfRegistered ? currentUser.id : null
        },
        isSelfRegistered
      );

      // Show appropriate banner
      if (isSelfRegistered) {
        showBanner('selfRegistered');
      } else {
        showBanner('playerRegistered', playerData.name);
      }

      return registration;
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelfRegister = async () => {
    if (!currentUser) {
      alert('Please log in to register yourself');
      return;
    }

    // Use the player name from the user's profile
    const playerName = currentUser.playerName || currentUser.username || 'Player';
    
    await registerPlayer({
      name: playerName,
      phoneNumber: currentUser.phoneNumber || '0000000000',
      userId: currentUser.id
    }, true);
  };

  const handleRegisterOther = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const playerData = {
      name: formData.get('playerName') as string,
      phoneNumber: formData.get('phoneNumber') as string
    };

    await registerPlayer(playerData, false);
    (e.target as HTMLFormElement).reset();
  };

  if (!currentUser) {
    return (
      <div className="p-4 text-center">
        <p className="text-lg font-semibold">Please log in to manage registrations</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Success Banner */}
      <SuccessBanner
        type={banner.type}
        playerName={banner.playerName}
        isVisible={banner.visible}
        onClose={() => setBanner({ ...banner, visible: false })}
      />

      {/* Registration Forms */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Self Registration */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Register Yourself</h3>
          <button
            onClick={handleSelfRegister}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Registering...' : `Register ${currentUser.playerName || currentUser.username} ⚽`}
          </button>
        </div>

        {/* Register Others */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Register Another Player</h3>
          <form onSubmit={handleRegisterOther} className="space-y-3">
            <input
              type="text"
              name="playerName"
              placeholder="Player Name"
              required
              className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
            />
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              required
              className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register Player 👥'}
            </button>
          </form>
        </div>
      </div>

      {/* Player List */}
      <PlayerList registrations={currentGame?.registrations} />
    </div>
  );
};

export default RegistrationManager;