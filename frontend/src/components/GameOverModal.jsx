import React from 'react';

const GameOverModal = ({ 
  winner, 
  reason, 
  players, 
  color, 
  points, 
  captured, 
  onNewGame, 
  onLeave 
}) => {
  let message = '';
  let emoji = '🏆';

  if (winner === 'draw') {
    message = "It's a Draw!";
    emoji = '🤝';
  } else if (winner === color) {
    message = 'You Win! 🎉';
    emoji = '👑';
  } else if (winner) {
    const winnerName = winner === 'white' ? players.white?.name : players.black?.name;
    message = `${winnerName || 'Opponent'} Wins!`;
    emoji = '😔';
  }

  // Points
  const whitePoints = points?.white || 0;
  const blackPoints = points?.black || 0;

  // If reason is time-up, show point-based winner
  let pointMessage = '';
  if (reason === 'Time Up - Points') {
    if (whitePoints > blackPoints) pointMessage = '🏆 White wins on points!';
    else if (blackPoints > whitePoints) pointMessage = '🏆 Black wins on points!';
    else pointMessage = '🤝 Draw on points!';
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-emoji">{emoji}</div>
        <h2 className="modal-title">Game Over</h2>
        <p className="modal-message">{message}</p>
        <p className="modal-reason">Reason: {reason}</p>

        {/* Points display */}
        <div style={{ margin: '10px 0', fontSize: '14px', color: '#9ca3af' }}>
          <div>White points: <span style={{ color: '#facc15' }}>{whitePoints}</span></div>
          <div>Black points: <span style={{ color: '#facc15' }}>{blackPoints}</span></div>
          {pointMessage && (
            <div style={{ marginTop: '8px', color: '#facc15', fontWeight: 'bold' }}>
              {pointMessage}
            </div>
          )}
        </div>

        <div className="modal-buttons">
          <button className="btn-modal-new" onClick={onNewGame}>
            🔄 New Game
          </button>
          <button className="btn-modal-leave" onClick={onLeave}>
            🚪 Leave to Lobby
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;