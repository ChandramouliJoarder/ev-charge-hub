import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });
  }
  return socketInstance;
};

export const useSocket = (stationId, onSlotUpdate) => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = getSocket();

    if (stationId) {
      socketRef.current.emit('joinStation', stationId);
    }

    if (onSlotUpdate) {
      socketRef.current.on('slotStatusChanged', onSlotUpdate);
      socketRef.current.on('slotCreated', onSlotUpdate);
    }

    return () => {
      if (stationId && socketRef.current) {
        socketRef.current.emit('leaveStation', stationId);
      }
      if (onSlotUpdate && socketRef.current) {
        socketRef.current.off('slotStatusChanged', onSlotUpdate);
        socketRef.current.off('slotCreated', onSlotUpdate);
      }
    };
  }, [stationId, onSlotUpdate]);

  return socketRef.current;
};
