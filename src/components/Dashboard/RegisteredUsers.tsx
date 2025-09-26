import React, { useState } from 'react';
import { Users, UserX, Shield, ShieldOff, Trash2, AlertCircle, Crown, UserPlus, Plus, Check, X, Clock, UserCheck, ArrowLeft, Edit3, Save, Trophy, Star, Zap, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { User, PendingUser } from '../../types';

const RANK_CONFIG = {
  rookie: { emoji: '🔰', label: 'Rookie', range: '0-25%' },
  squad: { emoji: '⚽', label: 'Squad Player', range: '26-50%' },
  starter: { emoji: '🌟', label: 'Starter', range: '51-70%' },
  captain: { emoji: '👑', label: 'Captain', range: '71-85%' },
  legend: { emoji: '🏆', label: 'Legend', range: '86-100%' }
};

type RankType = keyof typeof RANK_CONFIG;

export function RegisteredUsers() {
  const { currentUser, appData, updateAppData } = useAuth();
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditingStats, setIsEditingStats] = useState(false);
  const [editedStats, setEditedStats] = useState({
    gamesPlayed: 0,
    timePlayed: 0,
    goalsScored: 0
  });
  const [userToRemove, setUserToRemove] = useState<string | null>(null);
  const [userToBlock, setUserToBlock] = useState<string | null>(null);
  const [userToUnblock, setUserToUnblock] = useState<string | null>(null);
  const [showCreateAdminForm, setShowCreateAdminForm] = useState(false);
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [error, setError] = useState('');

  // Initialize stats when selecting a user
  React.useEffect(() => {
    if (selectedUser) {
      const userStats = selectedUser.stats || { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 };
      setEditedStats(userStats);
    }
  }, [selectedUser]);

  // Pending user approval functions
  const approveUser = (pendingUser: PendingUser) => {
    const newUser: User = {
      username: pendingUser.username,
      phoneNumber: pendingUser.phoneNumber,
      playerName: pendingUser.playerName,
      isAdmin: false,
      isBlocked: false
    };

    const updatedUsers = [...appData.users, newUser];
    const updatedPendingUsers = appData.pendingUsers.filter(u => u.id !== pendingUser.id);

    updateAppData({
      users: updatedUsers,
      pendingUsers: updatedPendingUsers
    });
  };

  const denyUser = (pendingUserId: string) => {
    const updatedPendingUsers = appData.pendingUsers.filter(u => u.id !== pendingUserId);
    updateAppData({ pendingUsers: updatedPendingUsers });
  };

  const regularUsers = appData.users.filter(user => !user.isAdmin);
  const adminUsers = appData.users.filter(user => user.isAdmin);
  const blockedUsers = regularUsers.filter(user => user.isBlocked);
  const activeUsers = regularUsers.filter(user => !user.isBlocked);

  // Only admin can access this component
  if (!currentUser?.isAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-4 text-center">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
          <p className="text-red-700 dark:text-red-300">Access denied. Admin privileges required.</p>
        </div>
      </div>
    );
  }

  const removeUser = (username: string) => {
    // CRITICAL DATA PROTECTION: Enforce removal rules
    const userToRemove = appData.users.find(user => user.username === username);
    if (!userToRemove) return;
    
    // NEVER allow removal of Super Admin
    if (userToRemove.isSuperAdmin) {
      console.error('BLOCKED: Cannot remove Super Admin user');
      return;
    }
    
    // Only Super Admin can remove other Admins
    if (userToRemove.isAdmin && !currentUser?.isSuperAdmin) {
      console.error('BLOCKED: Only Super Admin can remove Admin users');
      return;
    }
    
    // Only Admins can remove regular users
    if (!userToRemove.isAdmin && !currentUser?.isAdmin) {
      console.error('BLOCKED: Only Admins can remove regular users');
      return;
    }
    
    console.log(`🔒 AUTHORIZED REMOVAL: ${currentUser?.isSuperAdmin ? 'Super Admin' : 'Admin'} removing ${userToRemove.isAdmin ? 'Admin' : 'regular user'}: ${username}`);
    const updatedUsers = appData.users.filter(user => user.username !== username);
    updateAppData({ users: updatedUsers });
    setUserToRemove(null);
  };

  const blockUser = (username: string) => {
    const updatedUsers = appData.users.map(user => 
      user.username === username ? { ...user, isBlocked: true } : user
    );
    updateAppData({ users: updatedUsers });
    setUserToBlock(null);
  };

  const unblockUser = (username: string) => {
    const updatedUsers = appData.users.map(user => 
      user.username === username ? { ...user, isBlocked: false } : user
    );
    updateAppData({ users: updatedUsers });
    setUserToUnblock(null);
  };

  const createAdmin = () => {
    if (!newAdminUsername.trim() || !newAdminPhone.trim() || !newAdminPassword.trim()) {
      setError('All fields are required');
      return;
    }

    // Check if username already exists
    if (appData.users.some(user => user.username === newAdminUsername.trim())) {
      setError('Username already exists');
      return;
    }

    // Check if phone number already exists
    if (appData.users.some(user => user.phoneNumber === newAdminPhone.trim())) {
      setError('Phone number already registered');
      return;
    }

    const newAdmin: User = {
      username: newAdminUsername.trim(),
      phoneNumber: newAdminPhone.trim(),
      password: newAdminPassword.trim(),
      isAdmin: true,
      isSuperAdmin: false,
      isBlocked: false
    };

    const updatedUsers = [...appData.users, newAdmin];
    updateAppData({ users: updatedUsers });
    
    setNewAdminUsername('');
    setNewAdminPhone('');
    setNewAdminPassword('');
    setShowCreateAdminForm(false);
    setError('');
  };

  const handleUserClick = (user: User) => {
    // Don't open profile if clicking on action buttons
    setSelectedUser(user);
    setIsEditingStats(false);
  };

  const handleStatsUpdate = () => {
    if (!selectedUser) return;

    const updatedUsers = appData.users.map(user =>
      user.username === selectedUser.username
        ? { ...user, stats: editedStats }
        : user
    );

    updateAppData({ users: updatedUsers });
    setSelectedUser(prev => prev ? { ...prev, stats: editedStats } : null);
    setIsEditingStats(false);
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getUserRank = (user: User): RankType => {
    const userStats = user.stats || { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 };
    const totalGames = appData.totalGames || 1;
    
    // Handle edge case: if no games have been played yet, everyone is rookie
    if (totalGames === 0) return 'rookie';
    
    const attendanceRate = (userStats.gamesPlayed / totalGames) * 100;
    
    if (attendanceRate >= 86) return 'legend';
    if (attendanceRate >= 71) return 'captain';
    if (attendanceRate >= 51) return 'starter';
    if (attendanceRate >= 26) return 'squad';
    return 'rookie';
  };

  // If a user is selected, show their profile
  if (selectedUser) {
    const userStats = selectedUser.stats || { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 };
    const totalGames = appData.totalGames || 1;
    const attendanceRate = (userStats.gamesPlayed / totalGames) * 100;
    const rank = getUserRank(selectedUser);
    const rankInfo = RANK_CONFIG[rank];

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                {selectedUser.username}'s Profile
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Picture Section */}
            <div className="lg:col-span-1">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center relative">
                    {selectedUser.profilePicture ? (
                      <img
                        src={selectedUser.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-16 h-16 text-gray-400" />
                    )}
                    
                    {/* Rank Emoji Overlay */}
                    <div 
                      className="absolute -top-2 -right-2 text-2xl cursor-help"
                      title={`${rankInfo.label} (${rankInfo.range} attendance)`}
                    >
                      {rankInfo.emoji}
                    </div>
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
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 dark:text-white font-medium">{selectedUser.username}</span>
                      {selectedUser.isAdmin && (
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                          {selectedUser.isSuperAdmin ? 'Super Admin' : 'Admin'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Player Name
                    </label>
                    <span className="text-gray-900 dark:text-white">
                      {selectedUser.playerName || (
                        <span className="text-gray-500 dark:text-gray-400 italic">Not set</span>
                      )}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <span className="text-gray-900 dark:text-white">{selectedUser.phoneNumber}</span>
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Statistics</h3>
                  <button
                    onClick={() => setIsEditingStats(!isEditingStats)}
                    className="flex items-center gap-2 px-3 py-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    {isEditingStats ? 'Cancel' : 'Edit Stats'}
                  </button>
                </div>

                {isEditingStats ? (
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

  const renderUserCard = (user: User) => {
    const isBlocked = user.isBlocked || false;
    const isAdmin = user.isAdmin || false;
    const isSuperAdmin = user.isSuperAdmin || false;
    const canRemoveAdmin = currentUser?.isSuperAdmin === true && isAdmin && !isSuperAdmin;
    const rank = getUserRank(user);
    const rankInfo = RANK_CONFIG[rank];
    
    return (
      <div
        key={user.username}
        onClick={() => handleUserClick(user)}
        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
          isAdmin
            ? 'border-purple-300 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-700'
            : isBlocked
            ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700'
            : 'border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600'
        } cursor-pointer hover:shadow-md`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center relative ${
              isAdmin
                ? 'bg-purple-100 dark:bg-purple-900/30'
                : isBlocked 
                ? 'bg-red-100 dark:bg-red-900/30' 
                : 'bg-blue-100 dark:bg-blue-900/30'
            }`}>
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={`${user.username} profile`}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : isAdmin ? (
                <Crown className={`w-5 h-5 ${
                  isSuperAdmin 
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-purple-600 dark:text-purple-400'
                }`} />
              ) : (
                <Users className={`w-5 h-5 ${
                  isBlocked 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-blue-600 dark:text-blue-400'
                }`} />
              )}
              {/* Rank Emoji Overlay */}
              <div 
                className="absolute -top-1 -right-1 text-sm cursor-help"
                title={`${rankInfo.label} (${rankInfo.range} attendance)`}
              >
                {rankInfo.emoji}
              </div>
            </div>
            
            <div>
              <div className={`font-medium ${
                isAdmin
                  ? 'text-purple-900 dark:text-purple-100'
                  : isBlocked 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                {user.username}
                {isSuperAdmin && (
                  <span className="ml-2 px-2 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
                    Super Admin
                  </span>
                )}
                {isAdmin && !isSuperAdmin && (
                  <span className="ml-2 px-2 py-1 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                    Admin
                  </span>
                )}
                {isBlocked && (
                  <span className="ml-2 px-2 py-1 bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 text-xs rounded-full">
                    Blocked
                  </span>
                )}
              </div>
              <div className={`text-sm ${
                isAdmin
                  ? 'text-purple-600 dark:text-purple-400'
                  : isBlocked 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {(currentUser?.isAdmin || user.username === currentUser?.username) && user.phoneNumber ? user.phoneNumber : 'Phone hidden'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Block/Unblock Actions - Only for regular users */}
            {!isAdmin && !isBlocked ? (
              userToBlock === user.username ? (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">block user?</span>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        blockUser(user.username);
                      }}
                      className="px-2 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded transition-colors"
                    >
                      Yes
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setUserToBlock(null);
                      }}
                      className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded transition-colors"
                    >
                      No
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserToBlock(user.username);
                  }}
                  className="p-2 text-orange-500 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
                  title="Block user"
                >
                  <Shield className="w-4 h-4" />
                </button>
              )
            ) : !isAdmin && isBlocked ? (
              userToUnblock === user.username ? (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">unblock user?</span>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        unblockUser(user.username);
                      }}
                      className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                    >
                      Yes
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setUserToUnblock(null);
                      }}
                      className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded transition-colors"
                    >
                      No
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserToUnblock(user.username);
                  }}
                  className="p-2 text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                  title="Unblock user"
                >
                  <ShieldOff className="w-4 h-4" />
                </button>
              )
            ) : null}

            {/* Remove Action */}
            {((!isAdmin && currentUser?.isAdmin) || (canRemoveAdmin && !user.isSuperAdmin)) && userToRemove === user.username ? (
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  remove {isAdmin ? 'admin' : 'user'}?
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeUser(user.username);
                    }}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                  >
                    Yes
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserToRemove(null);
                    }}
                    className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded transition-colors"
                  >
                    No
                  </button>
                </div>
              </div>
            ) : ((!isAdmin && currentUser?.isAdmin) || (canRemoveAdmin && !user.isSuperAdmin)) ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUserToRemove(user.username);
                }}
                className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                title={user.isSuperAdmin ? 'Super Admin cannot be removed' : `Remove ${isAdmin ? 'admin' : 'user'}`}
                disabled={user.isSuperAdmin}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Registered Users
          </h2>
          <div className="flex items-center gap-4">
            {currentUser?.isSuperAdmin === true ? (
              <button
                onClick={() => setShowCreateAdminForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Create Admin
              </button>
            ) : null}
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total: {appData.users.length} users ({adminUsers.length} admins, {activeUsers.length} active, {blockedUsers.length} blocked)
              {appData.pendingUsers.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 text-xs rounded-full">
                  {appData.pendingUsers.length} pending
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Create Admin Form */}
        {showCreateAdminForm && currentUser?.isSuperAdmin === true ? (
          <div className="mb-6 p-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-4">Create New Admin</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={newAdminUsername}
                  onChange={(e) => setNewAdminUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newAdminPhone}
                  onChange={(e) => setNewAdminPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter password"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={createAdmin}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                <Check className="w-4 h-4" />
                Create Admin
              </button>
              <button
                onClick={() => {
                  setShowCreateAdminForm(false);
                  setNewAdminUsername('');
                  setNewAdminPhone('');
                  setNewAdminPassword('');
                  setError('');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        ) : showCreateAdminForm ? (
          <div className="mb-6 p-4 bg-red-100 rounded-lg">
            <p className="text-red-700">Access denied. Super admin privileges required.</p>
          </div>
        ) : null}

        {appData.users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No users registered yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending Users - Show first if any exist */}
            {appData.pendingUsers.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  Pending Approval ({appData.pendingUsers.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {appData.pendingUsers.map((pendingUser) => (
                    <div
                      key={pendingUser.id}
                      className="p-4 rounded-lg border-2 border-orange-300 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-700"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-100 dark:bg-orange-900/30">
                            <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                          </div>
                          
                          <div>
                            <div className="font-medium text-orange-900 dark:text-orange-100">
                              {pendingUser.username}
                              <span className="ml-2 px-2 py-1 bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 text-xs rounded-full">
                                Pending
                              </span>
                            </div>
                            <div className="text-sm text-orange-600 dark:text-orange-400">
                              {pendingUser.phoneNumber}
                            </div>
                            {pendingUser.playerName && (
                              <div className="text-xs text-orange-500 dark:text-orange-500">
                                Player: {pendingUser.playerName}
                              </div>
                            )}
                            <div className="text-xs text-orange-500 dark:text-orange-500">
                              Requested: {new Date(pendingUser.requestedAt).toLocaleDateString()} {new Date(pendingUser.requestedAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => approveUser(pendingUser)}
                            className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                            title="Approve user"
                          >
                            <UserCheck className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => denyUser(pendingUser.id)}
                            className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                            title="Deny user"
                          >
                            <X className="w-4 h-4" />
                            Deny
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Users - Visible to all admins */}
            {currentUser?.isAdmin && adminUsers.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-purple-600" />
                  Admin Users ({adminUsers.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {adminUsers.map(renderUserCard)}
                </div>
              </div>
            ) : currentUser?.isAdmin ? (
              <div className="p-4 bg-yellow-100 rounded-lg">
                <p className="text-yellow-700">No admin users found.</p>
              </div>
            ) : null}

            {/* Active Users */}
            {activeUsers.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Active Users ({activeUsers.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeUsers.map(renderUserCard)}
                </div>
              </div>
            )}

            {/* Blocked Users */}
            {blockedUsers.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <UserX className="w-5 h-5 text-red-600" />
                  Blocked Users ({blockedUsers.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {blockedUsers.map(renderUserCard)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}