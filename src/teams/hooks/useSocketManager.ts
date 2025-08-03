import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "wss://default.domain";

export const useSocketManager = (teamId: string, userId: string) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!teamId || !userId) return;

    const socket = io(SOCKET_URL, {
      path: '/node/socket.io',
      transports: ["websocket"]
    });

    socket.on("connect", () => {
      console.log("Socket connected!", socket.id);
      socketRef.current = socket;
      setIsConnected(true);
      socket.emit("join-room", { tId: teamId, uId: userId });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected.");
      setIsConnected(false);
    });

    return () => {
      console.log("Cleaning up socket connection.");
      socket.disconnect();
    };
  }, [teamId, userId]);

  return { socket: socketRef.current, isConnected };
};