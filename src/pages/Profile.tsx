import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Game } from '../types';
import { Gamepad2, Star, Clock, RefreshCw } from 'lucide-react';
import { attestWithAI, calculateReputationScore } from '../services/aiml';
import { getGameStats, formatPlayTime } from '../services/gameStats';
import { availableGames } from '../games/games';

// Available games data
const gameList = availableGames;
export default function Profile() {
  const navigate = useNavigate();
  const [reputationScore, setReputationScore] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const gameStats = getGameStats();

  // Filter games to only show played ones
  const playedGames = gameList.filter(game => 
    gameStats.some(stat => stat.gameId === game.id)
  ).map(game => ({
    ...game,
    stats: gameStats.find(stat => stat.gameId === game.id)
  }));

  const handleCalculateReputation = async () => {
    setIsCalculating(true);
    try {
      // Create array of games with play time for logging
      const gamesWithTime = playedGames.map(game => ({
        name: game.name,
        timePlayed: formatPlayTime(game.stats?.timePlayed || 0)
      }));
      
      // Log games and play times
      console.log('Games played with time:', gamesWithTime);

      const score = await attestWithAI(gamesWithTime);
      setReputationScore(score);
    } catch (error) {
      console.error('Error calculating reputation:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  if (playedGames.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Your Profile
          </h1>
          <p className="text-gray-600 mb-8">
            You haven't played any games yet. Visit the Games page to get started!
          </p>
          <button
            onClick={() => navigate('/games')}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Gamepad2 className="h-5 w-5 mr-2" />
            Browse Games
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Your Gaming Profile
            </h1>
            <p className="mt-2 text-gray-600">
              Track your progress and manage your reputation.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-medium text-gray-700">Games Played</span>
              <span className="text-2xl font-bold text-indigo-600">{playedGames.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-gray-700">Reputation Score</span>
              <button
                onClick={handleCalculateReputation}
                disabled={isCalculating}
                className="ml-4 p-2 text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${isCalculating ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="flex items-center mt-2">
              <Star className="h-6 w-6 text-yellow-500 mr-2" />
              <span className="text-2xl font-bold text-gray-900">
                {reputationScore !== null ? reputationScore : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {playedGames.map((game) => (
          <div
            key={game.id}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform hover:scale-105"
            onClick={() => navigate(`/game/${game.id}`)}
          >
            <img
              src={game.imageUrl}
              alt={game.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {game.name}
                </h3>
                <Gamepad2 className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Time Played</span>
                  <div className="flex items-center text-gray-900">
                    <Clock className="h-4 w-4 mr-1 text-indigo-600" />
                    {formatPlayTime(game.stats?.timePlayed || 0)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Last Played</span>
                  <span className="font-medium">
                    {new Date(game.stats?.lastPlayed || '').toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}