import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Game } from '../types';
import { Gamepad2, Star, Clock } from 'lucide-react';
import { getGameStats, formatPlayTime } from '../services/gameStats';
import { availableGames } from '../games/games';

const gameList = availableGames;

export default function Games() {
  const navigate = useNavigate();
  const gameStats = getGameStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Available Games</h1>
        <p className="mt-2 text-gray-600">
          Choose a game to play and build your reputation
        </p>
        <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
          <p className="text-indigo-700 font-medium">
            Number of games played: {gameStats.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {gameList.map((game) => {
          const stats = gameStats.find(s => s.gameId === game.id);
          return (
            <div
              key={game.id}
              onClick={() => navigate(`/game/${game.id}`)}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform hover:scale-105"
            >
              <img
                src={game.imageUrl}
                alt={game.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {game.name}
                  </h3>
                  <span className="px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-full">
                    {game.category}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{game.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Gamepad2 className="h-5 w-5 text-indigo-600 mr-2" />
                    <span className="text-sm text-gray-600">Play Now</span>
                  </div>
                  {stats && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatPlayTime(stats.timePlayed)}
                    </div>
                  )}
                </div>
                {game.reputation && (
                  <div className="mt-2 flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium">{game.reputation}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}