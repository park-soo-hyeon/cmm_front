import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { throttle } from 'lodash';

type CursorPosition = {
  x: number;
  y: number;
};

type RemoteCursor = CursorPosition & {
  userId: string;
  color: string;
  lastUpdated: number;
};

const generateUserColor = (userId: string): string => {
  const hash = userId.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  return `hsl(${hash % 360}, 70%, 50%)`;
};

interface CursorTrackerProps {
  teamId: string;
  userId: string;
  projectId: string; // 필요하다면
}

const CursorTracker = ({ teamId, userId, projectId }: CursorTrackerProps) => {
  const socketRef = useRef<Socket | null>(null);
  const [remoteCursors, setRemoteCursors] = useState<Record<string, RemoteCursor>>({});

  // 소켓 연결 및 이벤트 핸들링
  useEffect(() => {
    const socket = io('http://localhost:3000');
    socketRef.current = socket;

    // 팀 참가
    if (teamId && userId && projectId) {
      socket.emit('joinTeam', { tId: teamId, uId: userId, pId: projectId });
    }

    // 원격 커서 위치 업데이트
    const handleMouseMove = (data: { userId: string; x: number; y: number }) => {
      if (data.userId === userId) return; // 내 커서는 표시하지 않음
      setRemoteCursors((prev) => ({
        ...prev,
        [data.userId]: {
          ...data,
          color: generateUserColor(data.userId),
          lastUpdated: Date.now(),
        },
      }));
    };

    socket.on('mouseMove', handleMouseMove);

    return () => {
      socket.off('mouseMove', handleMouseMove);
      socket.disconnect();
    };
  }, [teamId, userId, projectId]);

  // 로컬 마우스 이동 감지 및 서버 전송
  useEffect(() => {
    if (!teamId || !userId) return;

    const handleLocalMouseMove = throttle((e: MouseEvent) => {
      socketRef.current?.emit('mouseMove', {
        x: e.clientX,
        y: e.clientY,
      });
    }, 50);

    window.addEventListener('mousemove', handleLocalMouseMove);
    return () => window.removeEventListener('mousemove', handleLocalMouseMove);
  }, [teamId, userId]);

  // 5초 동안 업데이트 없으면 커서 제거
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setRemoteCursors((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((userId) => {
          if (now - updated[userId].lastUpdated > 5000) {
            delete updated[userId];
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="cursor-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      {Object.entries(remoteCursors).map(([otherUserId, cursor]) => (
        <div
          key={otherUserId}
          style={{
            position: 'absolute',
            left: cursor.x,
            top: cursor.y,
            transition: 'transform 0.1s',
            pointerEvents: 'none',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke={cursor.color}
            strokeWidth="2"
          >
            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
          </svg>
          <div 
            style={{
              position: 'absolute',
              top: 20,
              left: 0,
              backgroundColor: cursor.color,
              color: 'white',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '12px',
            }}
          >
            User {otherUserId.slice(0, 4)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CursorTracker;
