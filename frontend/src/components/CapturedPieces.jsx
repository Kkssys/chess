import React from 'react';

const CapturedPieces = ({ pieces, label, points }) => {
  const getPieceSymbol = (piece) => {
    const symbols = {
      p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚',
    };
    return symbols[piece.type] || '?';
  };

  const pieceColor = (piece) => {
    return piece.color === 'w' ? '#ffffff' : '#000000';
  };

  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem' }}>
        <strong>{label}</strong>
        <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#facc15' }}>
          {points} pts
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', minHeight: '28px' }}>
        {pieces.map((piece, idx) => (
          <span
            key={idx}
            style={{
              fontSize: 'clamp(20px, 4vw, 28px)',
              lineHeight: 1,
              color: pieceColor(piece),
              textShadow: piece.color === 'w' ? '0 0 4px rgba(0,0,0,0.5)' : 'none',
            }}
          >
            {getPieceSymbol(piece)}
          </span>
        ))}
        {pieces.length === 0 && <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>None</span>}
      </div>
    </div>
  );
};

export default CapturedPieces;