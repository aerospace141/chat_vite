import { io } from 'socket.io-client';

let socket;

export const initSocket = (token) => {
  socket = io('/', {
    auth: {
      token
    }
  });
  
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    const token = localStorage.getItem('token');
    if (token) {
      return initSocket(token);
    }
    throw new Error('Socket not initialized');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};