export interface User {
  username: string;
  phoneNumber: string;
  playerName?: string;
  isAdmin: boolean;
  isSuperAdmin?: boolean;
  isBlocked?: boolean;
  password?: string;
  displayName?: string;
  profilePicture?: string;
  telegramChatId?: number;
  telegramUsername?: string;
  stats?: {
    gamesPlayed: number;
    timePlayed: number; // in minutes
    goalsScored: number;
  };
}

export interface PendingUser {
  id: string;
  username: string;
  phoneNumber: string;
  playerName?: string;
  requestedAt: number;
  telegramChatId?: number;
  telegramUsername?: string;
}

export interface Player {
  id: string;
  name: string;
  phoneNumber: string;
  registeredBy: string;
  registeredAt: number;
  isConfirmed: boolean;
  isRegisteredUser?: boolean;
}

export interface GameRegistration {
  mainRoster: (Player | null)[];
  substitutes: Player[];
  isRegistrationLocked: boolean;
  publishedTeams?: {
    team1: Player[];
    team2: Player[];
    team3: Player[];
    publishedAt: number;
    publishedBy: string;
  } | null;
}

export interface AppData {
  users: User[];
  currentUser: User | null;
  pendingUsers: PendingUser[];
  gameRegistration: GameRegistration;
  houseRules: string;
  location: {
    name: string;
    address: string;
    mapUrl: string;
    mapImageUrl?: string;
    googleMapsUrl?: string;
    wazeUrl?: string;
  };
  whatsappGroupUrl: string;
  gallery: {
    images: string[];
    videos: string[];
    backgroundVideo?: string;
  };
  totalGames: number;
  lastUpdated?: number;
}