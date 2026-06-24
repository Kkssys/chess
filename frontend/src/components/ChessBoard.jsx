import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';

const ChessBoard = ({ fen, color, onMove, gameOver }) => {
  const [game] = useState(new Chess(fen));
  const [board, setBoard] = useState(game.board());
  const [selected, setSelected] = useState(null);
  const [validMoves, setValidMoves] = useState([]);

  useEffect(() => {
    try {
      game.load(fen);
      setBoard(game.board());
      setSelected(null);
      setValidMoves([]);
    } catch (error) {
      console.error('Failed to load fen:', error);
    }
  }, [fen, game]);

  const getPieceUnicode = (piece) => {
    if (!piece) return null;
    const type = piece.type.toUpperCase();
    const color = piece.color;
    const symbols = {
      w: { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙' },
      b: { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' },
    };
    return symbols[color]?.[type] || null;
  };

  const isValidTarget = (row, col) => {
    const square = String.fromCharCode(97 + col) + (8 - row);
    return validMoves.some(m => m.to === square);
  };

  const handleSquareClick = (row, col) => {
    if (gameOver) return;

    const square = String.fromCharCode(97 + col) + (8 - row);
    const piece = board[row]?.[col];

    if (selected) {
      const isValid = validMoves.some(m => m.to === square);
      if (isValid) {
        const movingPiece = board[selected.row]?.[selected.col];
        let promotion = undefined;
        if (movingPiece?.type === 'p' && (row === 0 || row === 7)) {
          promotion = 'q';
        }
        onMove(selected.square, square, promotion);
        setSelected(null);
        setValidMoves([]);
        return;
      }

      const targetPiece = board[row]?.[col];
      const pieceColor = targetPiece?.color === 'w' ? 'white' : 'black';
      if (targetPiece && pieceColor === color) {
        const moves = game.moves({ square, verbose: true });
        setSelected({ row, col, square });
        setValidMoves(moves.map(m => ({ to: m.to })));
        return;
      }

      setSelected(null);
      setValidMoves([]);
      return;
    }

    const targetPiece = board[row]?.[col];
    const pieceColor = targetPiece?.color === 'w' ? 'white' : 'black';
    if (targetPiece && pieceColor === color) {
      const moves = game.moves({ square, verbose: true });
      setSelected({ row, col, square });
      setValidMoves(moves.map(m => ({ to: m.to })));
    }
  };

  return (
    <div
      className="chess-board-wrapper"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        aspectRatio: '1 / 1',
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
        border: '4px solid #374151',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
      }}
    >
      {board.map((row, rowIndex) =>
        row.map((piece, colIndex) => {
          const isLight = (rowIndex + colIndex) % 2 === 0;
          const isSelected = selected?.row === rowIndex && selected?.col === colIndex;
          const isValid = isValidTarget(rowIndex, colIndex);

          let squareClass = `chess-square ${isLight ? 'light' : 'dark'}`;
          if (isSelected) squareClass += ' selected';
          if (isValid) squareClass += ' valid-move';

          const pieceSymbol = getPieceUnicode(piece);

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={squareClass}
              onClick={() => handleSquareClick(rowIndex, colIndex)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'calc(100% * 0.7)', // relative to square size
                cursor: 'pointer',
                userSelect: 'none',
                position: 'relative',
                aspectRatio: '1 / 1',
                background: isLight ? '#f0d9b5' : '#b58863',
                ...(isSelected && { background: '#7fc97f' }),
                ...(isValid && { background: isLight ? '#cdd26a' : '#b5b84a' }),
              }}
            >
              {pieceSymbol && (
                <span
                  style={{
                    fontSize: 'inherit',
                    lineHeight: 1,
                    color: piece?.color === 'w' ? '#ffffff' : '#000000',
                    textShadow: piece?.color === 'w' ? '0 0 4px rgba(0,0,0,0.5)' : 'none',
                  }}
                >
                  {pieceSymbol}
                </span>
              )}
              {isValid && !piece && (
                <div
                  style={{
                    width: '25%',
                    height: '25%',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '50%',
                    position: 'absolute',
                    pointerEvents: 'none',
                  }}
                />
              )}
              {isValid && piece && (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    border: '4px solid rgba(0,0,0,0.25)',
                    borderRadius: '50%',
                    position: 'absolute',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default ChessBoard;