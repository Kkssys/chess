import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};

export const GameProvider = ({ children }) => {
  const socket = useSocket();

  const [gameState, setGameState] = useState({
    gameId: null,
    color: null,
    players: { white: null, black: null },
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    timers: { white: 600, black: 600 },
    turn: 'w',
    gameOver: false,
    winner: null,
    reason: null,
    moveHistory: [],
    isWaiting: false,
    captured: { white: [], black: [] },
    points: { white: 0, black: 0 }
  });

  const [playerName, setPlayerName] = useState('');
  const [preferredColor, setPreferredColor] = useState('random');
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleColorAssigned = ({ color, gameId }) => {
      setGameState(prev => ({ ...prev, color, gameId }));
    };

    const handleWaiting = () => {
      setGameState(prev => ({ ...prev, isWaiting: true }));
    };

    const handleGameStart = ({ fen, players, timers, turn, captured, points }) => {
      setGameState(prev => ({
        ...prev,
        fen,
        players,
        timers,
        turn,
        isWaiting: false,
        gameOver: false,
        winner: null,
        reason: null,
        moveHistory: [],
        captured: captured || { white: [], black: [] },
        points: points || { white: 0, black: 0 }
      }));
    };

    const handleMoveMade = ({ fen, turn, moveHistory, captured, points }) => {
      setGameState(prev => ({
        ...prev,
        fen,
        turn,
        moveHistory,
        captured: captured || prev.captured,
        points: points || prev.points
      }));
    };

    const handleTimerUpdate = ({ whiteTime, blackTime }) => {
      setGameState(prev => ({
        ...prev,
        timers: { white: whiteTime, black: blackTime }
      }));
    };

    const handleGameOver = ({ winner, reason, players, points, captured }) => {
      setGameState(prev => ({
        ...prev,
        gameOver: true,
        winner,
        reason,
        players: players || prev.players,
        points: points || prev.points,
        captured: captured || prev.captured
      }));
    };

    const handleError = ({ message }) => {
      alert(message);
    };

    socket.on('colorAssigned', handleColorAssigned);
    socket.on('waiting', handleWaiting);
    socket.on('gameStart', handleGameStart);
    socket.on('moveMade', handleMoveMade);
    socket.on('timerUpdate', handleTimerUpdate);
    socket.on('gameOver', handleGameOver);
    socket.on('error', handleError);

    return () => {
      socket.off('colorAssigned', handleColorAssigned);
      socket.off('waiting', handleWaiting);
      socket.off('gameStart', handleGameStart);
      socket.off('moveMade', handleMoveMade);
      socket.off('timerUpdate', handleTimerUpdate);
      socket.off('gameOver', handleGameOver);
      socket.off('error', handleError);
    };
  }, [socket]);

  const createNewGame = () => {
    if (!playerName.trim()) return alert('Please enter your name');
    socket.emit('createGame', { playerName, preferredColor });
    setJoined(true);
  };

  const joinSpecificGame = (gameId) => {
    if (!playerName.trim()) return alert('Please enter your name');
    if (!gameId.trim()) return alert('Please enter a Game ID');
    socket.emit('joinGame', {
      gameId: gameId.trim().toUpperCase(),
      playerName,
      preferredColor
    });
    setJoined(true);
  };

  const makeMove = (from, to, promotion = 'q') => {
    if (gameState.gameOver) return;
    socket.emit('makeMove', {
      gameId: gameState.gameId,
      from,
      to,
      promotion
    });
  };

  const resign = () => {
    if (!confirm('Are you sure you want to resign?')) return;
    socket.emit('resign', { gameId: gameState.gameId });
  };

  const newGame = () => {
    socket.emit('newGame', { gameId: gameState.gameId });
  };

  const leaveGame = () => {
    if (gameState.gameId) {
      socket.emit('leaveGame', { gameId: gameState.gameId });
    }
    setJoined(false);
    setGameState(prev => ({
      ...prev,
      gameId: null,
      color: null,
      players: { white: null, black: null },
      gameOver: false,
      winner: null,
      isWaiting: false,
      captured: { white: [], black: [] },
      points: { white: 0, black: 0 }
    }));
  };

  const value = {
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
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};