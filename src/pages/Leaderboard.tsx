import React, { useState, useEffect } from 'react';
import { PlayerProfile } from '../types';
import { Search, ChevronUp, ChevronDown, Medal } from 'lucide-react';
import { getAttestationsData, calculateTrustScore } from '../services/transitiveTrust';
import { ethers } from "ethers"

const mockPlayers: PlayerProfile[] = [
  {
    id: '0x8a77E0FD7B783CD09562bc16C1d6e1dd5B832FBE',
    name: 'Alex Gaming',
    trustPoints: 95,
    games: [],
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
  },
  {
    id: '0x571396e91bec44eF9d0ee6808f8664db238e0508',
    name: 'Sarah Pro',
    trustPoints: 88,
    games: [],
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
  }
];

export default function Leaderboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfile | null>(null);
  const [trustScore, setTrustScore] = useState<number>(0);
  const [players, setPlayers] = useState<PlayerProfile[]>(mockPlayers);
  const myAddress = '0xYourAddressHere'; // Replace with the actual user's address

  useEffect(() => {
    const fetchTrustScores = async () => {
      try {
        // Fetch all attestation data
        const attestationData = await getAttestationsData();

        // Compute trust scores for each player
        const updatedPlayers = players.map((player) => {
          const trustScore = computeTrustScores(myAddress, player.id, attestationData);
          return {
            ...player,
            trustPoints: trustScore
          };
        });

        setPlayers(updatedPlayers);
      } catch (error) {
        console.error('Error fetching trust scores:', error);
      }
    };

    fetchTrustScores();
  }, [myAddress, players]);

  const handleTrustUpdate = (playerId: string) => {
    console.log(`Updated trust score for player ${playerId}: ${trustScore}`);
    setSelectedPlayer(null);
    setTrustScore(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Player Leaderboard</h1>
        <p className="mt-2 text-gray-600">
          View top players and manage trust relationships
        </p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Player
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trust Points
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {players.map((player, index) => (
              <React.Fragment key={player.id}>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {index < 3 && (
                        <Medal
                          className={`h-5 w-5 mr-2 ${
                            index === 0
                              ? 'text-yellow-400'
                              : index === 1
                              ? 'text-gray-400'
                              : 'text-orange-400'
                          }`}
                        />
                      )}
                      <span className="text-sm text-gray-900">#{index + 1}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={player.avatar}
                        alt={player.name}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {player.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <button onClick={calculateTrustScore(player.id)}>Generate Points</button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedPlayer(player)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Rate Player
                    </button>
                  </td>
                </tr>
                {selectedPlayer?.id === player.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={4} className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              setTrustScore(Math.max(-10, trustScore - 1))
                            }
                            className="p-1 rounded hover:bg-gray-200"
                          >
                            <ChevronDown className="h-5 w-5 text-gray-600" />
                          </button>
                          <span className="text-lg font-medium">
                            {trustScore}
                          </span>
                          <button
                            onClick={() =>
                              setTrustScore(Math.min(10, trustScore + 1))
                            }
                            className="p-1 rounded hover:bg-gray-200"
                          >
                            <ChevronUp className="h-5 w-5 text-gray-600" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleTrustUpdate(player.id)}
                          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Update Trust Score
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
