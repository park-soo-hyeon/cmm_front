import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

interface VideoGridProps {
  localStream: MediaStream | null;
  remoteStreams: { [peerId: string]: MediaStream };
}

export const VideoGrid: React.FC<VideoGridProps> = ({ localStream, remoteStreams }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  return (
    <VideoContainer>
      {localStream && (
        <VideoElement ref={localVideoRef} autoPlay muted />
      )}
      {Object.entries(remoteStreams).map(([peerId, stream]) => (
        <VideoElement key={peerId} ref={el => { if (el) el.srcObject = stream; }} autoPlay />
      ))}
    </VideoContainer>
  );
};

const VideoContainer = styled.div` position: absolute; bottom: 16px; left: 16px; z-index: 200; display: flex; `;
const VideoElement = styled.video` width: 160px; height: 120px; border-radius: 8px; margin-right: 8px; background: #000; border: 2px solid #6b5b95; object-fit: cover; `;