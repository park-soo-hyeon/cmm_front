import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = "wss://blanksync.kro.kr";

export const useSocketManager = (teamId: string, userId: string) => {
  // ✅ [수정] useRef 대신 useState를 사용합니다.
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!teamId || !userId) return;

    const newSocket = io(SOCKET_URL, {
      path: '/node/socket.io',
      transports: ["websocket"]
    });

    newSocket.on("connect", () => {
      console.log("Socket connected!", newSocket.id);
      // ✅ [수정] setSocket을 호출하여 컴포넌트 리렌더링을 유발합니다.
      setSocket(newSocket);
      setIsConnected(true);
      newSocket.emit("join-room", { tId: teamId, uId: userId });
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected.");
      setIsConnected(false);
      setSocket(null);
    });

    return () => {
      console.log("Cleaning up socket connection.");
      newSocket.disconnect();
    };
  }, [teamId, userId]);

  // ✅ [수정] useState로 관리되는 socket 객체를 반환합니다.
  return { socket, isConnected };
};