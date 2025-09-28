import React from 'react';
import SuccessBanner from './SuccessBanner';

const PlayerList = ({ registrations, onRegistrationUpdate }) => {
  const confirmedPlayers = registrations?.filter(r => r.status === 'confirmed') || [];
  const isGameOn = confirmedPlayers.length >= 18;
  const previousGameState = React.useRef(isGameOn);

  React.useEffect(() => {
    if (isGameOn !== previousGameState.current) {
      previousGameState.current = isGameOn;
      // Game state changed - parent component can handle banner
    }
  }, [isGameOn]);

  return (
    <div className="space-y-4">
      {/* GAME ON! Banner */}
      <SuccessBanner
        type="gameOn"
        isVisible={isGameOn}
        onClose={() => {}} // Keep visible until player count changes
      />

      {/* Registration Stats */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">{confirmedPlayers.length}</div>
            <div className="text-sm text-gray-600">Confirmed Players</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {confirmedPlayers.filter(p => p.is_self_registered).length}
            </div>
            <div className="text-sm text-gray-600">Self-Registered</div>
          </div>
        </div>
        
        {/* Game Status */}
        <div className={`text-center mt-2 font-semibold ${
          isGameOn ? 'text-green-600' : 'text-orange-600'
        }`}>
          {isGameOn ? '✅ GAME READY (18+ players)' : `🕐 Need ${18 - confirmedPlayers.length} more players`}
        </div>
      </div>

      {/* Players List */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Registered Players:</h3>
        {confirmedPlayers.map((registration, index) => (
          <div key={registration.id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow">
            <div>
              <span className="font-medium">{registration.players.name}</span>
              {registration.is_self_registered && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">You</span>
              )}
            </div>
            <span className="text-gray-500 text-sm">
              #{index + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerList;
