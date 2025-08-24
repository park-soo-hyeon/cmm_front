import { useState, useRef, useEffect } from 'react';
import { Socket } from 'socket.io-client';

type Cursors = { [userId: string]: { x: number; y: number } };

export const useWebRTC = (socket: Socket | null, teamId: string, userId: string) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<{ [peerId: string]: MediaStream }>({});
  
  // 🔽 1. '보류 중인 스트림'을 위한 새로운 상태 추가
  const [pendingStreams, setPendingStreams] = useState<{ [peerId: string]: MediaStream }>({});
  
  const [cursors, setCursors] = useState<Cursors>({});
  const [inCall, setInCall] = useState(false);

  // 🔽 이벤트 핸들러 안에서 최신 inCall 상태를 참조하기 위해 ref 사용
  const inCallRef = useRef(inCall);
  inCallRef.current = inCall;

  const peerConnections = useRef<{ [peerId: string]: RTCPeerConnection }>({});
  const dataChannels = useRef<{ [peerId: string]: RTCDataChannel }>({});

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
    // 🔽 보류 중인 스트림에서도 해당 유저 정리
    setPendingStreams(prev => {
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
          setCursors(prev => ({ ...prev, [data.userId]: { x: data.x, y: data.y } }));
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

    // 🔽 2. ontrack 이벤트 핸들러 수정
    pc.ontrack = event => {
      console.log(`Track received from ${peerId}`);
      // 내가 통화 중(inCall)이면 바로 화면에 표시
      if (inCallRef.current) {
        setRemoteStreams(prev => ({ ...prev, [peerId]: event.streams[0] }));
      } 
      // 내가 통화 중이 아니면, 보류 중인 스트림(pendingStreams)에 저장
      else {
        setPendingStreams(prev => ({ ...prev, [peerId]: event.streams[0] }));
        console.log(`Stream from ${peerId} is pending.`);
      }
    };

    pc.onconnectionstatechange = () => {
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
  }, [socket, userId, teamId]);

  // 🔽 3. handleStartCall 함수 수정
  const handleStartCall = async () => {
    if (inCall) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setInCall(true);

      // 보류 중이던 모든 스트림을 실제 화면에 표시
      setRemoteStreams(prev => ({ ...prev, ...pendingStreams }));
      // 보류 목록 비우기
      setPendingStreams({});

      stream.getTracks().forEach(track => {
        Object.values(peerConnections.current).forEach(pc => pc.addTrack(track, stream));
      });
    } catch (err) { console.error("Failed to get media stream:", err); }
  };

  // 🔽 4. handleEndCall 함수 수정
  const handleEndCall = () => {
    if (!localStream) return;
    Object.values(peerConnections.current).forEach(pc => {
      pc.getSenders().forEach(sender => { if (sender.track) pc.removeTrack(sender); });
    });
    localStream.getTracks().forEach(track => track.stop());
    setLocalStream(null);
    setInCall(false);

    // 통화 종료 시 모든 원격 스트림(보류 포함)을 정리
    setRemoteStreams({});
    setPendingStreams({});
  };

  const broadcastCursorPosition = (x: number, y: number) => {
    const cursorData = JSON.stringify({ userId, x, y });
    Object.values(dataChannels.current).forEach(channel => {
      if (channel.readyState === 'open') channel.send(cursorData);
    });
  };

  return { inCall, localStream, remoteStreams, cursors, handleStartCall, handleEndCall, broadcastCursorPosition };
};