import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export const useSocket = (url = 'http://localhost:5000') => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(url);
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [url]);

  return socket;
};