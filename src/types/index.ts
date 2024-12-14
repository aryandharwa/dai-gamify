export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface GameStats {
  gameId: string;
  timePlayed: number; // in seconds
  lastPlayed: Date;
}

export interface Game {
  id: string;
  name: string;
  imageUrl: string;
  reputation?: number | null;
  description?: string;
  gameUrl?: string;
  category?: string;
  stats?: GameStats;
}

export interface GameTimePlayed {
  name: string;
  timePlayed: string;
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  requiredTrustPoints: number;
  startDate: string;
  endDate: string;
  prize: string;
  imageUrl: string;
}

export interface PlayerProfile {
  id: string;
  name: string;
  trustPoints: number;
  games: Game[];
  avatar?: string;
}