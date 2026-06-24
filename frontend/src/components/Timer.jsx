import React from 'react';

const Timer = ({ label, time, isActive }) => {
  const minutes = Math.floor(Math.max(0, time) / 60);
  const seconds = Math.floor(Math.max(0, time) % 60);
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isLow = time < 60;

  return (
    <div className={`timer-box ${isActive ? 'active-timer' : ''}`}>
      <div className="timer-row">
        <span className="timer-label">{label}</span>
        <span className={`timer-value ${isLow ? 'low-time' : ''}`}>
          {formatted}
        </span>
      </div>
    </div>
  );
};

export default Timer;