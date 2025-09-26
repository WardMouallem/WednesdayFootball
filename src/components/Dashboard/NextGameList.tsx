import React, { useState, useEffect } from 'react';
import { Calendar, Plus, X, Users, Trash2, AlertCircle, UserPlus, Zap, Clock, Lock, UserCheck, UserX, CreditCard as Edit3, Save, Key, Shuffle, FileText, Copy, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Player } from '../../types';
import { isValidIsraeliPhoneNumber, formatIsraeliPhoneNumber } from '../../utils/validation';
import { getSharedData, DATA_KEYS } from '../../lib/supabase';

const RANK_CONFIG = {
  rookie: { emoji: '🔰', label: 'Rookie', range: '0-25%' },
  squad: { emoji: '⚽', label: 'Squad Player', range: '26-50%' },
  starter: { emoji: '🌟', label: 'Starter', range: '51-70%' },
  captain: { emoji: '👑', label: 'Captain', range: '71-85%' },
  legend: { emoji: '🏆', label: 'Legend', range: '86-100%' }
};

type RankType = keyof typeof RANK_CONFIG;

export function NextGameList() {
  const { currentUser, appData, updateAppData, changePassword } = useAuth();
  const [showTeamsChangedBanner, setShowTeamsChangedBanner] = useState(false);
  const [showAddPlayerForm, setShowAddPlayerForm] = useState(false);
  const [showTeamPublishingModal, setShowTeamPublishingModal] = useState(false);
  const [showFinalWhistleConfirm, setShowFinalWhistleConfirm] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPhone, setNewPlayerPhone] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [error, setError] = useState('');
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  
  // Calculate next Wednesday 20:30
  const getNextWednesday = () => {
    const now = new Date();
    const nextWed = new Date();
    
    // Get current day (0 = Sunday, 3 = Wednesday)
    const currentDay = now.getDay();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Calculate days until next Wednesday
    let daysUntilWednesday;
    if (currentDay < 3) {
      // Before Wednesday this week
      daysUntilWednesday = 3 - currentDay;
    } else if (currentDay === 3) {
      // It's Wednesday - check if it's before 20:30
      if (currentHour < 20 || (currentHour === 20 && currentMinute < 30)) {
        daysUntilWednesday = 0; // Today
      } else {
        daysUntilWednesday = 7; // Next Wednesday
      }
    } else {
      // After Wednesday this week
      daysUntilWednesday = 7 - currentDay + 3;
    }
    
    nextWed.setDate(now.getDate() + daysUntilWednesday);
    nextWed.setHours(20, 30, 0, 0);
    
    return nextWed;
  };

  const nextGameDate = getNextWednesday();
  
  // Calculate time left until next game
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Update current time every second for countdown
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      const now = new Date();
      const diff = nextGameDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextGameDate]);

  // Format countdown time
  const formatCountdown = (targetDate: Date) => {
    const now = currentTime;
    const diff = targetDate.getTime() - now.getTime();
    
    if (diff <= 0) {
      return "Game time!";
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);
    
    return parts.join(' ');
  };

  const [editPhone, setEditPhone] = useState('');
  const [playerToRemove, setPlayerToRemove] = useState<string | null>(null);
  const [showTextList, setShowTextList] = useState(false);
  const [generatedTextList, setGeneratedTextList] = useState('');
  const [playerToConfirm, setPlayerToConfirm] = useState<string | null>(null);
  const [playerToUnconfirm, setPlayerToUnconfirm] = useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showFillRandomModal, setShowFillRandomModal] = useState(false);
  const [showGenerateTeamsModal, setShowGenerateTeamsModal] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [editingTeams, setEditingTeams] = useState<{
    team1: Player[];
    team2: Player[];
    team3: Player[];
  } | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [invalidatedPlayers, setInvalidatedPlayers] = useState<Set<string>>(new Set());
  const [warningMessage, setWarningMessage] = useState('');
  const [isTeamUpdatePromptActive, setIsTeamUpdatePromptActive] = useState(false);
  const [needsTeamUpdateState, setNeedsTeamUpdate] = useState(false);
  const [timeUntilOpen, setTimeUntilOpen] = useState({ days: 0, hours: 0, minutes: 0 });
  const [showTeamUpdateBanner, setShowTeamUpdateBanner] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isBlowingWhistle, setIsBlowingWhistle] = useState(false);

  const [teamInvalidationMessage, setTeamInvalidationMessage] = useState('');
  const gameRegistration = appData.gameRegistration;
  
  // Check if teams need update based on published teams vs confirmed players
  const needsTeamUpdate = React.useMemo(() => {
    if (!gameRegistration.publishedTeams) return false;
    
    const { team1, team2, team3 } = gameRegistration.publishedTeams;
    const allTeamPlayers = [...team1, ...team2, ...(team3 || [])];
    
    // Check if any player in published teams is no longer confirmed
    return allTeamPlayers.some(teamPlayer => {
      if (!teamPlayer) return false;
      
      // Find the player in current roster/substitutes
      const currentPlayer = gameRegistration.mainRoster.find(p => p?.id === teamPlayer.id) ||
                           gameRegistration.substitutes.find(p => p.id === teamPlayer.id);
      
      // Player needs update if they don't exist anymore or are not confirmed
      return !currentPlayer || !currentPlayer.isConfirmed;
    });
  }, [gameRegistration]);
  
  const mainRosterCount = gameRegistration.mainRoster.filter(player => player !== null).length;
  const canRegister = !gameRegistration.isRegistrationLocked && currentUser;
  
  // Count players registered by current user
  const playersRegisteredByUser = currentUser?.isAdmin ? 0 : [
    ...gameRegistration.mainRoster.filter(player => player !== null),
    ...gameRegistration.substitutes
  ].filter(player => player && player.registeredBy === currentUser?.username).length;

  const canAddMorePlayers = currentUser?.isAdmin || playersRegisteredByUser < 2;

  // Get user rank based on attendance
  const getUserRank = (username: string): RankType => {
    const user = appData.users.find(u => u.username === username);
    if (!user) return 'rookie';
    
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

  // Check if a player is self-registered (username matches player name)
  const isSelfRegistered = (player: Player): boolean => {
    return player.name === player.registeredBy;
  };

  // Get user profile picture
  const getUserProfilePicture = (username: string): string | undefined => {
    const user = appData.users.find(u => u.username === username);
    return user?.profilePicture;
  };

  // Countdown timer effect
  useEffect(() => {
    if (!appData.gameRegistration.isRegistrationLocked) return;

    const calculateTimeUntilOpen = () => {
      const now = new Date();
      const nextSunday = new Date();
      
      // Get current day (0 = Sunday, 1 = Monday, etc.)
      const currentDay = now.getDay();
      const currentHour = now.getHours();
      
      if (currentDay === 0 && currentHour < 12) {
        // It's Sunday before 12:00 PM, target today at 12:00 PM
        nextSunday.setHours(12, 0, 0, 0);
      } else {
        // Target next Sunday at 12:00 PM
        const daysUntilSunday = currentDay === 0 ? 7 : 7 - currentDay;
        nextSunday.setDate(now.getDate() + daysUntilSunday);
        nextSunday.setHours(12, 0, 0, 0);
      }
      
      const timeDiff = nextSunday.getTime() - now.getTime();
      
      if (timeDiff <= 0) {
        return { days: 0, hours: 0, minutes: 0 };
      }
      
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      
      return { days, hours, minutes };
    };

    // Update immediately
    setTimeUntilOpen(calculateTimeUntilOpen());

    // Update every minute
    const interval = setInterval(() => {
      setTimeUntilOpen(calculateTimeUntilOpen());
    }, 60000);

    return () => clearInterval(interval);
  }, [appData.gameRegistration.isRegistrationLocked]);

  const registerSelfAsPlayer = () => {
    if (!currentUser?.playerName) {
      setError('Please set your player name in your profile first');
      return;
    }

    // Check if user is already registered
    const isAlreadyRegistered = [...gameRegistration.mainRoster, ...gameRegistration.substitutes]
      .some(player => player && player.registeredBy === currentUser.username && player.isRegisteredUser);

    if (isAlreadyRegistered) {
      setError('You are already registered for this game');
      return;
    }

    const newPlayer: Player = {
      id: `self_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: currentUser.playerName,
      phoneNumber: currentUser.phoneNumber,
      registeredBy: currentUser.username,
      registeredAt: Date.now(),
      isConfirmed: true,
      isRegisteredUser: true
    };

    // Find first empty slot in main roster
    const emptySlotIndex = gameRegistration.mainRoster.findIndex(slot => slot === null);
    
    let updatedGameRegistration;
    if (emptySlotIndex !== -1) {
      // Add to main roster
      const newMainRoster = [...gameRegistration.mainRoster];
      newMainRoster[emptySlotIndex] = newPlayer;
      updatedGameRegistration = {
        ...gameRegistration,
        mainRoster: newMainRoster
      };
    } else {
      // Add to substitutes
      updatedGameRegistration = {
        ...gameRegistration,
        substitutes: [...gameRegistration.substitutes, newPlayer]
      };
    }

    updateAppData({ gameRegistration: updatedGameRegistration });
    setError('');
  };

  const addPlayer = async () => {
    if (!currentUser || !newPlayerName.trim()) {
      setError('Player name is required');
      return;
    }

    // Check if regular user has reached the limit
    if (!currentUser.isAdmin && !canAddMorePlayers) {
      setError('You have reached the maximum of 2 registered players');
      return;
    }

    // Check for duplicate player names
    const allPlayers = [
      ...gameRegistration.mainRoster.filter(player => player !== null),
      ...gameRegistration.substitutes
    ];
    
    if (allPlayers.some(player => player && player.name.toLowerCase() === newPlayerName.trim().toLowerCase())) {
      setError('A player with this name is already registered');
      return;
    }

    if (newPlayerPhone.trim() && !isValidIsraeliPhoneNumber(newPlayerPhone)) {
      setError('Please enter a valid Israeli phone number');
      return;
    }

    // Check for duplicate phone numbers
    if (newPlayerPhone.trim()) {
      const allPlayers = [
        ...gameRegistration.mainRoster.filter(player => player !== null),
        ...gameRegistration.substitutes
      ];
      
      if (allPlayers.some(player => player && player.phoneNumber === newPlayerPhone.trim())) {
        setError('This phone number is already registered');
        return;
      }
    }

    try {
      // Fetch the latest registration data to handle race conditions
      const latestRegistration = await getSharedData(DATA_KEYS.GAME_REGISTRATION);
      const currentRegistration = latestRegistration || gameRegistration;
      
      const currentMainRosterCount = currentRegistration.mainRoster.filter(player => player !== null).length;
      
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: newPlayerName.trim(),
        phoneNumber: newPlayerPhone.trim() || '',
        registeredBy: currentUser.username,
        registeredAt: Date.now(),
        isConfirmed: false
      };

      let updatedRegistration;
      let successMsg = '';

      if (currentMainRosterCount < 18) {
        // Add to main roster
        const updatedMainRoster = [...currentRegistration.mainRoster];
        const firstEmptyIndex = updatedMainRoster.findIndex(player => player === null);
        if (firstEmptyIndex !== -1) {
          updatedMainRoster[firstEmptyIndex] = newPlayer;
        }
        
        updatedRegistration = {
          ...currentRegistration,
          mainRoster: updatedMainRoster
        };
        successMsg = 'Player registered to the main roster successfully';
      } else {
        // Add to substitutes
        updatedRegistration = {
          ...currentRegistration,
          substitutes: [...currentRegistration.substitutes, newPlayer]
        };
        successMsg = 'Player registered to the substitutes list successfully';
      }

      updateAppData({ gameRegistration: updatedRegistration });
      setNewPlayerName('');
      setNewPlayerPhone('');
      setError('');
      setSuccessMessage(successMsg);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error adding player:', error);
      setError('Failed to register player. Please try again.');
    }
  };

  // Show celebratory banner when all 18 main roster slots are filled and confirmed
  const mainRosterPlayers = gameRegistration.mainRoster.filter(player => player !== null);
  const allMainRosterConfirmed = mainRosterPlayers.length === 18 && mainRosterPlayers.every(player => player.isConfirmed);
  const showCelebration = mainRosterPlayers.length === 18 && allMainRosterConfirmed;

  const confirmAllPlayers = () => {
    const updatedGameRegistration = {
      ...appData.gameRegistration,
      mainRoster: appData.gameRegistration.mainRoster.map(player => 
        player ? { ...player, isConfirmed: true } : null
      ),
      substitutes: appData.gameRegistration.substitutes.map(player => 
        ({ ...player, isConfirmed: true })
      )
    };
    
    updateAppData({ gameRegistration: updatedGameRegistration });
    
    // Reset the team update flag since we have a new valid teams list
    setNeedsTeamUpdate(false);
  };

  const unconfirmAllPlayers = () => {
    const updatedGameRegistration = {
      ...appData.gameRegistration,
      mainRoster: appData.gameRegistration.mainRoster.map(player => 
        player ? { ...player, isConfirmed: false } : null
      ),
      substitutes: appData.gameRegistration.substitutes.map(player => 
        ({ ...player, isConfirmed: false })
      )
    };
    
    updateAppData({ gameRegistration: updatedGameRegistration });
  };

  const removePlayer = (playerId: string) => {
    const updatedRegistration = { ...appData.gameRegistration };
    
    // Check if player was in published teams before removal
    const wasInPublishedTeams = updatedRegistration.publishedTeams && (
      updatedRegistration.publishedTeams.team1.some(p => p?.id === playerId) ||
      updatedRegistration.publishedTeams.team2.some(p => p?.id === playerId) ||
      (updatedRegistration.publishedTeams.team3 && updatedRegistration.publishedTeams.team3.some(p => p?.id === playerId))
    );
    
    // Check if player is in main roster
    const mainRosterIndex = updatedRegistration.mainRoster.findIndex(player => player?.id === playerId);
    const isInMainRoster = mainRosterIndex !== -1;
    
    if (isInMainRoster) {
      // Remove from main roster
      updatedRegistration.mainRoster[mainRosterIndex] = null;
      
      // If there are substitutes, promote the first one to fill the empty spot
      if (updatedRegistration.substitutes.length > 0) {
        const firstSubstitute = updatedRegistration.substitutes[0];
        updatedRegistration.mainRoster[mainRosterIndex] = firstSubstitute;
        updatedRegistration.substitutes = updatedRegistration.substitutes.slice(1);
      }
    } else {
      // Remove from substitutes list
      updatedRegistration.substitutes = updatedRegistration.substitutes.filter(player => player.id !== playerId);
    }
    
    // Show banner if player was in published teams
    if (wasInPublishedTeams) {
      setShowTeamsChangedBanner(true);
    }

    updateAppData({ gameRegistration: updatedRegistration });
  };

  const confirmPlayer = (playerId: string) => {
    const updatedMainRoster = gameRegistration.mainRoster.map(player => 
      player?.id === playerId ? { ...player, isConfirmed: true } : player
    );
    const updatedSubstitutes = gameRegistration.substitutes.map(player => 
      player.id === playerId ? { ...player, isConfirmed: true } : player
    );
    
    updateAppData({
      gameRegistration: {
        ...gameRegistration,
        mainRoster: updatedMainRoster,
        substitutes: updatedSubstitutes
      }
    });
    setPlayerToConfirm(null);
  };

  const unconfirmPlayer = (playerId: string) => {
    const player = gameRegistration.mainRoster.find(p => p?.id === playerId) || 
                   gameRegistration.substitutes.find(p => p.id === playerId);
    
    // Check if player exists in published teams and is being unconfirmed
    if (player && player.isConfirmed && appData.gameRegistration.publishedTeams) {
      const { team1, team2, team3 } = appData.gameRegistration.publishedTeams;
      const allTeamPlayers = [...team1, ...team2, ...(team3 || [])];
      const playerExistsInTeams = allTeamPlayers.some(teamPlayer => 
        teamPlayer && teamPlayer.id === player.id
      );
      
      if (playerExistsInTeams) {
        setIsTeamUpdatePromptActive(true);
      }
    }

    const updatedMainRoster = gameRegistration.mainRoster.map(player => 
      player?.id === playerId ? { ...player, isConfirmed: false } : player
    );
    const updatedSubstitutes = gameRegistration.substitutes.map(player => 
      player.id === playerId ? { ...player, isConfirmed: false } : player
    );
    
    updateAppData({
      gameRegistration: {
        ...gameRegistration,
        mainRoster: updatedMainRoster,
        substitutes: updatedSubstitutes
      }
    });
    setPlayerToUnconfirm(null);
  };

  const toggleRegistrationLock = () => {
    updateAppData({
      gameRegistration: {
        ...gameRegistration,
        isRegistrationLocked: !gameRegistration.isRegistrationLocked
      }
    });
  };

  const clearAllRegistrations = () => {
    updateAppData({
      gameRegistration: {
        mainRoster: Array(18).fill(null),
        substitutes: [],
        isRegistrationLocked: false,
        publishedTeams: null
      }
    });
    setShowClearAllModal(false);
  };

  const fillRandomList = () => {
    const randomNames = [
      'Lionel Messi', 'Cristiano Ronaldo', 'Neymar Jr', 'Kylian Mbappé', 'Erling Haaland',
      'Kevin De Bruyne', 'Robert Lewandowski', 'Karim Benzema', 'Luka Modrić', 'Virgil van Dijk',
      'Mohamed Salah', 'Sadio Mané', 'Harry Kane', 'Son Heung-min', 'Bruno Fernandes',
      'Paul Pogba', 'N\'Golo Kanté', 'Sergio Ramos', 'Thiago Silva', 'Casemiro',
      'Toni Kroos', 'Joshua Kimmich', 'Pedri', 'Gavi', 'Jamal Musiala',
      'Phil Foden', 'Mason Mount', 'Declan Rice', 'Jude Bellingham', 'Vinícius Jr'
    ];
    
    const updatedMainRoster = [...gameRegistration.mainRoster];
    let nameIndex = 0;
    
    for (let i = 0; i < 18; i++) {
      if (updatedMainRoster[i] === null && nameIndex < randomNames.length) {
        updatedMainRoster[i] = {
          id: `random-${Date.now()}-${i}`,
          name: randomNames[nameIndex],
          phoneNumber: `050${Math.floor(Math.random() * 9000000 + 1000000)}`,
          registeredBy: currentUser?.username || 'admin',
          registeredAt: Date.now(),
          isConfirmed: false
        };
        nameIndex++;
      }
    }
    
    updateAppData({
      gameRegistration: {
        ...gameRegistration,
        mainRoster: updatedMainRoster
      }
    });
    setShowFillRandomModal(false);
  };

  const generateTeams = () => {
    const confirmedPlayers = gameRegistration.mainRoster.filter(player => player !== null && player.isConfirmed);
    
    // Shuffle players randomly
    const shuffledPlayers = [...confirmedPlayers].sort(() => Math.random() - 0.5);
    
    // Fill teams one by one - complete team 1, then team 2, then team 3
    const maxPlayersPerTeam = Math.ceil(shuffledPlayers.length / 3);
    const team1Size = Math.min(maxPlayersPerTeam, shuffledPlayers.length);
    const team2Size = Math.min(maxPlayersPerTeam, Math.max(0, shuffledPlayers.length - team1Size));
    const team3Size = Math.max(0, shuffledPlayers.length - team1Size - team2Size);
    
    const team1 = shuffledPlayers.slice(0, team1Size);
    const team2 = shuffledPlayers.slice(team1Size, team1Size + team2Size);
    const team3 = shuffledPlayers.slice(team1Size + team2Size, team1Size + team2Size + team3Size);

    // Set teams in edit mode instead of publishing immediately
    setEditingTeams({
      team1,
      team2,
      team3
    });
    
    setShowGenerateTeamsModal(false);
  };

  const publishEditedTeams = () => {
    if (!editingTeams) return;

    const publishedTeams = {
      team1: editingTeams.team1,
      team2: editingTeams.team2,
      team3: editingTeams.team3,
      publishedAt: Date.now(),
      publishedBy: currentUser?.username || 'admin'
    };

    updateAppData({
      gameRegistration: {
        ...gameRegistration,
        publishedTeams
      }
    });
    
    setEditingTeams(null);
  };

  const unpublishTeams = () => {
    updateAppData({
      gameRegistration: {
        ...gameRegistration,
        publishedTeams: null
      }
    });
    setIsTeamUpdatePromptActive(false);
    setNeedsTeamUpdate(false);
  };

  const startEditingPublishedTeams = () => {
    if (gameRegistration.publishedTeams) {
      setEditingTeams({
        team1: [...gameRegistration.publishedTeams.team1],
        team2: [...gameRegistration.publishedTeams.team2],
        team3: [...gameRegistration.publishedTeams.team3]
      });
    }
  };

  const cancelEditingTeams = () => {
    setEditingTeams(null);
  };

  const handleDragStart = (e: React.DragEvent, player: Player, teamName: 'team1' | 'team2' | 'team3', index: number) => {
    if (!editingTeams) return;
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({
      player,
      fromTeam: teamName,
      fromIndex: index
    }));
    
    // Visual feedback
    const target = e.target as HTMLElement;
    target.style.opacity = '0.5';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    target.style.opacity = '1';
  };

  const handleDrop = (e: React.DragEvent, toTeam: 'team1' | 'team2' | 'team3', toIndex?: number) => {
    e.preventDefault();
    if (!editingTeams) return;
    
    try {
      const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
      const { player: draggedPlayer, fromTeam, fromIndex } = dragData;
      
      if (!draggedPlayer || !fromTeam || fromIndex === undefined) return;

      // Create new teams object with deep copy
      const newTeams = {
        team1: [...editingTeams.team1],
        team2: [...editingTeams.team2],
        team3: [...editingTeams.team3]
      };

      if (toIndex !== undefined) {
        // Dropping on a specific player (swap)
        const targetPlayer = newTeams[toTeam][toIndex];
        
        // Don't do anything if dropping on the same position
        if (fromTeam === toTeam && fromIndex === toIndex) {
          return;
        }

        // Swap players
        newTeams[fromTeam][fromIndex] = targetPlayer;
        newTeams[toTeam][toIndex] = draggedPlayer;
      } else {
        // Dropping on empty area (move to end of team)
        if (fromTeam === toTeam) {
          // Same team - move to end
          newTeams[fromTeam].splice(fromIndex, 1);
          newTeams[fromTeam].push(draggedPlayer);
        } else {
          // Different teams - remove from source and add to target
          newTeams[fromTeam].splice(fromIndex, 1);
          newTeams[toTeam].push(draggedPlayer);
        }
      }

      setEditingTeams(newTeams);
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  const handlePlayerDrop = (e: React.DragEvent, toTeam: 'team1' | 'team2' | 'team3', toIndex: number) => {
    handleDrop(e, toTeam, toIndex);
  };

  const handleEmptySlotDrop = (e: React.DragEvent, toTeam: 'team1' | 'team2' | 'team3') => {
    handleDrop(e, toTeam);
  };

  const renderEmptySlot = (teamKey: 'team1' | 'team2' | 'team3') => (
    <div
      key={`empty-${teamKey}`}
      className="p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-center text-gray-500 dark:text-gray-400 text-sm min-h-[60px] flex items-center justify-center transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
      onDragOver={handleDragOver}
      onDrop={(e) => handleEmptySlotDrop(e, teamKey)}
    >
      Drop player here
    </div>
  );

  const renderTeam = (team: Player[], teamName: string, teamColor: string, teamKey: 'team1' | 'team2' | 'team3') => {
    const maxTeamSize = 6; // Show up to 6 slots per team
    
    return (
      <div className={`p-4 rounded-lg border-2 ${teamColor}`}>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{teamName} ({team.length} players)</h4>
        <div className="space-y-2">
          {team.map((player, index) => (
            <div 
              key={`${player.id}-${teamKey}-${index}`}
              className={`flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded transition-all duration-200 ${
                editingTeams ? 'cursor-move hover:bg-gray-50 dark:hover:bg-gray-600 hover:shadow-md border border-gray-200 dark:border-gray-600 select-none' : ''
              }`}
              draggable={!!editingTeams}
              onDragStart={(e) => {
                if (editingTeams) {
                  handleDragStart(e, player, teamKey, index);
                }
              }}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handlePlayerDrop(e, teamKey, index)}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center overflow-hidden">
                    {player.isRegisteredUser ? (
                      <>
                        {(() => {
                          const registeredUser = appData.users.find(u => u.username === player.registeredBy);
                          return registeredUser?.profilePicture ? (
                            <img
                              src={registeredUser.profilePicture}
                              alt={`${registeredUser.username} profile`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          );
                        })()}
                      </>
                    ) : (
                      <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  {player.isRegisteredUser && (() => {
                    const registeredUser = appData.users.find(u => u.username === player.registeredBy);
                    if (registeredUser) {
                      const userStats = registeredUser.stats || { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 };
                      const totalGames = appData.totalGames || 1;
                      const attendanceRate = (userStats.gamesPlayed / totalGames) * 100;
                      const getRank = () => {
                        if (attendanceRate >= 86) return { emoji: '🏆', label: 'Legend' };
                        if (attendanceRate >= 71) return { emoji: '👑', label: 'Captain' };
                        if (attendanceRate >= 51) return { emoji: '🌟', label: 'Starter' };
                        if (attendanceRate >= 26) return { emoji: '⚽', label: 'Squad Player' };
                        return { emoji: '🔰', label: 'Rookie' };
                      };
                      const rank = getRank();
                      return (
                        <div 
                          className="absolute -top-1 -right-1 text-xs cursor-help"
                          title={`${rank.label} (${attendanceRate.toFixed(1)}% attendance)`}
                        >
                          {rank.emoji}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
                
                <div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {player.name}
                    </span>
                    {player.isRegisteredUser && (
                      <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full">
                        User
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {currentUser?.isAdmin || player.registeredBy === currentUser?.username ? formatIsraeliPhoneNumber(player.phoneNumber) : 'Phone hidden'}
              </span>
            </div>
          ))}
          
          {/* Show empty slots when editing or if team has fewer than max players */}
          {editingTeams && team.length < maxTeamSize && 
            Array.from({ length: maxTeamSize - team.length }, (_, i) => (
              <div key={`empty-${teamKey}-${i}`}>
                {renderEmptySlot(teamKey)}
              </div>
            ))}
        </div>
      </div>
    );
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    const result = await changePassword(currentPassword, newPassword);
    
    if (result.success) {
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert('Password changed successfully!');
    } else {
      setPasswordError(result.error || 'Failed to change password');
    }
  };

  const startEditPlayer = (player: Player) => {
    setEditingPlayer(player.id);
    setEditName(player.name);
    setEditPhone(player.phoneNumber);
  };

  const saveEditPlayer = (playerId: string) => {
    if (!editName.trim()) {
      return;
    }

    if (editPhone.trim() && !isValidIsraeliPhoneNumber(editPhone)) {
      return;
    }

    // Check for duplicate phone numbers (excluding the current player)
    if (editPhone.trim()) {
      const allPlayers = [
        ...gameRegistration.mainRoster.filter(player => player !== null),
        ...gameRegistration.substitutes
      ];
      
      if (appData.gameRegistration.publishedTeams) {
        allPlayers.push(
          ...appData.gameRegistration.publishedTeams.team1,
          ...appData.gameRegistration.publishedTeams.team2,
          ...(appData.gameRegistration.publishedTeams.team3 || [])
        );
      }
      
      if (allPlayers.some(player => player && player.id !== playerId && player.phoneNumber === editPhone.trim())) {
        return;
      }
    }

    const updatedMainRoster = gameRegistration.mainRoster.map(player => 
      player?.id === playerId ? { ...player, name: editName.trim(), phoneNumber: editPhone.trim() } : player
    );
    const updatedSubstitutes = gameRegistration.substitutes.map(player => 
      player.id === playerId ? { ...player, name: editName.trim(), phoneNumber: editPhone.trim() } : player
    );
    
    updateAppData({
      gameRegistration: {
        ...gameRegistration,
        mainRoster: updatedMainRoster,
        substitutes: updatedSubstitutes
      }
    });

    setEditingPlayer(null);
    setEditName('');
    setEditPhone('');
  };

  const cancelEditPlayer = () => {
    setEditingPlayer(null);
    setEditName('');
    setEditPhone('');
  };

  const scrollToRegistrationForm = () => {
    const formElement = document.getElementById('registration-form');
    if (formElement) {
      formElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Add a yellow highlight effect
      formElement.style.boxShadow = '0 0 20px rgba(234, 179, 8, 0.4)';
      formElement.style.borderColor = 'rgb(234, 179, 8)';
      formElement.style.backgroundColor = 'rgba(234, 179, 8, 0.05)';
      setTimeout(() => {
        formElement.style.boxShadow = '';
        formElement.style.borderColor = '';
        formElement.style.backgroundColor = '';
      }, 2000);
    }
  };

  // Blow the final whistle - update stats for self-registered players
  const blowFinalWhistle = async () => {
    if (!currentUser?.isAdmin) return;
    
    setIsBlowingWhistle(true);
    
    try {
      // Get all players who are also users (self-registered)
      const allPlayers = [
        ...appData.gameRegistration.mainRoster.filter(player => player !== null),
        ...appData.gameRegistration.substitutes
      ];

      // Update user stats for players whose name matches their registering user's player name
      const updatedUsers = appData.users.map(user => {
        // Find players registered by this user whose name matches the user's player name
        const matchingPlayers = allPlayers.filter(player => 
          player.registeredBy === user.username && 
          player.name === user.playerName
        );

        if (matchingPlayers.length > 0) {
          // Update user stats
          const currentStats = user.stats || { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 };
          const updatedStats = {
            ...currentStats,
            gamesPlayed: currentStats.gamesPlayed + 1,
            timePlayed: currentStats.timePlayed + 90 // Assuming 90 minutes per game
          };

          return {
            ...user,
            stats: updatedStats
          };
        }

        return user;
      });

      // Reset the game registration
      const resetRegistration = {
        mainRoster: Array(18).fill(null),
        substitutes: [],
        isRegistrationLocked: false,
        publishedTeams: null
      };

      // Update total games count
      const newTotalGames = (appData.totalGames || 0) + 1;

      await updateAppData({ 
        gameRegistration: resetRegistration,
        users: updatedUsers,
        totalGames: newTotalGames
      });
      
      const selfRegisteredPlayers = allPlayers.filter(player => 
        appData.users.some(user => user.username === player.registeredBy && user.playerName === player.name)
      );
      
      setSuccessMessage(`Game completed! Updated stats for ${selfRegisteredPlayers.length} self-registered players.`);
      setTimeout(() => setSuccessMessage(''), 4000); // Clear message after 4 seconds
      
    } catch (error) {
      console.error('Error updating game stats:', error);
      alert('Error updating game statistics. Please try again.');
    } finally {
      setIsBlowingWhistle(false);
    }
  };

  const renderPlayerCard = (player: Player | null, index: number) => {
    const canManage = currentUser?.isAdmin || (player && player.registeredBy === currentUser?.username);
    
    if (!player) {
      return (
        <div 
          key={index} 
          className={`p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center transition-all duration-200 ${
            canRegister && canAddMorePlayers 
              ? 'hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer' 
              : ''
          }`}
          onClick={canRegister && canAddMorePlayers ? scrollToRegistrationForm : undefined}
        >
          <div className="text-gray-400 dark:text-gray-500 text-sm">
            {canRegister && canAddMorePlayers ? 'Click to register' : 'Empty slot'}
          </div>
        </div>
      );
    }

    if (editingPlayer === player.id) {
      return (
        <div key={player.id} className="p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-600 rounded-lg">
          <div className="space-y-3">
            {currentUser?.isAdmin && (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Player name"
              />
            )}
            <input
              type="tel"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Phone number"
            />
            <div className="flex gap-2">
              <button
                onClick={() => saveEditPlayer(player.id)}
                className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
              >
                <Save className="w-4 h-4 mx-auto" />
              </button>
              <button
                onClick={cancelEditPlayer}
                className="flex-1 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded transition-colors"
              >
                <X className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={player.id}
        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
          player.isConfirmed
            ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700'
            : 'border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center overflow-hidden">
                  {player.isRegisteredUser ? (
                    <>
                      {(() => {
                        const registeredUser = appData.users.find(u => u.username === player.registeredBy);
                        return registeredUser?.profilePicture ? (
                          <img
                            src={registeredUser.profilePicture}
                            alt={`${registeredUser.username} profile`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        );
                      })()}
                    </>
                  ) : (
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                {player.isRegisteredUser && (() => {
                  const registeredUser = appData.users.find(u => u.username === player.registeredBy);
                  if (registeredUser) {
                    const userStats = registeredUser.stats || { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 };
                    const totalGames = appData.totalGames || 1;
                    const attendanceRate = (userStats.gamesPlayed / totalGames) * 100;
                    const getRank = () => {
                      if (attendanceRate >= 86) return { emoji: '🏆', label: 'Legend' };
                      if (attendanceRate >= 71) return { emoji: '👑', label: 'Captain' };
                      if (attendanceRate >= 51) return { emoji: '🌟', label: 'Starter' };
                      if (attendanceRate >= 26) return { emoji: '⚽', label: 'Squad Player' };
                      return { emoji: '🔰', label: 'Rookie' };
                    };
                    const rank = getRank();
                    return (
                      <div 
                        className="absolute -top-1 -right-1 text-sm cursor-help"
                        title={`${rank.label} (${attendanceRate.toFixed(1)}% attendance)`}
                      >
                        {rank.emoji}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
              
              <div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {player.name}
                  </span>
                  {player.isRegisteredUser && (
                    <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full">
                      User
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {currentUser?.isAdmin || player.registeredBy === currentUser?.username
                    ? formatIsraeliPhoneNumber(player.phoneNumber)
                    : 'Phone hidden'
                  }
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  by {player.registeredBy}
                </div>
                {player.isConfirmed && (
                  <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                    ✓ Confirmed
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-1 ml-2">
            {/* Remove Button */}
            {canManage && playerToRemove === player.id ? (
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">remove player?</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => removePlayer(player.id)}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setPlayerToRemove(null)}
                    className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded transition-colors"
                  >
                    No
                  </button>
                </div>
              </div>
            ) : canManage ? (
              <button
                onClick={() => setPlayerToRemove(player.id)}
                className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                title="Remove player"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : null}

            {/* Confirm/Unconfirm Button */}
            {canManage && !player.isConfirmed && playerToConfirm === player.id ? (
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">confirm attending?</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => confirmPlayer(player.id)}
                    className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setPlayerToConfirm(null)}
                    className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded transition-colors"
                  >
                    No
                  </button>
                </div>
              </div>
            ) : canManage && player.isConfirmed && playerToUnconfirm === player.id ? (
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">unconfirm attending?</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => unconfirmPlayer(player.id)}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setPlayerToUnconfirm(null)}
                    className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded transition-colors"
                  >
                    No
                  </button>
                </div>
              </div>
            ) : canManage && !player.isConfirmed ? (
              <button
                onClick={() => setPlayerToConfirm(player.id)}
                className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                title="Confirm player"
              >
                <UserCheck className="w-4 h-4" />
              </button>
            ) : canManage && player.isConfirmed ? (
              <button
                onClick={() => setPlayerToUnconfirm(player.id)}
                className="p-1 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
                title="Unconfirm player"
              >
                <UserX className="w-4 h-4" />
              </button>
            ) : null}

            {/* Edit Button */}
            {canManage && (
              <button
                onClick={() => startEditPlayer(player)}
                className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                title="Edit player"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const generateTextList = () => {
    let textList = '📋 *Wednesday Football - Player List*\n\n';
    textList += '🏆 *Main Roster:*\n';
    
    // Main roster (18 players)
    for (let i = 0; i < 18; i++) {
      const player = gameRegistration.mainRoster[i];
      const rowNumber = (i + 1).toString().padStart(2, '0');
      
      if (player) {
        const confirmationMark = player.isConfirmed ? ' ✅' : '';
        textList += `${rowNumber}. ${player.name}${confirmationMark}\n`;
      } else {
        textList += `${rowNumber}. \n`;
      }
    }
    
    // Substitutes
    if (gameRegistration.substitutes.length > 0) {
      textList += '\n🔄 *Substitutes:*\n';
      gameRegistration.substitutes.forEach((player, index) => {
        const confirmationMark = player.isConfirmed ? ' ✅' : '';
        textList += `${index + 1}. ${player.name}${confirmationMark}\n`;
      });
    }
    
    textList += '\n⚽ See you on Wednesday at 20:30!';
    
    setGeneratedTextList(textList);
    setShowTextList(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedTextList);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = generatedTextList;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const confirmFinalWhistle = () => {
    blowFinalWhistle();
    setShowFinalWhistleConfirm(false);
  };

  const cancelFinalWhistle = () => {
    setShowFinalWhistleConfirm(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Countdown Clock - Only show when registration is unlocked */}
      {!appData.gameRegistration.isRegistrationLocked && (
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center justify-center gap-2">
              <Clock className="w-5 h-5" />
              Time until the next game begins:
            </h3>
            
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">
              {timeLeft.days > 0 && `${timeLeft.days}d `}
              {String(timeLeft.hours).padStart(2, '0')}:
              {String(timeLeft.minutes).padStart(2, '0')}:
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
            
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Next game: {nextGameDate.toLocaleDateString()} at {nextGameDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      )}

      {/* Celebratory Success Banner */}
      {successMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="animate-bounce">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-6 rounded-2xl shadow-2xl border-4 border-yellow-400 transform animate-pulse">
              <div className="text-center">
                <div className="text-4xl mb-2">🎉🏆🎉</div>
                <div className="text-xl font-bold mb-2">GAME COMPLETED!</div>
                <div className="text-lg">{successMessage}</div>
                <div className="text-2xl mt-2">⚽🥅⚽</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Next Game Registration
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Wednesday 20:30
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {mainRosterCount}/18 registered
                </div>
              </div>
            </div>
          </div>

          {/* Countdown Clock - Only show when registration is locked */}

          {currentUser?.isAdmin && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={toggleRegistrationLock}
                className={`flex items-center gap-2 px-3 py-2 font-medium rounded-lg transition-colors ${
                  gameRegistration.isRegistrationLocked
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <Lock className="w-4 h-4" />
                {gameRegistration.isRegistrationLocked ? 'Unlock' : 'Lock'} Registration
              </button>
              
              <button
                onClick={() => setShowFillRandomModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                <UserCheck className="w-4 h-4" />
                Fill Random List
              </button>
              
              <button
                onClick={() => setShowGenerateTeamsModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
              >
                <Shuffle className="w-4 h-4" />
                Generate Teams
              </button>
              
              <button
                onClick={() => setShowChangePassword(true)}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
              >
                <Key className="w-4 h-4" />
                Change Password
              </button>
              
              <button
                onClick={() => setShowClearAllModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
              
              <button
                onClick={generateTextList}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4" />
                Generate Text List
              </button>
            </div>
          )}
        </div>

        {/* Countdown Clock - Only show when registration is locked */}
        {appData.gameRegistration.isRegistrationLocked && (
          <div className="mb-6 p-4 sm:p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base sm:text-lg font-semibold text-blue-800 dark:text-blue-200">
                  Registration Opens In
                </h3>
              </div>
              
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-sm">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {timeUntilOpen.days}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {timeUntilOpen.days === 1 ? 'Day' : 'Days'}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-sm">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {timeUntilOpen.hours}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {timeUntilOpen.hours === 1 ? 'Hour' : 'Hours'}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-sm">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {timeUntilOpen.minutes}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {timeUntilOpen.minutes === 1 ? 'Minute' : 'Minutes'}
                  </div>
                </div>
              </div>
              
              <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                Next opening: Sunday at 12:00 PM
              </p>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {showChangePassword && currentUser?.isAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Password</h3>
              
              {passwordError && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                  <span className="text-red-700 dark:text-red-300 text-sm">{passwordError}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleChangePassword}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Change Password
                </button>
                <button
                  onClick={() => {
                    setShowChangePassword(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordError('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fill Random List Modal */}
        {showFillRandomModal && currentUser?.isAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Fill Random List</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                This will fill the remaining empty slots with random legendary football players. Are you sure you want to continue?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={fillRandomList}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                >
                  Yes, Fill Random List
                </button>
                <button
                  onClick={() => setShowFillRandomModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Generate Teams Modal */}
        {showGenerateTeamsModal && currentUser?.isAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generate Teams</h3>
              {(() => {
                const confirmedPlayers = gameRegistration.mainRoster.filter(player => player !== null && player.isConfirmed);
                if (confirmedPlayers.length < 6) {
                  return (
                    <>
                      <p className="text-red-600 dark:text-red-400 mb-6">
                        Need at least 6 confirmed players to generate teams. Currently have {confirmedPlayers.length} confirmed players.
                      </p>
                      <button
                        onClick={() => setShowGenerateTeamsModal(false)}
                        className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                      >
                        Close
                      </button>
                    </>
                  );
                }
                return (
                  <>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      This will randomly distribute {confirmedPlayers.length} confirmed players into teams. Are you sure you want to continue?
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={generateTeams}
                        className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                      >
                        Yes, Generate Teams
                      </button>
                      <button
                        onClick={() => setShowGenerateTeamsModal(false)}
                        className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Clear All Modal */}
        {showClearAllModal && currentUser?.isAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">⚠️ Clear All Registrations</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                This will permanently delete all player registrations, teams, and reset the entire game. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={clearAllRegistrations}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  Yes, Clear Everything
                </button>
                <button
                  onClick={() => setShowClearAllModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Registration Status */}
        {gameRegistration.isRegistrationLocked && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="font-medium text-red-800 dark:text-red-200">
                Registration is currently locked
              </span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg flex items-center gap-2">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-700 dark:text-green-300 font-medium">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Celebratory Banner */}
        {showCelebration && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className={`bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-6 rounded-xl shadow-2xl border-4 border-yellow-400 transform transition-all duration-1000 ${
              successMessage ? 'animate-bounce opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}>
              <h2 className="text-3xl font-bold mb-2">SUUUUIII!! All 18 players confirmed, GAME ON! 😄</h2>
              <p className="text-lg opacity-90">Ready for an epic Wednesday night football! ⚽</p>
            </div>
          </div>
        )}

        {/* Team Update Banner */}

        {/* Published Teams */}
        {(gameRegistration.publishedTeams || editingTeams) && (
          <div className="mb-8">
            {/* Team Update Banner */}
            {needsTeamUpdate && (
              <div className="mb-6 p-4 bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <span className="text-orange-800 dark:text-orange-200 font-medium">
                    Teams need to be updated - some players are no longer confirmed
                  </span>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingTeams ? 'Editing Teams' : 'Published Teams'}
              </h3>
              <div className="flex items-center gap-3">
                {!editingTeams && currentUser?.isAdmin && gameRegistration.publishedTeams && (
                  <button
                    onClick={startEditingPublishedTeams}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Teams
                  </button>
                )}
                {!editingTeams && currentUser?.isAdmin && gameRegistration.publishedTeams && (
                  <button
                    onClick={unpublishTeams}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Unpublish Teams
                  </button>
                )}
                {editingTeams && (
                  <div className="flex gap-2">
                    <button
                      onClick={publishEditedTeams}
                      className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Publish List
                    </button>
                    <button
                      onClick={cancelEditingTeams}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
                {!editingTeams && gameRegistration.publishedTeams && (
                  currentUser?.isAdmin && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Published by {gameRegistration.publishedTeams.publishedBy} on{' '}
                      {new Date(gameRegistration.publishedTeams.publishedAt).toLocaleString()}
                    </div>
                  )
                )}
              </div>
            </div>
            
            {editingTeams && (
              <div>
               <>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Player Registered!</h3>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  <strong>Drag and drop players</strong> to rearrange teams. Drop a player on another player to swap their positions.
                </p>
               </>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderTeam(
                editingTeams ? editingTeams.team1 : gameRegistration.publishedTeams.team1, 
                'Team 1', 
                'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700',
                'team1'
              )}
              {renderTeam(
                editingTeams ? editingTeams.team2 : gameRegistration.publishedTeams.team2, 
                'Team 2', 
                'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700',
                'team2'
              )}
              {((editingTeams ? editingTeams.team3 : gameRegistration.publishedTeams?.team3 || []).length > 0) && renderTeam(
                editingTeams ? editingTeams.team3 : gameRegistration.publishedTeams.team3, 
                'Team 3', 
                'border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700',
                'team3'
              )}
            </div>
          </div>
        )}

        {/* Admin Bulk Actions */}
        {currentUser?.isAdmin && (
          <div className="mb-6 flex gap-3 justify-center">
            <button
              onClick={confirmAllPlayers}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              Confirm All Players
            </button>
            <button
              onClick={unconfirmAllPlayers}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
            >
              <UserX className="w-4 h-4" />
              Unconfirm All Players
            </button>
          </div>
        )}

        {/* Main Roster */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Main Roster ({mainRosterCount}/18)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gameRegistration.mainRoster.map((player, index) => renderPlayerCard(player, index))}
          </div>
        </div>

        {/* Substitutes */}
        {gameRegistration.substitutes.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Substitutes ({gameRegistration.substitutes.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gameRegistration.substitutes.map((player) => renderPlayerCard(player, -1))}
            </div>
          </div>
        )}

        {/* Registration Form */}
        {canRegister && (
          <div id="registration-form" className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 transition-all duration-500 border-2 border-transparent">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Register a Player
            </h3>
            
            {successMessage && (
              <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-green-800 dark:text-green-200 text-sm font-medium">{successMessage}</span>
                </div>
              </div>
            )}
            
            {!canAddMorePlayers && !currentUser?.isAdmin && (
              <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-yellow-800 dark:text-yellow-200 text-sm">
                    You have reached the maximum of 2 registered players
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Player Name *
                </label>
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter player name"
                  disabled={!canAddMorePlayers}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number (optional)
                </label>
                <input
                  type="tel"
                  value={newPlayerPhone}
                  onChange={(e) => setNewPlayerPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter phone number (optional)"
                  disabled={!canAddMorePlayers}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <button
                onClick={addPlayer}
                disabled={!canAddMorePlayers && !currentUser?.isAdmin}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex-1"
              >
                <UserPlus className="w-4 h-4" />
                Register Player
              </button>
              
              <button
                onClick={registerSelfAsPlayer}
                disabled={gameRegistration.isRegistrationLocked || !currentUser?.playerName}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex-1"
                title={!currentUser?.playerName ? "Set your player name in profile first" : "Register yourself for the game"}
              >
                <User className="w-5 h-5" />
                Register Myself
              </button>
            </div>

            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              {!currentUser?.isAdmin && (
                <>
                  <p>• You can register up to 2 players</p>
                  <p>• Players registered: {playersRegisteredByUser}/2</p>
                </>
              )}
              {currentUser?.isAdmin && (
                <p>• As an admin, you can register unlimited players</p>
              )}
            </div>
            {currentUser?.isAdmin && gameRegistration.publishedTeams && (
              currentUser?.isAdmin && (
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                  Published by {gameRegistration.publishedTeams.publishedBy} on{' '}
                  {new Date(gameRegistration.publishedTeams.publishedAt).toLocaleDateString()} at{' '}
                  {new Date(gameRegistration.publishedTeams.publishedAt).toLocaleTimeString()}
                </div>
              )
            )}
          </div>
        )}

        {/* Final Whistle Button - Admin Only */}
        {currentUser?.isAdmin && (
          <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3">
                Game Management
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                Click when the current game ends to update player statistics
              </p>
              <button
                onClick={blowFinalWhistle}
                disabled={isBlowingWhistle}
                className="flex items-center justify-center gap-3 mx-auto px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Zap className="w-5 h-5" />
                {isBlowingWhistle ? 'Processing...' : 'Blow the Final Whistle! 🏁'}
              </button>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                This will add +1 game played and +120 minutes for self-registered players
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Final Whistle Confirmation Modal */}
      {showFinalWhistleConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Blow the Final Whistle?
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                This will end the current game, update player statistics, and reset the registration for the next game.
              </p>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={confirmFinalWhistle}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  Yes, End Game
                </button>
                <button
                  onClick={cancelFinalWhistle}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Text List Modal */}
      {showTextList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                WhatsApp Text List
              </h3>
              <button
                onClick={() => setShowTextList(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="mb-4">
              <textarea
                value={generatedTextList}
                readOnly
                className="w-full h-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-none"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex-1"
              >
                <Copy className="w-4 h-4" />
                {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
              </button>
              <button
                onClick={() => setShowTextList(false)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}