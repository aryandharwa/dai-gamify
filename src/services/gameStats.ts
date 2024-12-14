import { Game, GameStats } from '../types';

const STATS_KEY = 'game_stats';

export function getGameStats(): GameStats[] {
  const stats = localStorage.getItem(STATS_KEY);
  return stats ? JSON.parse(stats) : [];
}

export function updateGameStats(gameId: string): void {
  const stats = getGameStats();
  const now = new Date();
  const gameStats = stats.find(s => s.gameId === gameId);

  if (gameStats) {
    gameStats.timePlayed += 1;
    gameStats.lastPlayed = now;
  } else {
    stats.push({
      gameId,
      timePlayed: 1,
      lastPlayed: now
    });
  }

  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function getPlayedGames(): number {
  return getGameStats().length;
}

export function formatPlayTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}