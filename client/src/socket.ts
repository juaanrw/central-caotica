import { io, Socket } from 'socket.io-client';

const getSocketUrl = (): string => {
  if (typeof window !== 'undefined' && window.location) {
    // When served via Vite (port 5173), route through origin so Vite's proxy handles /socket.io
    // This allows seamless WSS over HTTPS on mobile devices without mixed-content errors!
    if (window.location.port === '5173') {
      return window.location.origin;
    }
    const hostname = window.location.hostname || 'localhost';
    return `http://${hostname}:3001`;
  }
  return 'http://localhost:3001';
};

export const socket: Socket = io(getSocketUrl(), {
  autoConnect: true,
  transports: ['websocket', 'polling']
});

