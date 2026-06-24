import React, { useState } from 'react';

const Lobby = ({ 
  playerName, 
  setPlayerName, 
  preferredColor, 
  setPreferredColor, 
  onCreateGame,   // <-- New
  onJoinGame      // <-- New (takes gameId)
}) => {
  const [gameIdInput, setGameIdInput] = useState('');

  return (
    <div className="lobby-container">
      <div className="lobby-card">
        <h1 className="lobby-title">♟️ Chess</h1>
        <p className="lobby-subtitle">Multiplayer Showdown</p>

        <div className="lobby-form">
          <div>
            <label className="form-label">Your Name</label>
            <input
              type="text"
              className="form-input"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name..."
            />
          </div>

          <div>
            <label className="form-label">Preferred Color</label>
            <select
              className="form-select"
              value={preferredColor}
              onChange={(e) => setPreferredColor(e.target.value)}
            >
              <option value="random">🎲 Random</option>
              <option value="white">⬜ White</option>
              <option value="black">⬛ Black</option>
            </select>
          </div>
        </div>

        <hr style={{ borderColor: '#374151', margin: '1.5rem 0' }} />

        {/* --- Option 1: Create New Game --- */}
        <button 
          className="btn-join" 
          onClick={onCreateGame} 
          style={{ background: '#2563eb', marginBottom: '1rem' }}
        >
          🚀 Create New Game
        </button>

        {/* --- Option 2: Join Existing Game --- */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Enter Game ID (e.g. ABC123)"
            value={gameIdInput}
            onChange={(e) => setGameIdInput(e.target.value.toUpperCase())}
            style={{ flex: 1 }}
          />
          <button 
            className="btn-join" 
            onClick={() => onJoinGame(gameIdInput)}
            style={{ background: '#16a34a', width: 'auto', padding: '0 1.5rem' }}
          >
            Join
          </button>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem', textAlign: 'center' }}>
          Enter the Game ID shared by your opponent.
        </p>
      </div>
    </div>
  );
};

export default Lobby;