import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';
import { Shield, Award, Users } from 'lucide-react';

export default function LandingPage() {
  const { login, authenticated } = usePrivy();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (authenticated) {
      navigate('/profile');
    }
  }, [authenticated, navigate]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Decentralized Gaming</span>
            <span className="block text-indigo-600">Reputation System</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Build trust, earn reputation, and compete in tournaments based on your
            verified gaming achievements.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <button
                onClick={() => login()}
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="flex justify-center">
                <Shield className="h-12 w-12 text-indigo-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Decentralized Trust
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Build your reputation through verified gaming achievements and peer
                reviews.
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center">
                <Award className="h-12 w-12 text-indigo-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Exclusive Tournaments
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Participate in tournaments based on your trust score and reputation.
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center">
                <Users className="h-12 w-12 text-indigo-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Community Driven
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Rate other players and contribute to a fair gaming ecosystem.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}