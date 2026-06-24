import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { GameProvider } from './context/GameContext'; // Import the Provider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GameProvider>  {/* ✅ Wrap App with the Provider */}
      <App />
    </GameProvider>
  </React.StrictMode>
);