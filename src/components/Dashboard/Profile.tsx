import React, { useState } from 'react';
import { User, Camera, Edit3, Save, X, Trophy, Star, Shield, Crown, Zap, AlertCircle, Check, UserCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const RANK_CONFIG = {
  rookie: { emoji: '🔰', label: 'Rookie', range: '0-25%', color: 'text-gray-600' },
  squad: { emoji: '⚽', label: 'Squad Player', range: '26-50%', color: 'text-blue-600' },
  starter: { emoji: '🌟', label: 'Starter', range: '51-70%', color: 'text-green-600' },
  captain: { emoji: '👑', label: 'Captain', range: '71-85%', color: 'text-purple-600' },
  legend: { emoji: '🏆', label: 'Legend', range: '86-100%', color: 'text-yellow-600' }
};

type RankType = keyof typeof RANK_CONFIG;

export function Profile() {
  const { currentUser, appData, updateAppData } = useAuth();
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingStats, setIsEditingStats] = useState(false);
  const [isEditingPlayerName, setIsEditingPlayerName] = useState(false);
  const [newUsername, setNewUsername] = useState(currentUser?.username || '');
  const [newPlayerName, setNewPlayerName] = useState(currentUser?.playerName || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Stats editing
  const [editedStats, setEditedStats] = useState({
    gamesPlayed: currentUser?.stats?.gamesPlayed || 0,
    timePlayed: currentUser?.stats?.timePlayed || 0,
    goalsScored: currentUser?.stats?.goalsScored || 0
  });

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-4 text-center">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
          <p className="text-red-700 dark:text-red-300">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  const userStats = currentUser.stats || { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 };
  const totalGames = appData.totalGames || 1; // Avoid division by zero
  const attendanceRate = (userStats.gamesPlayed / totalGames) * 100;

  const getRank = (): RankType => {
    if (attendanceRate >= 86) return 'legend';
    if (attendanceRate >= 71) return 'captain';
    if (attendanceRate >= 51) return 'starter';
    if (attendanceRate >= 26) return 'squad';
    return 'rookie';
  };

  const rank = getRank();
  const rankInfo = RANK_CONFIG[rank];

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        
        // Create updated current user object first
        const updatedCurrentUser = { ...currentUser, profilePicture: dataUrl };
        
        const updatedUsers = appData.users.map(user =>
          user.username === currentUser.username
            ? { ...user, profilePicture: dataUrl }
            : user
        );

        // Update both users array and current user for immediate display
        updateAppData({ 
          users: updatedUsers,
          currentUser: updatedCurrentUser
        });
        setSuccess('Profile picture updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
        setUploading(false);
      };

      reader.onerror = () => {
        setError('Error reading file. Please try again.');
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Error uploading image. Please try again.');
      setUploading(false);
    }
  };

  const removeProfilePicture = () => {
    // Create updated current user object first
    const updatedCurrentUser = { ...currentUser, profilePicture: undefined };
    
    const updatedUsers = appData.users.map(user =>
      user.username === currentUser.username
        ? { ...user, profilePicture: undefined }
        : user
    );

    // Update both users array and current user for immediate display
    updateAppData({ 
      users: updatedUsers,
      currentUser: updatedCurrentUser
    });
    setSuccess('Profile picture removed successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const validateUsername = (username: string): string | null => {
    if (username.length < 5) {
      return 'Username must be at least 5 characters long';
    }
    if (username.length > 20) {
      return 'Username must be no more than 20 characters long';
    }
    if (username.includes(' ')) {
      return 'Username cannot contain spaces';
    }
    // Check for valid characters (English letters, numbers, symbols - no spaces)
    const validPattern = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]+$/;
    if (!validPattern.test(username)) {
      return 'Username can only contain English letters, numbers, and symbols (no spaces)';
    }
    return null;
  };

  const validatePlayerName = (playerName: string): string | null => {
    if (playerName.length < 2) {
      return 'Player name must be at least 2 characters long';
    }
    if (playerName.length > 30) {
      return 'Player name must be no more than 30 characters long';
    }
    return null;
  };
  const handleUsernameChange = () => {
    if (!newUsername.trim()) {
      setError('Username cannot be empty');
      return;
    }

    // Validate username format
    const usernameError = validateUsername(newUsername.trim());
    if (usernameError) {
      setError(usernameError);
      return;
    }

    // Check if username already exists (excluding current user)
    const existingUser = appData.users.find(u => u.username === newUsername.trim() && u.username !== currentUser.username);
    if (existingUser) {
      setError('Username already exists');
      return;
    }

    const oldUsername = currentUser.username;
    const trimmedNewUsername = newUsername.trim();

    // Update user's username
    const updatedUsers = appData.users.map(user =>
      user.username === oldUsername
        ? { ...user, username: trimmedNewUsername }
        : user
    );

    // Create updated current user object with new username
    const updatedCurrentUser = { ...currentUser, username: trimmedNewUsername };

    // Update registeredBy field in game registration for players registered by this user
    const updatedGameRegistration = {
      ...appData.gameRegistration,
      mainRoster: appData.gameRegistration.mainRoster.map(player =>
        player && player.registeredBy === oldUsername
          ? { ...player, registeredBy: trimmedNewUsername }
          : player
      ),
      substitutes: appData.gameRegistration.substitutes.map(player =>
        player.registeredBy === oldUsername
          ? { ...player, registeredBy: trimmedNewUsername }
          : player
      )
    };

    // Update published teams if they exist
    if (updatedGameRegistration.publishedTeams) {
      updatedGameRegistration.publishedTeams = {
        ...updatedGameRegistration.publishedTeams,
        team1: updatedGameRegistration.publishedTeams.team1.map(player =>
          player.registeredBy === oldUsername
            ? { ...player, registeredBy: trimmedNewUsername }
            : player
        ),
        team2: updatedGameRegistration.publishedTeams.team2.map(player =>
          player.registeredBy === oldUsername
            ? { ...player, registeredBy: trimmedNewUsername }
            : player
        ),
        team3: updatedGameRegistration.publishedTeams.team3.map(player =>
          player.registeredBy === oldUsername
            ? { ...player, registeredBy: trimmedNewUsername }
            : player
        ),
        publishedBy: updatedGameRegistration.publishedTeams.publishedBy === oldUsername 
          ? trimmedNewUsername 
          : updatedGameRegistration.publishedTeams.publishedBy
      };
    }

    // Update both users array and current user for immediate display
    updateAppData({
      users: updatedUsers,
      gameRegistration: updatedGameRegistration,
      currentUser: updatedCurrentUser
    });

    setIsEditingUsername(false);
    setError('');
    setSuccess('Username updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handlePlayerNameChange = () => {
    const trimmedPlayerName = newPlayerName.trim();
    
    if (!trimmedPlayerName) {
      setError('Player name cannot be empty');
      return;
    }

    // Validate player name format
    const playerNameError = validatePlayerName(trimmedPlayerName);
    if (playerNameError) {
      setError(playerNameError);
      return;
    }

    // Check if player name already exists (excluding current user)
    const existingUser = appData.users.find(u => 
      u.playerName && 
      u.playerName.toLowerCase() === trimmedPlayerName.toLowerCase() && 
      u.username !== currentUser.username
    );
    if (existingUser) {
      setError('Player name already exists');
      return;
    }

    // Create updated current user object
    const updatedCurrentUser = { ...currentUser, playerName: trimmedPlayerName };
    
    // Update user's player name in the users array
    const updatedUsers = appData.users.map(user =>
      user.username === currentUser.username
        ? { ...user, playerName: trimmedPlayerName }
        : user
    );

    // Update both users array and current user
    updateAppData({ 
      users: updatedUsers,
      currentUser: updatedCurrentUser
    });

    setIsEditingPlayerName(false);
    setError('');
    setSuccess('Player name updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };
  const handleStatsUpdate = () => {
    if (!currentUser.isAdmin) {
      setError('Only admins can update stats');
      return;
    }

    const updatedCurrentUser = { ...currentUser, stats: editedStats };

    const updatedUsers = appData.users.map(user =>
      user.username === currentUser.username
        ? { ...user, stats: editedStats }
        : user
    );

    updateAppData({ 
      users: updatedUsers,
      currentUser: updatedCurrentUser
    });
    setIsEditingStats(false);
    setError('');
    setSuccess('Stats updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600" />
            Profile
          </h2>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-green-700 dark:text-green-300 text-sm">{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture Section */}
          <div className="lg:col-span-1">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center relative">
                  {currentUser.profilePicture ? (
                    <img
                      src={currentUser.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-gray-400" />
                  )}
                  
                  {/* Rank Emoji Overlay */}
                  <div 
                    className="absolute -top-2 -right-2 text-2xl cursor-help"
                    title={`${rankInfo.label} (${rankInfo.range} attendance)`}
                  >
                    {rankInfo.emoji}
                  </div>
                </div>

                {/* Upload/Remove Buttons */}
                <div className="mt-4 space-y-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors">
                      <Camera className="w-4 h-4" />
                      {uploading ? 'Uploading...' : 'Upload Photo'}
                    </div>
                  </label>
                  
                  {currentUser.profilePicture && (
                    <button
                      onClick={removeProfilePicture}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>

              {/* Rank Display */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">{rankInfo.emoji}</span>
                  <span className={`font-bold text-lg ${rankInfo.color}`}>
                    {rankInfo.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {userStats.gamesPlayed === 0 || totalGames === 0 
                    ? `${attendanceRate.toFixed(1)}% attendance (${userStats.gamesPlayed} games played)`
                    : `${attendanceRate.toFixed(1)}% attendance (${userStats.gamesPlayed}/${totalGames} games)`
                  }
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {rankInfo.range} attendance range
                </p>
              </div>
            </div>
          </div>

          {/* Profile Info Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  {isEditingUsername ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="Enter your username (5-20 characters)"
                      />
                      
                      <div className="flex gap-2">
                        <button
                          onClick={handleUsernameChange}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingUsername(false);
                            setNewUsername(currentUser?.username || '');
                            setError('');
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 dark:text-white font-medium">{currentUser.username}</span>
                        {currentUser.isAdmin && (
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                            {currentUser.isSuperAdmin ? 'Super Admin' : 'Admin'}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setIsEditingUsername(true)}
                        className="flex items-center gap-2 px-3 py-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      >
                        <UserCheck className="w-4 h-4" />
                        Edit
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Player Name
                  </label>
                  {isEditingPlayerName ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={newPlayerName}
                        onChange={(e) => setNewPlayerName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="Enter your player name (2-30 characters)"
                      />
                      
                      <div className="flex gap-2">
                        <button
                          onClick={handlePlayerNameChange}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingPlayerName(false);
                            setNewPlayerName(currentUser?.playerName || '');
                            setError('');
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900 dark:text-white">
                        {currentUser.playerName || (
                          <span className="text-gray-500 dark:text-gray-400 italic">Not set</span>
                        )}
                      </span>
                      <button
                        onClick={() => setIsEditingPlayerName(true)}
                        className="flex items-center gap-2 px-3 py-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <span className="text-gray-900 dark:text-white">{currentUser.phoneNumber}</span>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Statistics</h3>
                {currentUser.isAdmin && (
                  <button
                    onClick={() => setIsEditingStats(!isEditingStats)}
                    className="flex items-center gap-2 px-3 py-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    {isEditingStats ? 'Cancel' : 'Edit'}
                  </button>
                )}
              </div>

              {isEditingStats && currentUser.isAdmin ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Games Played
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editedStats.gamesPlayed}
                        onChange={(e) => setEditedStats(prev => ({ ...prev, gamesPlayed: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Time Played (minutes)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editedStats.timePlayed}
                        onChange={(e) => setEditedStats(prev => ({ ...prev, timePlayed: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Goals Scored
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editedStats.goalsScored}
                        onChange={(e) => setEditedStats(prev => ({ ...prev, goalsScored: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleStatsUpdate}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save Stats
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-3xl mb-2">👕</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {userStats.gamesPlayed}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Games Played</div>
                  </div>
                  
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-3xl mb-2">🕐</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatTime(userStats.timePlayed)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Time Played</div>
                  </div>
                  
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-3xl mb-2">⚽</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {userStats.goalsScored}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Goals Scored</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}