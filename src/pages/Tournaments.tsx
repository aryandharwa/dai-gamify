import React from 'react';
import { Tournament } from '../types';
import { Calendar, Trophy, Users, Clock } from 'lucide-react';

// Mock data - replace with actual API call
const mockTournaments: Tournament[] = [
  {
    id: '1',
    name: 'Pro Gaming Championship',
    description: 'Compete against the best players in a battle royale tournament.',
    requiredTrustPoints: 80,
    startDate: '2024-03-15',
    endDate: '2024-03-16',
    prize: '$1,000',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500'
  },
  {
    id: '2',
    name: 'Trusted Players League',
    description: 'An exclusive tournament for highly trusted players.',
    requiredTrustPoints: 90,
    startDate: '2024-03-20',
    endDate: '2024-03-21',
    prize: '$2,000',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500'
  }
];

export default function Tournaments() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tournaments</h1>
        <p className="mt-2 text-gray-600">
          Compete in exclusive tournaments based on your trust score
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mockTournaments.map((tournament) => (
          <div
            key={tournament.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="relative">
              <img
                src={tournament.imageUrl}
                alt={tournament.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-md">
                <div className="flex items-center">
                  <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="font-medium text-gray-900">
                    {tournament.prize}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {tournament.name}
              </h3>
              <p className="text-gray-600 mb-4">{tournament.description}</p>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>
                    {new Date(tournament.startDate).toLocaleDateString()} -{' '}
                    {new Date(tournament.endDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-5 w-5 mr-2" />
                  <span>Required Trust Points: {tournament.requiredTrustPoints}</span>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>Registration closes in 3 days</span>
                </div>
              </div>

              <button
                className="mt-6 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Register Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}