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

  // ✅ 즉시 socket 상태 설정
  setSocket(newSocket);

  newSocket.on("connect", () => {
    console.log("Socket connected!", newSocket.id);
    setIsConnected(true);
    
    // ✅ 서버가 기대하는 형식으로 이벤트 전송
    newSocket.emit("join-room", { 
      uId: userId, 
      tId: teamId, 
      pId: "1" // PROJECT_ID
    });
  });

  return () => {
    newSocket.disconnect();
    setSocket(null);
  };
}, [teamId, userId]);

  // ✅ [수정] useState로 관리되는 socket 객체를 반환합니다.
  return { socket, isConnected };
};