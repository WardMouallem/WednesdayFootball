import React, { useState, useMemo } from 'react';
import { Trophy, Clock, Target, Crown, Medal, Award, Star, Zap, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';

interface PlayerStat {
  username: string;
  playerName: string;
  value: number;
  rank: number;
  profilePicture?: string;
}

export function Stats() {
  const { appData } = useAuth();
  const [activeTab, setActiveTab] = useState<'goals' | 'playtime'>('goals');

  // Get all users with stats
  const usersWithStats = useMemo(() => {
    return appData.users.filter(user => 
      user.stats && 
      !user.isBlocked && 
      user.playerName && 
      user.playerName.trim() !== ''
    );
  }, [appData.users]);

  // Calculate top goal scorers
  const topGoalScorers = useMemo(() => {
    const scorers = usersWithStats
      .map(user => ({
        username: user.username,
        playerName: user.playerName || user.username,
        value: user.stats?.goalsScored || 0,
        rank: 0,
        profilePicture: user.profilePicture
      }))
      .filter(player => player.value > 0)
      .sort((a, b) => {
        // First sort by goals (descending)
        if (b.value !== a.value) {
          return b.value - a.value;
        }
        // If same goals, sort alphabetically by player name
        return a.playerName.localeCompare(b.playerName);
      })
      .slice(0, 10)
      .map((player, index) => ({ ...player, rank: index + 1 }));

    return scorers;
  }, [usersWithStats]);

  // Calculate top players by playing time
  const topPlaytimePlayers = useMemo(() => {
    const players = usersWithStats
      .map(user => ({
        username: user.username,
        playerName: user.playerName || user.username,
        value: user.stats?.timePlayed || 0,
        rank: 0,
        profilePicture: user.profilePicture
      }))
      .filter(player => player.value > 0)
      .sort((a, b) => {
        // First sort by playtime (descending)
        if (b.value !== a.value) {
          return b.value - a.value;
        }
        // If same playtime, sort alphabetically by player name
        return a.playerName.localeCompare(b.playerName);
      })
      .slice(0, 10)
      .map((player, index) => ({ ...player, rank: index + 1 }));

    return players;
  }, [usersWithStats]);

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getRankEmoji = (rank: number): string => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      case 4: return '🏅';
      case 5: return '🏅';
      default: return '⭐';
    }
  };

  const getRankColor = (rank: number): string => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600';
      case 2: return 'from-gray-300 to-gray-500';
      case 3: return 'from-amber-600 to-amber-800';
      case 4:
      case 5: return 'from-blue-400 to-blue-600';
      default: return 'from-purple-400 to-purple-600';
    }
  };

  const renderLeaderboard = (players: PlayerStat[], type: 'goals' | 'playtime') => {
    if (players.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">
            {type === 'goals' ? '⚽' : '⏱️'}
          </div>
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-2">
            No {type === 'goals' ? 'goals scored' : 'playtime recorded'} yet
          </p>
          <p className="text-gray-400 dark:text-gray-500">
            Stats will appear here once games are played!
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {players.map((player, index) => (
          <div
            key={player.username}
            className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              player.rank <= 3
                ? 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 dark:border-yellow-600'
                : 'border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-600'
            }`}
          >
            {/* Rank Badge */}
            <div className={`absolute top-0 left-0 w-16 h-16 bg-gradient-to-br ${getRankColor(player.rank)} flex items-center justify-center`}>
              <div className="text-center">
                <div className="text-2xl">{getRankEmoji(player.rank)}</div>
                <div className="text-xs font-bold text-white">#{player.rank}</div>
              </div>
            </div>

            {/* Player Info */}
            <div className="pl-20 pr-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Profile Picture */}
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    {player.profilePicture ? (
                      <img
                        src={player.profilePicture}
                        alt={`${player.playerName} profile`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  {/* Player Details */}
                  <div>
                    <h3 className={`text-xl font-bold ${
                      player.rank <= 3 
                        ? 'text-yellow-800 dark:text-yellow-200' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {player.playerName}
                    </h3>
                  </div>
                </div>

                {/* Stat Value */}
                <div className="text-right">
                  <div className={`text-3xl font-bold ${
                    player.rank <= 3 
                      ? 'text-yellow-800 dark:text-yellow-200' 
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {type === 'goals' ? player.value : formatTime(player.value)}
                  </div>
                  <div className={`text-sm ${
                    player.rank <= 3 
                      ? 'text-yellow-600 dark:text-yellow-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {type === 'goals' ? (player.value === 1 ? 'goal' : 'goals') : 'played'}
                  </div>
                </div>
              </div>

              {/* Achievement Badges for Top 3 */}
              {player.rank <= 3 && (
                <div className="mt-4 flex items-center gap-2">
                  {player.rank === 1 && (
                    <span className="px-3 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 text-xs font-bold rounded-full flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      {type === 'goals' ? 'Top Scorer' : 'Most Active'}
                    </span>
                  )}
                  {player.rank === 2 && (
                    <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-full flex items-center gap-1">
                      <Medal className="w-3 h-3" />
                      Runner-up
                    </span>
                  )}
                  {player.rank === 3 && (
                    <span className="px-3 py-1 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-xs font-bold rounded-full flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Third Place
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Decorative Elements for Top 3 */}
            {player.rank <= 3 && (
              <div className="absolute top-2 right-2 opacity-20">
                {type === 'goals' ? (
                  <Target className="w-8 h-8 text-yellow-600" />
                ) : (
                  <Zap className="w-8 h-8 text-blue-600" />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 relative">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-600" />
            Player Statistics
            <Trophy className="w-8 h-8 text-yellow-600" />
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            🏆 Celebrating our top performers in the Wednesday Football League! 🏆
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setActiveTab('goals')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'goals'
                  ? 'bg-white dark:bg-gray-800 text-yellow-600 shadow-md transform scale-105'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Target className="w-5 h-5" />
              ⚽ Top Goal Scorers
            </button>
            <button
              onClick={() => setActiveTab('playtime')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'playtime'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-md transform scale-105'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-5 h-5" />
              ⏱️ Most Playing Time
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-200 dark:bg-yellow-800 rounded-lg">
                <Target className="w-6 h-6 text-yellow-800 dark:text-yellow-200" />
              </div>
              <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200">Total Goals</h3>
            </div>
            <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
              {usersWithStats.reduce((sum, user) => sum + (user.stats?.goalsScored || 0), 0)}
            </p>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">Scored this season</p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-200 dark:bg-blue-800 rounded-lg">
                <Clock className="w-6 h-6 text-blue-800 dark:text-blue-200" />
              </div>
              <h3 className="text-lg font-bold text-blue-800 dark:text-blue-200">Total Playtime</h3>
            </div>
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {formatTime(usersWithStats.reduce((sum, user) => sum + (user.stats?.timePlayed || 0), 0))}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400">Played this season</p>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-200 dark:bg-purple-800 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-800 dark:text-purple-200" />
              </div>
              <h3 className="text-lg font-bold text-purple-800 dark:text-purple-200">Active Players</h3>
            </div>
            <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {usersWithStats.filter(user => (user.stats?.gamesPlayed || 0) > 0).length}
            </p>
            <p className="text-sm text-purple-600 dark:text-purple-400">With game stats</p>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Star className="w-6 h-6 text-yellow-500" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {activeTab === 'goals' ? '🎯 Top Goal Scorers' : '⚡ Most Active Players'}
            </h3>
            <Star className="w-6 h-6 text-yellow-500" />
          </div>
          
          {renderLeaderboard(
            activeTab === 'goals' ? topGoalScorers : topPlaytimePlayers,
            activeTab
          )}
        </div>

        {/* Footer Message */}
        <div className="text-center mt-8 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-700">
          <p className="text-green-800 dark:text-green-200 font-medium">
            🌟 Keep playing, keep scoring, keep having fun! 🌟
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            Stats are updated after each game. May the best players win! ⚽
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}