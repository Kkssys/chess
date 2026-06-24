**Chess Game :** <br>
<br>
This chess game is now fully responsive and ready to be played on phones, tablets, and desktops. <br>

# ♟️ Multiplayer Chess Game

A real-time multiplayer chess game built with **React**, **Node.js**, **Socket.io**, and **chess.js**. Challenge your friends online, track captured pieces, and let the timer decide the winner by points!

<img width="1920" height="1080" alt="Screenshot (73)" src="https://github.com/user-attachments/assets/fd98a80c-2093-424b-9126-bc3007431eb7" />


## 🚀 Features

- **Real-time multiplayer** via WebSockets (Socket.io)
- **Create or join a game** with a unique Game ID
- **Choose your color** (White, Black, or Random)
- **Chess timer** (10 minutes per player) – runs out? Winner decided by points!
- **Captured pieces display** – see which pieces you've taken
- **Point system** – pawn=1, knight=3, bishop=3, rook=5, queen=9
- **Checkmate, Stalemate, Draw** detection
- **Resign and New Game** options
- **Mobile responsive** – play on your phone or desktop
- **Elegant dark theme** UI with chess piece Unicode symbols

## 🛠️ Tech Stack

### Frontend
- React 18 (with Hooks & Context API)
- Vite (fast build tool)
- chess.js (chess logic and board generation)
- Socket.io-client (WebSocket communication)
- Pure CSS (no external libraries)

### Backend
- Node.js + Express
- Socket.io (real-time server)
- chess.js (move validation on server)
- CORS enabled

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Clone the repository
```bash
git clone https://github.com/yourusername/chess-multiplayer.git
cd chess-multiplayer
```

### Backend Setup
```bash
cd backend
npm install
npm run dev   # starts server on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev   # starts dev server on http://localhost:5173
```

### Run both
You need both the backend and frontend running simultaneously.

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

## 🎮 How to Play

1. **Open the app** in two browser windows (or on two devices).
2. **Player 1:** Enter your name, choose a color, and click **"Create New Game"**.
   - You'll see a **Game ID** (e.g., `A7F3K9`). Share this with your opponent.
3. **Player 2:** Enter your name, choose a color, enter the Game ID, and click **"Join"**.
4. The game starts automatically when both players are connected.
5. **Make a move** by clicking your piece, then clicking the highlighted square.
6. Captured pieces appear in the right panel with points.
7. If the timer runs out, the player with the higher points wins!
8. Use **Resign**, **New Game**, or **Leave** as needed.

## 📱 Mobile Support

The game is fully responsive:
- Board scales to fit any screen
- Touch-friendly controls
- Portrait and landscape support
- Layout adapts to small screens



