import { io, Socket } from 'socket.io-client';

const getSocketUrl = (): string => {
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname || 'localhost';
    return `http://${hostname}:3001`;
  }
  return 'http://localhost:3001';
};

export const socket: Socket = io(getSocketUrl(), {
  autoConnect: true,
  transports: ['websocket', 'polling']
});
