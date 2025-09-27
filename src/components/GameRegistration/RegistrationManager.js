import React, { useState, useEffect } from 'react';
import { gameService } from '../../services/gameService';
import { supabase } from '../../lib/supabaseClient';
import SuccessBanner from './SuccessBanner';
import PlayerList from './PlayerList';

const RegistrationManager = () => {
  const [currentGame, setCurrentGame] = useState(null);
  const [user, setUser] = useState(null);
  const [banner, setBanner] = useState({ visible: false, type: '', playerName: '' });
  const [loading, setLoading] = useState(false);

  // Load user and game data
  useEffect(() => {
    loadUser();
    loadGameData();
    setupRealtimeSubscription();
  }, []);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadGameData = async () => {
    try {
      const game = await gameService.getCurrentGame();
      setCurrentGame(game);
    } catch (error) {
      console.error('Error loading game:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    gameService.subscribeToRegistrations((payload) => {
      loadGameData(); // Reload when registrations change
    });
  };

  const showBanner = (type, playerName = '') => {
    setBanner({ visible: true, type, playerName });
    setTimeout(() => setBanner({ ...banner, visible: false }), 5000);
  };

  const registerPlayer = async (playerData, isSelfRegistered = false) => {
    setLoading(true);
    try {
      const registration = await gameService.registerPlayer(
        { ...playerData, registeredBy: user.id },
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
    if (!user) {
      alert('Please log in to register yourself');
      return;
    }

    // Get user's player name (you might need to adjust this based on your user structure)
    const playerName = user.user_metadata?.playerName || user.email?.split('@')[0] || 'Player';
    
    await registerPlayer({
      name: playerName,
      phoneNumber: user.phone || '0000000000',
      userId: user.id
    }, true);
  };

  const handleRegisterOther = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const playerData = {
      name: formData.get('playerName'),
      phoneNumber: formData.get('phoneNumber')
    };

    await registerPlayer(playerData, false);
    e.target.reset();
  };

  if (!user) {
    return (
      <div className="p-4 text-center">
        <p>Please log in to manage registrations</p>
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
            {loading ? 'Registering...' : 'Register Me for Game ⚽'}
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
              className="w-full p-2 border rounded"
            />
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              required
              className="w-full p-2 border rounded"
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
