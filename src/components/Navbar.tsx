import React from 'react';
import { Link } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { Gamepad2, Trophy, Users, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { authenticated, logout } = usePrivy();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <Gamepad2 className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-800">GameRep</span>
            </Link>
          </div>

          {authenticated && (
            <div className="flex items-center space-x-4">
              <Link
                to="/games"
                className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Games
              </Link>
              <Link
                to="/leaderboard"
                className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <Users className="h-4 w-4 mr-1" />
                Leaderboard
              </Link>
              <Link
                to="/tournaments"
                className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <Trophy className="h-4 w-4 mr-1" />
                Tournaments
              </Link>
              <Link
                to="/profile"
                className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <User className="h-4 w-4 mr-1" />
                Profile
              </Link>
              <button
                onClick={() => logout()}
                className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}