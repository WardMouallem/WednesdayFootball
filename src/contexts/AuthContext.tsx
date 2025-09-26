import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AppData, GameRegistration, PendingUser } from '../types';
import { supabase, getSharedData, setSharedData, subscribeToDataChanges, DATA_KEYS } from '../lib/supabase';
import { sendTelegramMessageToAdmin, sendTelegramMessageToGroup, sendTelegramMessageToUser, formatNewUserSignupMessage, formatGameRegistrationMessage, formatWelcomeMessage, formatPublishedTeamsMessage } from '../lib/telegram';

interface AuthContextType {
  currentUser: User | null;
  appData: AppData;
  updateAppData: (data: Partial<AppData>) => void;
  signIn: (username: string, phoneNumber: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (username: string, phoneNumber: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  syncData: () => void;
  isLoading: boolean;
}

const USER_STORAGE_KEY = 'wednesday-football-user-data';

const getUserData = (): { currentUser: User | null; isDarkMode: boolean } => {
  try {
    const data = localStorage.getItem(USER_STORAGE_KEY);
    return data ? JSON.parse(data) : { currentUser: null, isDarkMode: false };
  } catch (error) {
    console.error('Error reading user data:', error);
    return { currentUser: null, isDarkMode: false };
  }
};

const setUserData = (data: { currentUser: User | null; isDarkMode: boolean }) => {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error setting user data:', error);
  }
};

const AuthContext = createContext<AuthContextType | null>(null);

const sanitizeGameRegistration = (gameRegistration: GameRegistration): GameRegistration => {
  return {
    ...gameRegistration,
    // Filter out null values from substitutes array
    substitutes: gameRegistration.substitutes.filter(player => player !== null),
    // Sanitize published teams if they exist
    publishedTeams: gameRegistration.publishedTeams ? {
      ...gameRegistration.publishedTeams,
      team1: gameRegistration.publishedTeams.team1.filter(player => player !== null),
      team2: gameRegistration.publishedTeams.team2.filter(player => player !== null),
      team3: gameRegistration.publishedTeams.team3 ? gameRegistration.publishedTeams.team3.filter(player => player !== null) : []
    } : null
  };
};

const initialAppData: AppData = {
  users: [
    { username: 'Admin00', phoneNumber: '0524656678', isAdmin: true, isSuperAdmin: true, password: '98541785', isBlocked: false, playerName: 'Admin Player' },
    // Recreated regular users from screenshots
    { username: 'wardm', phoneNumber: '0524656678', isAdmin: false, isBlocked: false, playerName: 'Ward Mahmoud', stats: { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 } },
    { username: 'MajdKosta', phoneNumber: '0549550991', isAdmin: false, isBlocked: false, playerName: 'Majd Kosta', stats: { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 } },
    { username: 'Abu_Ghomeid', phoneNumber: '0502681153', isAdmin: false, isBlocked: false, playerName: 'Abu Ghomeid', stats: { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 } },
    { username: 'majdhaj', phoneNumber: '0509371996', isAdmin: false, isBlocked: false, playerName: 'Majd Haj', stats: { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 } },
    { username: 'Abedkadi', phoneNumber: '0502969594', isAdmin: false, isBlocked: false, playerName: 'Abed Kadi', stats: { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 } },
    { username: 'Mario', phoneNumber: '0527732128', isAdmin: false, isBlocked: false, playerName: 'Mario', stats: { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 } },
    { username: 'Foadhijab', phoneNumber: '0503090538', isAdmin: false, isBlocked: false, playerName: 'Foad Hijab', stats: { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 } },
    { username: 'Yazan_othman', phoneNumber: '0535229985', isAdmin: false, isBlocked: false, playerName: 'Yazan Othman', stats: { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 } },
    { username: 'Hussain_9', phoneNumber: '0523053766', isAdmin: false, isBlocked: false, playerName: 'Hussain', stats: { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 } },
    { username: 'najibsaad', phoneNumber: '0523849300', isAdmin: false, isBlocked: false, playerName: 'Najib Saad', stats: { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 } },
    { username: 'Shadi_ab', phoneNumber: '0523360435', isAdmin: false, isBlocked: false, playerName: 'Shadi AB', stats: { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 } },
    { username: 'MohammadMasarwy', phoneNumber: '0539525715', isAdmin: false, isBlocked: false, playerName: 'Mohammad Masarwy', stats: { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 } },
    { username: 'Yazan', phoneNumber: '0546446889', isAdmin: false, isBlocked: false, playerName: 'Yazan', stats: { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 } },
    { username: 'Malik', phoneNumber: '0526986614', isAdmin: false, isBlocked: false, playerName: 'Malik', stats: { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 } },
    { username: 'ShadiAbuShqara', phoneNumber: '0543512122', isAdmin: false, isBlocked: false, playerName: 'Shadi Abu Shqara', stats: { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 } },
    { username: 'Ousama', phoneNumber: '0527500042', isAdmin: false, isBlocked: false, playerName: 'Ousama', stats: { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 } },
    { username: 'Maher', phoneNumber: '0545821451', isAdmin: false, isBlocked: false, playerName: 'Maher', stats: { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 } },
    { username: 'Karam_Baransi', phoneNumber: '0509007241', isAdmin: false, isBlocked: false, playerName: 'Karam Baransi', stats: { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 } },
    { username: 'Shadikhoury', phoneNumber: '0547771382', isAdmin: false, isBlocked: false, playerName: 'Shadi Khoury', stats: { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 } },
    { username: 'Mohamd_abugosh', phoneNumber: '0585709533', isAdmin: false, isBlocked: false, playerName: 'Mohammad Abu Gosh', stats: { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 } },
    { username: 'BasilAburya', phoneNumber: '0544337131', isAdmin: false, isBlocked: false, playerName: 'Basil Aburya', stats: { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 } },
    { username: 'Bshara', phoneNumber: '0523254164', isAdmin: false, isBlocked: false, playerName: 'Bshara', stats: { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 } },
    { username: 'wesambaransi', phoneNumber: '0587138202', isAdmin: false, isBlocked: false, playerName: 'Wesam Baransi', stats: { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 } },
    { username: 'omarkhateeb', phoneNumber: '0505126164', isAdmin: false, isBlocked: false, playerName: 'Omar Khateeb', stats: { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 } },
    { username: 'Otorr', phoneNumber: '0502118945', isAdmin: false, isBlocked: false, playerName: 'Otorr', stats: { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 } },
    { username: 'Aibak', phoneNumber: '0549246590', isAdmin: false, isBlocked: false, playerName: 'Aibak', stats: { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 } },
    { username: 'Hussein', phoneNumber: '0526341587', isAdmin: false, isBlocked: false, playerName: 'Hussein', stats: { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 } },
    { username: 'Rawi-Assy', phoneNumber: '0527284299', isAdmin: false, isBlocked: false, playerName: 'Rawi Assy', stats: { gamesPlayed: 0, timePlayed: 0, goalsScored: 0 } }
  ],
  pendingUsers: [],
  currentUser: null,
  gameRegistration: {
    mainRoster: Array(18).fill(null),
    substitutes: [],
    isRegistrationLocked: false,
    publishedTeams: null
  },
  houseRules: `# Wednesday Football House Rules

## Game Schedule
- **Day**: Every Wednesday
- **Time**: 20:30 (8:30 PM)
- **Duration**: 90 minutes

## Player Registration
- Maximum 18 players for main roster
- Additional players will be added to substitutes list
- Each member can register up to 2 players
- Registration closes 2 hours before game time

## Game Rules
- Standard football rules apply
- Teams will be divided equally on the day
- Fair play is expected from all participants
- Respect the referee's decisions

## Payment & Fees
- Payment details will be shared separately
- Regular attendance is encouraged

## Equipment
- Bring your own water bottle
- Appropriate football boots required
- Shin pads recommended

## Weather Policy
- Games continue in light rain
- Heavy rain or dangerous conditions may lead to cancellation
- Check the group for updates on game day

## Contact
- For questions, contact the admin
- Emergency contact: Admin00`,
  location: {
    name: 'City Football Stadium',
    address: '123 Sports Complex, Downtown',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3348.8!2d34.964639!3d32.796167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151d4ca6def663c3%3A0x0!2zMzLCsDQ3JzQ2LjIiTiAzNMKwNTcnNTIuNyJF!5e0!3m2!1sen!2s!4v1640995200000!5m2!1sen!2s'
  },
  whatsappGroupUrl: 'https://chat.whatsapp.com/example-group-link',
  gallery: {
    images: [
      'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1171084/pexels-photo-1171084.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/259835/pexels-photo-259835.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    videos: []
  },
  totalGames: 0
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [appData, setAppData] = useState<AppData>(initialAppData);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const userData = getUserData();
    return userData.isDarkMode;
  });

  // Telegram notification delay system for game registration changes
  const [gameRegistrationTimer, setGameRegistrationTimer] = useState<NodeJS.Timeout | null>(null);

  // Function to send published teams notification
  const sendPublishedTeamsNotification = async (publishedTeams: GameRegistration['publishedTeams']) => {
    if (!publishedTeams) return;
    
    try {
      const message = formatPublishedTeamsMessage(publishedTeams);
      await sendTelegramMessageToGroup(message);
      console.log('Published teams Telegram notification sent to group');
    } catch (error) {
      console.error('Failed to send published teams Telegram notification:', error);
    }
  };

  // Load initial data from Supabase
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        console.log('Loading initial data from Supabase...');
        
        // CRITICAL DATA PROTECTION: NEVER remove users automatically
        // Users can only be removed through explicit admin actions

        // Load all shared data from Supabase
        const [users, pendingUsers, gameRegistration, houseRules, location, whatsappGroupUrl, gallery] = await Promise.all([
          getSharedData<User[]>(DATA_KEYS.USERS),
          getSharedData<PendingUser[]>(DATA_KEYS.PENDING_USERS),
          getSharedData<GameRegistration>(DATA_KEYS.GAME_REGISTRATION),
          getSharedData<string>(DATA_KEYS.HOUSE_RULES),
          getSharedData<AppData['location']>(DATA_KEYS.LOCATION),
          getSharedData<string>(DATA_KEYS.WHATSAPP_GROUP_URL),
          getSharedData<AppData['gallery']>(DATA_KEYS.GALLERY)
        ]);

        console.log('Loaded data from Supabase:', {
          users: users?.length || 0,
          pendingUsers: pendingUsers?.length || 0,
          gameRegistration: gameRegistration ? 'loaded' : 'null',
          houseRules: houseRules ? 'loaded' : 'null',
          location: location ? 'loaded' : 'null',
          whatsappGroupUrl: whatsappGroupUrl ? 'loaded' : 'null',
          gallery: gallery ? 'loaded' : 'null'
        });

        // Get current user from localStorage (session only)
        const userData = getUserData();

        // CRITICAL: NEVER overwrite existing data with defaults
        // Only use defaults if data is completely missing (null/undefined)
        const newAppData = {
          ...initialAppData,
          users: users !== null ? users : initialAppData.users,
          pendingUsers: pendingUsers !== null ? pendingUsers : initialAppData.pendingUsers,
          gameRegistration: gameRegistration !== null ? sanitizeGameRegistration(gameRegistration) : initialAppData.gameRegistration,
          houseRules: houseRules !== null ? houseRules : initialAppData.houseRules,
          location: location !== null ? location : initialAppData.location,
          whatsappGroupUrl: whatsappGroupUrl !== null ? whatsappGroupUrl : initialAppData.whatsappGroupUrl,
          gallery: gallery !== null ? gallery : initialAppData.gallery,
          currentUser: userData.currentUser
        };

        setAppData(newAppData);

        // CRITICAL DATA PROTECTION: Only initialize if data is completely missing (null)
        // NEVER overwrite existing data
        const hasExistingUsers = newAppData.users && newAppData.users.length > 0;
        
        // CRITICAL: NEVER initialize users if ANY users exist in database (users === null only)
        if (users === null) {
          console.log('Database appears completely empty - initializing with default data...');
          console.warn('WARNING: Initializing users table - this should only happen on first setup!');
          console.log('Adding Admin00 and all recreated users to database...');
          const success = await setSharedData(DATA_KEYS.USERS, initialAppData.users);
          if (success) {
            console.log(`Successfully added ${initialAppData.users.length} users to database`);
            setAppData(prev => ({ ...prev, users: initialAppData.users }));
          } else {
            console.error('Failed to add users to database');
          }
        } else if (users !== null && users.length > 0) {
          console.log(`Found ${users.length} existing users in database - preserving all data`);
          
          // CRITICAL: Only ensure Admin00 exists if missing, NEVER modify or remove existing users
          const hasAdmin00 = newAppData.users.some(user => user.username === 'Admin00');
          let updatedUsers = [...newAppData.users];
          
          if (!hasAdmin00) {
            // Add Admin00 if missing (but preserve ALL existing users)
            console.log('Adding missing Admin00 user...');
            updatedUsers.push({
              username: 'Admin00',
              phoneNumber: '0524656678',
              playerName: 'Admin Player',
              isAdmin: true,
              isSuperAdmin: true,
              password: '98541785',
              isBlocked: false
            });
            
            // Save updated users list with new Admin00
            await setSharedData(DATA_KEYS.USERS, updatedUsers);
            console.log('✅ Admin00 added while preserving all existing users');
            setAppData(prev => ({ ...prev, users: updatedUsers }));
          } else {
            console.log('✅ Admin00 exists - preserving all user data as-is');
          }
        } else {
          console.log('⚠️ Empty users array found - preserving empty state');
        }
        
        // CRITICAL: Only initialize other data if it's completely missing (null)
        // NEVER overwrite existing data - preserve all user uploads and content
        if (pendingUsers === null) {
          console.log('Initializing pending users in Supabase...');
          await setSharedData(DATA_KEYS.PENDING_USERS, initialAppData.pendingUsers);
        }
        if (gameRegistration === null) {
          console.log('Initializing game registration in Supabase...');
          await setSharedData(DATA_KEYS.GAME_REGISTRATION, initialAppData.gameRegistration);
        }
        if (houseRules === null) {
          console.log('Initializing house rules in Supabase...');
          await setSharedData(DATA_KEYS.HOUSE_RULES, initialAppData.houseRules);
        }
        if (location === null) {
          console.log('Initializing location in Supabase...');
          await setSharedData(DATA_KEYS.LOCATION, initialAppData.location);
        }
        if (whatsappGroupUrl === null) {
          console.log('Initializing WhatsApp group URL in Supabase...');
          await setSharedData(DATA_KEYS.WHATSAPP_GROUP_URL, initialAppData.whatsappGroupUrl);
        }
        if (gallery === null) {
          console.log('Initializing gallery in Supabase...');
          await setSharedData(DATA_KEYS.GALLERY, initialAppData.gallery);
        } else {
          console.log('✅ Gallery data preserved - never reset existing media');
        }

        console.log('Initial data loading completed');
      } catch (error) {
        console.error('Error loading initial data:', error);
        // Fallback to complete initial data if Supabase fails
        const userData = getUserData();
        setAppData({ ...initialAppData, currentUser: userData.currentUser });
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    console.log('Setting up real-time subscriptions...');
    
    const subscriptions = [
      subscribeToDataChanges<User[]>(DATA_KEYS.USERS, (users) => {
        console.log('Real-time update: users changed', users.length);
        setAppData(prev => ({ ...prev, users }));
      }),
      subscribeToDataChanges<PendingUser[]>(DATA_KEYS.PENDING_USERS, (pendingUsers) => {
        console.log('Real-time update: pending users changed', pendingUsers.length);
        setAppData(prev => ({ ...prev, pendingUsers }));
      }),
      subscribeToDataChanges<GameRegistration>(DATA_KEYS.GAME_REGISTRATION, (gameRegistration) => {
        console.log('Real-time update: game registration changed');
        setAppData(prev => ({ ...prev, gameRegistration: sanitizeGameRegistration(gameRegistration) }));
      }),
      subscribeToDataChanges<string>(DATA_KEYS.HOUSE_RULES, (houseRules) => {
        console.log('Real-time update: house rules changed');
        setAppData(prev => ({ ...prev, houseRules }));
      }),
      subscribeToDataChanges<AppData['location']>(DATA_KEYS.LOCATION, (location) => {
        console.log('Real-time update: location changed');
        setAppData(prev => ({ ...prev, location }));
      }),
      subscribeToDataChanges<string>(DATA_KEYS.WHATSAPP_GROUP_URL, (whatsappGroupUrl) => {
        console.log('Real-time update: WhatsApp group URL changed');
        setAppData(prev => ({ ...prev, whatsappGroupUrl }));
      }),
      subscribeToDataChanges<AppData['gallery']>(DATA_KEYS.GALLERY, (gallery) => {
        console.log('Real-time update: gallery changed');
        setAppData(prev => ({ ...prev, gallery }));
      })
    ];

    return () => {
      console.log('Cleaning up real-time subscriptions...');
      subscriptions.forEach(subscription => {
        supabase.removeChannel(subscription);
      });
    };
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (gameRegistrationTimer) {
        clearTimeout(gameRegistrationTimer);
      }
    };
  }, [gameRegistrationTimer]);

  // Sync dark mode with localStorage
  useEffect(() => {
    setUserData({ currentUser: appData.currentUser, isDarkMode });
  }, [appData.currentUser, isDarkMode]);

  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Pending user approval functions
  const approveUser = (pendingUser: PendingUser) => {
    const newUser: User = {
      username: pendingUser.username,
      phoneNumber: pendingUser.phoneNumber,
      playerName: pendingUser.playerName,
      isAdmin: false,
      isBlocked: false,
      telegramChatId: pendingUser.telegramChatId,
      telegramUsername: pendingUser.telegramUsername
    };

    const updatedUsers = [...appData.users, newUser];
    const updatedPendingUsers = appData.pendingUsers.filter(u => u.id !== pendingUser.id);

    updateAppData({
      users: updatedUsers,
      pendingUsers: updatedPendingUsers
    });

    // Send welcome message to user if they have Telegram linked
    if (newUser.telegramChatId) {
      const welcomeMessage = formatWelcomeMessage(newUser.username, newUser.playerName);
      sendTelegramMessageToUser(newUser.telegramChatId, welcomeMessage)
        .then(success => {
          if (success) {
            console.log('Welcome message sent to user via Telegram');
          } else {
            console.log('Failed to send welcome message to user via Telegram');
          }
        })
        .catch(error => {
          console.error('Error sending welcome message:', error);
        });
    }
  };

  const updateAppData = async (data: Partial<AppData>) => {
    console.log('Updating app data:', Object.keys(data));
    
    // CRITICAL DATA PROTECTION: Log all user modifications for debugging
    if (data.users) {
      console.log(`🔒 USER DATA UPDATE: ${data.users.length} users being saved`);
      console.log('Users:', data.users.map(u => `${u.username}(${u.isAdmin ? 'admin' : 'user'})`));
    }
    
    // Handle game registration changes with Telegram notifications
    if (data.gameRegistration) {
      // Check if teams were just published (publishedTeams exists and wasn't there before)
      const wasPublished = !appData.gameRegistration.publishedTeams && data.gameRegistration.publishedTeams;
      
      if (wasPublished) {
        // Send published teams notification immediately
        sendPublishedTeamsNotification(data.gameRegistration.publishedTeams);
      } else {
        // Only send registration updates if it's NOT a team publishing action
        // Clear existing timer if there is one
        if (gameRegistrationTimer) {
          clearTimeout(gameRegistrationTimer);
        }
        
        // Set new timer for 10 seconds (only for regular registration changes)
        const newTimer = setTimeout(async () => {
          try {
            const message = formatGameRegistrationMessage(
              data.gameRegistration!.mainRoster,
              data.gameRegistration!.substitutes
            );
            await sendTelegramMessageToGroup(message);
            console.log('Game registration Telegram notification sent');
          } catch (error) {
            console.error('Failed to send game registration Telegram notification:', error);
          }
          setGameRegistrationTimer(null);
        }, 10000); // 10 seconds delay
        
        setGameRegistrationTimer(newTimer);
      }
    }
    
    // Update local state immediately for better UX
    setAppData(prev => ({ ...prev, ...data }));
    
    // If currentUser is being updated, also update the stored user data
    if (data.currentUser) {
      setUserData({ currentUser: data.currentUser, isDarkMode });
    }
    
    // Update Supabase with individual data pieces
    const updates = [];
    
    if (data.users) {
      console.log('Updating users in Supabase...');
      updates.push(setSharedData(DATA_KEYS.USERS, data.users));
    }
    if (data.pendingUsers) {
      console.log('Updating pending users in Supabase...');
      updates.push(setSharedData(DATA_KEYS.PENDING_USERS, data.pendingUsers));
    }
    if (data.gameRegistration) {
      console.log('Updating game registration in Supabase...');
      updates.push(setSharedData(DATA_KEYS.GAME_REGISTRATION, data.gameRegistration));
    }
    if (data.houseRules) {
      console.log('Updating house rules in Supabase...');
      updates.push(setSharedData(DATA_KEYS.HOUSE_RULES, data.houseRules));
    }
    if (data.location) {
      console.log('Updating location in Supabase...');
      updates.push(setSharedData(DATA_KEYS.LOCATION, data.location));
    }
    if (data.whatsappGroupUrl) {
      console.log('Updating WhatsApp group URL in Supabase...');
      updates.push(setSharedData(DATA_KEYS.WHATSAPP_GROUP_URL, data.whatsappGroupUrl));
    }
    if (data.gallery) {
      console.log('Updating gallery in Supabase...');
      updates.push(setSharedData(DATA_KEYS.GALLERY, data.gallery));
    }

    try {
      await Promise.all(updates);
      console.log('Successfully updated data in Supabase');
      
      // Extra logging for user updates
      if (data.users) {
        console.log('✅ User data successfully saved to database');
      }
    } catch (error) {
      console.error('Error updating shared data:', error);
    }
  };

  const signIn = async (username: string, phoneNumber: string): Promise<{ success: boolean; error?: string }> => {
    console.log('Attempting sign in:', username);
    
    // Always get the latest users from Supabase
    const latestUsers = await getSharedData<User[]>(DATA_KEYS.USERS);
    const users = latestUsers || appData.users;
    
    // Find user by username first
    const user = users.find(u => u.username === username);
    
    if (!user) {
      console.log('Sign in failed: user not found');
      return { success: false, error: 'Invalid username or password' };
    }
    
    // Check authentication based on user type
    let isAuthenticated = false;
    
    if (user.isAdmin) {
      // Admin users authenticate with password
      if (user.password) {
        isAuthenticated = user.password === phoneNumber;
      } else {
        // Fallback for old admin users without password (like original Admin00)
        isAuthenticated = user.phoneNumber === phoneNumber;
      }
    } else {
      // Regular users authenticate with phone number
      isAuthenticated = user.phoneNumber === phoneNumber;
    }
    
    if (isAuthenticated) {
      if (user.isBlocked) {
        console.log('Sign in failed: user is blocked');
        return { success: false, error: 'This user has been blocked' };
      }
      
      console.log('Sign in successful:', username);
      // Ensure currentUser has the most up-to-date data from the users array
      const updatedCurrentUser = users.find(u => u.username === username) || user;
      setAppData(prev => ({ ...prev, currentUser: updatedCurrentUser, users }));
      setUserData({ currentUser: user, isDarkMode });
      return { success: true };
    }
    
    console.log('Sign in failed: invalid credentials');
    return { success: false, error: 'Invalid username or password' };
  };

  const signUp = async (username: string, phoneNumber: string, playerName: string): Promise<{ success: boolean; error?: string }> => {
    console.log('Attempting sign up:', username);
    
    // Always get the latest users and pending users from Supabase to check for duplicates and blocks
    const [latestUsers, latestPendingUsers] = await Promise.all([
      getSharedData<User[]>(DATA_KEYS.USERS),
      getSharedData<PendingUser[]>(DATA_KEYS.PENDING_USERS)
    ]);
    const users = latestUsers || appData.users;
    const pendingUsers = latestPendingUsers || appData.pendingUsers;

    // Check for reserved username (don't reveal it's reserved, just say it exists)
    if (username === 'Admin00') {
      return { success: false, error: 'Username already exists.' };
    }

    // Check if username is blocked
    const blockedByUsername = users.find(u => u.username === username && u.isBlocked);
    if (blockedByUsername) {
      return { success: false, error: 'This username is not available.' };
    }

    // Check if phone number is blocked
    const blockedByPhone = users.find(u => u.phoneNumber === phoneNumber && u.isBlocked);
    if (blockedByPhone) {
      return { success: false, error: 'This phone number is not available.' };
    }

    // Check for duplicate username (must be unique across all users)
    const existingUsername = users.find(u => u.username === username);
    if (existingUsername) {
      return { success: false, error: 'Username already exists.' };
    }

    // Check for duplicate phone number only among regular users (not admins)
    // Since admins use passwords and regular users use phone numbers for auth
    const existingRegularUserPhone = users.find(u => u.phoneNumber === phoneNumber && !u.isAdmin);
    if (existingRegularUserPhone) {
      return { success: false, error: 'Phone number already registered.' };
    }

    // Check for duplicate player name across all users and pending users
    const existingPlayerName = users.find(u => u.playerName && u.playerName.toLowerCase() === playerName.toLowerCase());
    if (existingPlayerName) {
      return { success: false, error: 'Player name already exists.' };
    }
    // Check for duplicate username in pending users
    const pendingUsername = pendingUsers.find(u => u.username === username);
    if (pendingUsername) {
      return { success: false, error: 'Username already pending approval.' };
    }

    // Check for duplicate phone number in pending users
    // Only check against other pending regular users (not existing admins)
    const pendingPhone = pendingUsers.find(u => u.phoneNumber === phoneNumber);
    if (pendingPhone) {
      return { success: false, error: 'Phone number already pending approval.' };
    }

    // Check for duplicate player name in pending users
    const pendingPlayerName = pendingUsers.find(u => u.playerName && u.playerName.toLowerCase() === playerName.toLowerCase());
    if (pendingPlayerName) {
      return { success: false, error: 'Player name already pending approval.' };
    }
    // Create pending user request
    const newPendingUser: PendingUser = {
      id: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username,
      phoneNumber,
      playerName,
      requestedAt: Date.now()
    };
    const updatedPendingUsers = [...pendingUsers, newPendingUser];
    
    console.log('Creating pending user request and updating Supabase...');
    
    // Update both local state and Supabase
    setAppData(prev => ({ ...prev, pendingUsers: updatedPendingUsers }));
    
    // Save to Supabase
    const success = await setSharedData(DATA_KEYS.PENDING_USERS, updatedPendingUsers);
    
    if (success) {
      console.log('Pending user request created:', username);
      
      // Send Telegram notification to admin
      try {
        const telegramMessage = formatNewUserSignupMessage(username, phoneNumber, playerName);
        await sendTelegramMessageToAdmin(telegramMessage);
        console.log('Telegram notification sent for new user signup:', username);
      } catch (error) {
        console.error('Failed to send Telegram notification:', error);
        // Don't fail the signup process if Telegram fails
      }
      
      return { success: true };
    } else {
      console.error('Failed to save pending user to Supabase');
      return { success: false, error: 'Failed to submit registration request. Please try again.' };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!appData.currentUser?.isAdmin) {
      return { success: false, error: 'Only admin users can change passwords' };
    }

    // Validate current password
    const currentUserPassword = appData.currentUser.password || appData.currentUser.phoneNumber;
    if (currentUserPassword !== currentPassword) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Validate new password
    if (newPassword.length < 4) {
      return { success: false, error: 'New password must be at least 4 characters long' };
    }

    // Update user password
    const updatedUsers = appData.users.map(user => 
      user.username === appData.currentUser.username 
        ? { ...user, password: newPassword }
        : user
    );

    // Update current user
    const updatedCurrentUser = { ...appData.currentUser, password: newPassword };

    // Update both local state and Supabase
    setAppData(prev => ({ ...prev, users: updatedUsers, currentUser: updatedCurrentUser }));
    setUserData({ currentUser: updatedCurrentUser, isDarkMode });

    // Save to Supabase
    const success = await setSharedData(DATA_KEYS.USERS, updatedUsers);

    if (success) {
      console.log('Password changed successfully for:', appData.currentUser.username);
      return { success: true };
    } else {
      console.error('Failed to save password change to Supabase');
      return { success: false, error: 'Failed to save password change. Please try again.' };
    }
  };

  const signOut = () => {
    console.log('Signing out user');
    setAppData(prev => ({ ...prev, currentUser: null }));
    setUserData({ currentUser: null, isDarkMode });
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    setUserData({ currentUser: appData.currentUser, isDarkMode: newDarkMode });
  };

  const syncData = async () => {
    console.log('Manual sync requested...');
    try {
      const [users, pendingUsers, gameRegistration, houseRules, location, whatsappGroupUrl, gallery] = await Promise.all([
        getSharedData<User[]>(DATA_KEYS.USERS),
        getSharedData<PendingUser[]>(DATA_KEYS.PENDING_USERS),
        getSharedData<GameRegistration>(DATA_KEYS.GAME_REGISTRATION),
        getSharedData<string>(DATA_KEYS.HOUSE_RULES),
        getSharedData<AppData['location']>(DATA_KEYS.LOCATION),
        getSharedData<string>(DATA_KEYS.WHATSAPP_GROUP_URL),
        getSharedData<AppData['gallery']>(DATA_KEYS.GALLERY)
      ]);

      setAppData(prev => ({
        ...prev,
        users: users || prev.users,
        pendingUsers: pendingUsers || prev.pendingUsers,
        gameRegistration: gameRegistration ? sanitizeGameRegistration(gameRegistration) : prev.gameRegistration,
        houseRules: houseRules || prev.houseRules,
        location: location || prev.location,
        whatsappGroupUrl: whatsappGroupUrl || prev.whatsappGroupUrl,
        gallery: gallery || prev.gallery
      }));

      console.log('Manual sync completed successfully');
    } catch (error) {
      console.error('Error during manual sync:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser: appData.currentUser,
      appData,
      updateAppData,
      signIn,
      signUp,
      changePassword,
      signOut,
      isDarkMode,
      toggleDarkMode,
      syncData,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}