import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Chess } from 'chess.js';
import cors from 'cors';

const app = express();
app.use(cors());
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] }
});

const games = new Map();

// Piece values for points
const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9 };

// ---------- TIMER HELPERS ----------
function stopGameTimer(gameId) {
  const game = games.get(gameId);
  if (game && game.interval) {
    clearInterval(game.interval);
    game.interval = null;
  }
}

function startGameTimer(gameId) {
  const game = games.get(gameId);
  if (!game) return;
  if (game.interval) stopGameTimer(gameId);

  game.interval = setInterval(() => {
    const currentGame = games.get(gameId);
    if (!currentGame || currentGame.gameOver) {
      clearInterval(currentGame?.interval);
      return;
    }

    const now = Date.now();
    const diff = (now - currentGame.lastMoveTime) / 1000;
    const turn = currentGame.chess.turn();
    const color = turn === 'w' ? 'white' : 'black';

    currentGame.timers[color] -= diff;
    currentGame.lastMoveTime = now;

    // Check timeout
    if (currentGame.timers[color] <= 0) {
      currentGame.timers[color] = 0;
      currentGame.gameOver = true;
      
      // Determine winner by points
      let winner = null;
      if (currentGame.points.white > currentGame.points.black) winner = 'white';
      else if (currentGame.points.black > currentGame.points.white) winner = 'black';
      else winner = 'draw';
      
      currentGame.winner = winner;
      stopGameTimer(gameId);

      io.to(gameId).emit('gameOver', {
        winner,
        reason: 'Time Up - Points',
        players: currentGame.players,
        points: currentGame.points
      });
    } else {
      io.to(gameId).emit('timerUpdate', {
        whiteTime: currentGame.timers.white,
        blackTime: currentGame.timers.black
      });
    }
  }, 1000);
}

// ---------- SOCKET CONNECTION ----------
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // 1. CREATE A NEW GAME (Host)
  socket.on('createGame', ({ playerName, preferredColor }) => {
    const gameId = Math.random().toString(36).substring(2, 8).toUpperCase();

    let assignedColor = 'white';
    if (preferredColor === 'black') assignedColor = 'black';

    const game = {
      chess: new Chess(),
      players: { white: null, black: null },
      timers: { white: 600, black: 600 },
      lastMoveTime: Date.now(),
      interval: null,
      gameOver: false,
      winner: null,
      turn: 'w',
      captured: { white: [], black: [] },   // pieces captured by each player
      points: { white: 0, black: 0 }        // total points captured
    };

    games.set(gameId, game);
    game.players[assignedColor] = { id: socket.id, name: playerName };

    socket.join(gameId);
    socket.data.gameId = gameId;
    socket.data.color = assignedColor;

    socket.emit('colorAssigned', { color: assignedColor, gameId: gameId });
    socket.emit('waiting', { message: 'Waiting for opponent to join...' });

    console.log(`✅ Game ${gameId} created by ${playerName} as ${assignedColor}`);
  });

  // 2. JOIN A SPECIFIC GAME (by ID)
  socket.on('joinGame', ({ gameId, playerName, preferredColor }) => {
    if (!games.has(gameId)) {
      return socket.emit('error', { message: '❌ Game not found! Check the ID.' });
    }

    const game = games.get(gameId);

    if (game.players.white && game.players.black) {
      return socket.emit('error', { message: '❌ Game is full!' });
    }
    if (game.gameOver) {
      return socket.emit('error', { message: '❌ This game has already ended.' });
    }

    let assignedColor = null;
    if (preferredColor === 'white' && !game.players.white) assignedColor = 'white';
    else if (preferredColor === 'black' && !game.players.black) assignedColor = 'black';
    else if (preferredColor === 'random') {
      if (!game.players.white) assignedColor = 'white';
      else if (!game.players.black) assignedColor = 'black';
    } else {
      if (!game.players.white) assignedColor = 'white';
      else if (!game.players.black) assignedColor = 'black';
    }

    if (!assignedColor) {
      return socket.emit('error', { message: '❌ No available slot!' });
    }

    game.players[assignedColor] = { id: socket.id, name: playerName };
    socket.join(gameId);
    socket.data.gameId = gameId;
    socket.data.color = assignedColor;

    socket.emit('colorAssigned', { color: assignedColor, gameId: gameId });

    if (game.players.white && game.players.black) {
      game.chess.reset();
      game.timers = { white: 600, black: 600 };
      game.gameOver = false;
      game.winner = null;
      game.lastMoveTime = Date.now();
      game.captured = { white: [], black: [] };
      game.points = { white: 0, black: 0 };

      startGameTimer(gameId);

      io.to(gameId).emit('gameStart', {
        fen: game.chess.fen(),
        players: game.players,
        timers: game.timers,
        turn: game.chess.turn(),
        captured: game.captured,
        points: game.points
      });
      console.log(`🎮 Game ${gameId} started! ${game.players.white.name} (White) vs ${game.players.black.name} (Black)`);
    } else {
      socket.emit('waiting', { message: 'Waiting for opponent...' });
    }
  });

  // 3. MAKE A MOVE
  socket.on('makeMove', ({ gameId, from, to, promotion = 'q' }) => {
    const game = games.get(gameId);
    if (!game || game.gameOver) return;

    const chess = game.chess;
    const turn = chess.turn();
    const currentPlayerColor = socket.data.color;

    if ((turn === 'w' && currentPlayerColor !== 'white') ||
        (turn === 'b' && currentPlayerColor !== 'black')) {
      return socket.emit('error', { message: 'Not your turn!' });
    }

    try {
      const move = chess.move({ from, to, promotion });
      if (!move) return socket.emit('error', { message: 'Illegal move!' });

      game.lastMoveTime = Date.now();

      // --- Handle capture ---
      if (move.captured) {
        const capturingColor = move.color === 'w' ? 'white' : 'black';
        const capturedPiece = { type: move.captured, color: move.color === 'w' ? 'b' : 'w' };
        game.captured[capturingColor].push(capturedPiece);
        game.points[capturingColor] += PIECE_VALUES[move.captured] || 0;
      }

      // Check game over conditions
      let gameOver = false;
      let winner = null;
      let reason = '';
      if (chess.isCheckmate()) {
        gameOver = true;
        winner = chess.turn() === 'w' ? 'black' : 'white';
        reason = 'Checkmate';
      } else if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition() || chess.isInsufficientMaterial()) {
        gameOver = true;
        winner = 'draw';
        reason = 'Draw';
      }

      if (gameOver) {
        game.gameOver = true;
        game.winner = winner;
        stopGameTimer(gameId);
        io.to(gameId).emit('gameOver', {
          winner,
          reason,
          players: game.players,
          points: game.points,
          captured: game.captured
        });
      }

      // Broadcast move and new state
      io.to(gameId).emit('moveMade', {
        fen: chess.fen(),
        turn: chess.turn(),
        moveHistory: chess.history({ verbose: true }),
        lastMove: move,
        captured: game.captured,
        points: game.points
      });

    } catch (e) {
      socket.emit('error', { message: 'Invalid move' });
    }
  });

  // 4. RESIGN
  socket.on('resign', ({ gameId }) => {
    const game = games.get(gameId);
    if (!game || game.gameOver) return;

    const resigningColor = socket.data.color;
    const winner = resigningColor === 'white' ? 'black' : 'white';

    game.gameOver = true;
    game.winner = winner;
    stopGameTimer(gameId);

    io.to(gameId).emit('gameOver', {
      winner,
      reason: 'Resignation',
      players: game.players,
      points: game.points,
      captured: game.captured
    });
  });

  // 5. NEW GAME (Reset current game)
  socket.on('newGame', ({ gameId }) => {
    const game = games.get(gameId);
    if (!game) return;

    game.chess.reset();
    game.timers = { white: 600, black: 600 };
    game.gameOver = false;
    game.winner = null;
    game.lastMoveTime = Date.now();
    game.captured = { white: [], black: [] };
    game.points = { white: 0, black: 0 };
    stopGameTimer(gameId);
    startGameTimer(gameId);

    io.to(gameId).emit('gameStart', {
      fen: game.chess.fen(),
      players: game.players,
      timers: game.timers,
      turn: game.chess.turn(),
      captured: game.captured,
      points: game.points
    });
  });

  // 6. LEAVE / DISCONNECT
  const handleLeave = (socket) => {
    const gameId = socket.data.gameId;
    const color = socket.data.color;
    if (!gameId) return;

    const game = games.get(gameId);
    if (!game) return;

    const opponentColor = color === 'white' ? 'black' : 'white';
    const opponent = game.players[opponentColor];

    if (opponent && !game.gameOver) {
      game.gameOver = true;
      game.winner = opponentColor;
      stopGameTimer(gameId);
      io.to(gameId).emit('gameOver', {
        winner: opponentColor,
        reason: 'Opponent Left',
        players: game.players,
        points: game.points,
        captured: game.captured
      });
    }

    game.players[color] = null;
    socket.leave(gameId);

    setTimeout(() => {
      const g = games.get(gameId);
      if (g && !g.players.white && !g.players.black) {
        stopGameTimer(gameId);
        games.delete(gameId);
        console.log(`🧹 Cleaned up empty game: ${gameId}`);
      }
    }, 30000);
  };

  socket.on('leaveGame', () => handleLeave(socket));
  socket.on('disconnect', () => handleLeave(socket));
});

const PORT = 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});