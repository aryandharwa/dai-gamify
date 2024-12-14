import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Game } from '../types';
import { updateGameStats } from '../services/gameStats';
import { availableGames } from '../games/games';

const gameList = availableGames;

export default function GameInfo() {
  const { id } = useParams();
  const game = gameList.find(g => g.id === id);

  useEffect(() => {
    if (game) {
      // Update stats every second while the game is open
      const interval = setInterval(() => {
        updateGameStats(game.id);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [game]);

  if (!game) {
    return <div>Game not found</div>;
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-black">
      <iframe
        src={game.gameUrl}
        title={game.name}
        className="w-full h-full"
        seamless="seamless"
        allowTransparency="true"
        allowFullScreen={true}
        frameBorder="0"
      />
    </div>
  );
}