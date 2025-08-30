import { useState, useRef, useEffect } from 'react';
import { Socket } from 'socket.io-client';

type Cursors = { [userId: string]: { x: number; y: number; color: string; } };
type Participant = { id: string; color: string; };

export const useWebRTC = (
  socket: Socket | null, 
  teamId: string, 
  userId: string,
  participants: Participant[]
) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<{ [peerId: string]: MediaStream }>({});
  const [cursors, setCursors] = useState<Cursors>({});
  const [inCall, setInCall] = useState(false);

  const peerConnections = useRef<{ [peerId: string]: RTCPeerConnection }>({});
  const dataChannels = useRef<{ [peerId: string]: RTCDataChannel }>({});

  // 🔽 **핵심 수정 1: participants의 최신 값을 유지하기 위한 ref 생성**
  const participantsRef = useRef(participants);
  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);

  const cleanupPeerConnection = (peerId: string) => {
    console.log(`Cleaning up resources for peer: ${peerId}`);
    if (peerConnections.current[peerId]) {
      peerConnections.current[peerId].close();
      delete peerConnections.current[peerId];
    }
    if (dataChannels.current[peerId]) {
      delete dataChannels.current[peerId];
    }
    setRemoteStreams(prev => {
      const newStreams = { ...prev };
      delete newStreams[peerId];
      return newStreams;
    });
    setCursors(prev => {
      const newCursors = { ...prev };
      delete newCursors[peerId];
      return newCursors;
    });
  };

  const setupChannelEvents = (channel: RTCDataChannel, peerId: string) => {
    channel.onopen = () => {
      console.log(`Data channel with ${peerId} is open.`);
      dataChannels.current[peerId] = channel;
    };
    channel.onclose = () => {
      console.log(`Data channel with ${peerId} is closed.`);
      delete dataChannels.current[peerId];
    };
    channel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.userId && data.userId !== userId) {
            // 🔽 **핵심 수정 2: state 대신 ref를 사용하여 최신 참여자 목록 참조**
            const userColor = participantsRef.current.find(p => p.id === data.userId)?.color || '#6b5b95';
            setCursors(prev => ({ 
                ...prev, 
                [data.userId]: { x: data.x, y: data.y, color: userColor } 
            }));
        }
      } catch (error) {
        console.error("Failed to parse data channel message:", error);
      }
    };
  };

  const iceServers = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        { urls: 'stun:stun.services.mozilla.com' },
        { urls: 'stun:stun.nextcloud.com:443' },
        { urls: 'stun:stun.stunprotocol.org:3478' },
        { urls: 'stun:stun.sipgate.net:3478' },
        { urls: 'stun:stun.voiparound.com:3478' },
        { urls: 'stun:stun.voipbuster.com:3478' },
        { urls: 'stun:stun.voipstunt.com:3478' },
        { urls: 'stun:stun.counterpath.net:3478' },
        {
          urls: 'turn:numb.viagenie.ca:3478',
          username: 'webrtc@live.com',
          credential: 'muazkh',
        },
      ],
    };

  const createPeerConnection = (peerId: string, isCaller: boolean) => {
    console.log(`Creating Peer Connection to ${peerId}. Am I the caller? ${isCaller}`);
    const pc = new RTCPeerConnection(iceServers);

    pc.onnegotiationneeded = async () => {
      try {
        if (pc.signalingState !== 'stable') return;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket?.emit('webrtc-offer', { to: peerId, from: userId, offer, teamId });
      } catch (err) {
        console.error(`Negotiation creation failed for ${peerId}:`, err);
      }
    };

    pc.onicecandidate = event => {
      if (event.candidate) {
        socket?.emit('webrtc-candidate', { to: peerId, from: userId, candidate: event.candidate, teamId });
      }
    };

    pc.ontrack = event => {
      setRemoteStreams(prev => ({ ...prev, [peerId]: event.streams[0] }));
    };

    pc.onconnectionstatechange = () => {
      console.log(`Connection state with ${peerId}: ${pc.connectionState}`);
      if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        cleanupPeerConnection(peerId);
      }
    };

    if (isCaller) {
      const channel = pc.createDataChannel('cursor');
      setupChannelEvents(channel, peerId);
    } else {
      pc.ondatachannel = (event) => {
        setupChannelEvents(event.channel, peerId);
      };
    }
    return pc;
  };
  
  useEffect(() => {
    if (!socket) return;

    const handleExistingUsers = ({ users }: { users: string[] }) => {
      users.forEach((peerId: string) => {
        if (peerId !== userId && !peerConnections.current[peerId]) {
          const pc = createPeerConnection(peerId, true);
          peerConnections.current[peerId] = pc;
        }
      });
    };
    
    const handleUserLeft = ({ userId: peerId }: { userId: string }) => cleanupPeerConnection(peerId);

    const handleOffer = async ({ from, offer }: { from: string, offer: RTCSessionDescriptionInit }) => {
      if (!peerConnections.current[from]) {
        const pc = createPeerConnection(from, false);
        peerConnections.current[from] = pc;
      }
      const pc = peerConnections.current[from];
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('webrtc-answer', { to: from, from: userId, answer, teamId });
    };

    const handleAnswer = async ({ from, answer }: { from: string, answer: RTCSessionDescriptionInit }) => {
      await peerConnections.current[from]?.setRemoteDescription(new RTCSessionDescription(answer));
    };

    const handleCandidate = async ({ from, candidate }: { from: string, candidate: RTCIceCandidateInit }) => {
      if (peerConnections.current[from]?.remoteDescription) {
        await peerConnections.current[from]?.addIceCandidate(new RTCIceCandidate(candidate));
      }
    };

    socket.on('existing-users', handleExistingUsers);
    socket.on('user-left', handleUserLeft);
    socket.on('webrtc-offer', handleOffer);
    socket.on('webrtc-answer', handleAnswer);
    socket.on('webrtc-candidate', handleCandidate);

    return () => {
      socket.off('existing-users', handleExistingUsers);
      socket.off('user-left', handleUserLeft);
      socket.off('webrtc-offer', handleOffer);
      socket.off('webrtc-answer', handleAnswer);
      socket.off('webrtc-candidate', handleCandidate);
    };
  }, [socket, userId, teamId]); // 🔽 **핵심 수정 3: 의존성 배열에서 participants 제거**

  const handleStartCall = async () => {
    if (inCall) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setInCall(true);
      stream.getTracks().forEach(track => {
        Object.values(peerConnections.current).forEach(pc => pc.addTrack(track, stream));
      });
    } catch (err) { console.error("Failed to get media stream:", err); }
  };

  const handleEndCall = () => {
    if (!localStream) return;
    Object.values(peerConnections.current).forEach(pc => {
      pc.getSenders().forEach(sender => { if (sender.track) pc.removeTrack(sender); });
    });
    localStream.getTracks().forEach(track => track.stop());
    setLocalStream(null);
    setInCall(false);
  };

  const broadcastCursorPosition = (x: number, y: number) => {
    const cursorData = JSON.stringify({ userId, x, y });
    Object.values(dataChannels.current).forEach(channel => {
      if (channel.readyState === 'open') channel.send(cursorData);
    });
  };

  return { inCall, localStream, remoteStreams, cursors, handleStartCall, handleEndCall, broadcastCursorPosition };
};