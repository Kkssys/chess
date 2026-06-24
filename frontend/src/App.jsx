import React from 'react';
import { useGame } from './context/GameContext';
import Lobby from './components/Lobby';
import ChessBoard from './components/ChessBoard';
import Timer from './components/Timer';
import GameOverModal from './components/GameOverModal';
import CapturedPieces from './components/CapturedPieces';

function App() {
  const {
    gameState,
    playerName,
    setPlayerName,
    preferredColor,
    setPreferredColor,
    joined,
    createNewGame,
    joinSpecificGame,
    makeMove,
    resign,
    newGame,
    leaveGame,
  } = useGame();

  if (!joined) {
    return (
      <Lobby
        playerName={playerName}
        setPlayerName={setPlayerName}
        preferredColor={preferredColor}
        setPreferredColor={setPreferredColor}
        onCreateGame={createNewGame}
        onJoinGame={joinSpecificGame}
      />
    );
  }

  if (gameState.isWaiting) {
    return (
      <div className="waiting-container">
        <div className="waiting-emoji">♟️</div>
        <h1 className="waiting-title">Waiting for opponent...</h1>
        <p className="waiting-sub">
          Share this Game ID: <strong style={{ color: '#facc15', fontSize: '1.5rem' }}>{gameState.gameId}</strong>
        </p>
        <button className="waiting-leave" onClick={leaveGame}>Leave</button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="game-wrapper">
        {/* Left: Board */}
        <div style={{ width: '100%', maxWidth: '600px' }}>
          <div className="player-info-bar">
            <span className="player-tag">
              {gameState.players.black?.name || 'Black'} ({gameState.turn === 'b' ? '🔵' : '⚪'})
            </span>
            <span className="player-tag">
              {gameState.players.white?.name || 'White'} ({gameState.turn === 'w' ? '🔵' : '⚪'})
            </span>
          </div>

          <ChessBoard
            fen={gameState.fen}
            color={gameState.color}
            onMove={makeMove}
            gameOver={gameState.gameOver}
          />

          <div className="action-buttons">
            <button className="btn-resign" onClick={resign} disabled={gameState.gameOver}>
              Resign
            </button>
            <button className="btn-new" onClick={newGame}>
              New Game
            </button>
            <button className="btn-leave" onClick={leaveGame}>
              Leave
            </button>
          </div>
        </div>

        {/* Right: Timers and Captured Pieces */}
        <div className="timer-panel">
          <h2 className="panel-title">⏱️ Timers</h2>
          <Timer 
            label="White" 
            time={gameState.timers.white} 
            isActive={gameState.turn === 'w' && !gameState.gameOver} 
          />
          <Timer 
            label="Black" 
            time={gameState.timers.black} 
            isActive={gameState.turn === 'b' && !gameState.gameOver} 
          />

          <div style={{ borderTop: '1px solid #374151', marginTop: '1rem', paddingTop: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#e5e7eb' }}>
              Captured Pieces
            </h3>
            <CapturedPieces
              label="White"
              pieces={gameState.captured.white}
              points={gameState.points.white}
            />
            <CapturedPieces
              label="Black"
              pieces={gameState.captured.black}
              points={gameState.points.black}
            />
          </div>

          <div className="game-meta">
            <p className="meta-text">Game ID: <span style={{ color: '#facc15' }}>{gameState.gameId}</span></p>
            <p className="meta-text">
              You are: <span className="highlight">{gameState.color}</span>
            </p>
          </div>
        </div>
      </div>

      {gameState.gameOver && (
        <GameOverModal
          winner={gameState.winner}
          reason={gameState.reason}
          players={gameState.players}
          color={gameState.color}
          points={gameState.points}
          captured={gameState.captured}
          onNewGame={newGame}
          onLeave={leaveGame}
        />
      )}
    </div>
  );
}

export default App;