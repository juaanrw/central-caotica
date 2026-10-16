import { io, Socket } from 'socket.io-client';

const getSocketUrl = (): string => {
  // If explicitly configured via environment variable (e.g. Render backend URL in Vercel)
  if (import.meta.env.VITE_SERVER_URL) {
    return import.meta.env.VITE_SERVER_URL;
  }

  if (typeof window !== 'undefined' && window.location) {
    // When served via Vite local dev (port 5173), route through origin so Vite's proxy handles /socket.io
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

