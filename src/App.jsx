import React, { useState } from 'react';
import UnoGame from './components/UnoGame';
import Scoreboard from './components/Scoreboard';
import { Trophy, Play, Home } from 'lucide-react';
import socket from './socket';

function App() {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(false);

  const joinRoom = () => {
    if (playerName && roomId) {
      socket.emit('joinRoom', { roomId, playerName });
      setGameStarted(true);
    }
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
      {!gameStarted ? (
        <div className="glass" style={{ padding: '40px', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '4rem',
            margin: '0 0 30px 0',
            fontWeight: '900',
            fontStyle: 'italic',
            color: '#D72600',
            textShadow: '4px 4px 0px #fff, 8px 8px 0px rgba(0,0,0,0.1)'
          }}>UNO</h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Your Name"
              style={{ padding: '15px', borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '1.2rem' }}
            />
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Room ID (e.g. 1234)"
              style={{ padding: '15px', borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '1.2rem' }}
            />

            <button
              onClick={joinRoom}
              style={{ padding: '20px', fontSize: '1.5rem', marginTop: '10px' }}
            >
              JOIN GAME
            </button>

            <button
              className="glass"
              onClick={() => setShowScoreboard(true)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Trophy size={18} /> View Scoreboard
            </button>
          </div>
        </div>
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <button
            className="glass"
            style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 100, padding: '10px' }}
            onClick={() => window.location.reload()}
          >
            <Home size={20} />
          </button>
          <UnoGame roomId={roomId} playerName={playerName} />
        </div>
      )}

      {showScoreboard && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ position: 'relative', width: '90%', maxWidth: '600px' }}>
            <button
              onClick={() => setShowScoreboard(false)}
              style={{ position: 'absolute', top: '-20px', right: '-20px', borderRadius: '50%', width: '40px', height: '40px', padding: 0 }}
            >
              ✕
            </button>
            <Scoreboard />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
