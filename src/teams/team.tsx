    import React, { useRef, useCallback, useState, useEffect } from "react";
    import styled from "styled-components";
    import { useNavigate } from "react-router-dom";
    import Draggable from 'react-draggable';
    import { io, Socket } from "socket.io-client";
    import TextBoxes from "./textBox";
    import VoteBoxes from "./voteBox";
    import ImageBoxes from "./ImageBox";
    import { useLocation } from "react-router-dom";


    const vCursorUrl = `data:image/svg+xml;utf8,<svg width='32' height='32' xmlns='http://www.w3.org/2000/svg'><circle cx='16' cy='16' r='15' fill='white' stroke='%236b5b95' stroke-width='2'/><text x='16' y='23' text-anchor='middle' font-size='20' fill='%236b5b95' font-family='Arial' font-weight='bold'>V</text></svg>`;
    const tCursorUrl = `data:image/svg+xml;utf8,<svg width='32' height='32' xmlns='http://www.w3.org/2000/svg'><circle cx='16' cy='16' r='15' fill='white' stroke='%236b5b95' stroke-width='2'/><text x='16' y='23' text-anchor='middle' font-size='20' fill='%236b5b95' font-family='Arial' font-weight='bold'>T</text></svg>`;
    const PROJECT_ID = "1";

    type VoteUser = {
      uId: string;
      num: number;
    };
    type TextBox = { 
    x: number; 
    y: number; 
    text: string; 
    width: number; 
    height: number;
    color: string;
    size: number;
    font: string;
    node?: string;
    zIndex?: number; // 추가!
  };
    type ImageBox = {
      node: string;
      x: number;
      y: number;
      width: number;
      height: number;
      fileName: string;
      mimeType: string;
      tId: string;
      pId: string;
      uId: string;
      zIndex?: number;
    };


    const FONT_FAMILIES = [
      'Nanum Gothic',
      'Nanum Myeongjo',
      'Nanum Pen Script',
      'BM Jua',
      'Gungseo',
    ];

    const SOCKET_URL = "http://3.220.156.58:3000";

    const Team: React.FC = (
      
    ) => {
      const location = useLocation();
      const { userId, teamId } = location.state || {};
      const navigate = useNavigate();
      const mainAreaRef = useRef<HTMLDivElement>(null);
      const toolbarRef = useRef<HTMLDivElement>(null);
      const socketRef = useRef<Socket | null>(null);
      const [toolbarMouseDown, setToolbarMouseDown] = useState(false);
      const [isTextMode, setIsTextMode] = useState(false);
      const [isVoteCreateMode, setIsVoteCreateMode] = useState(false); // 추가!
      const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
      const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
      const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
      const [resizingIdx, setResizingIdx] = useState<number | null>(null);
      const [textColor, setTextColor] = useState('#000000');
      const [fontSize, setFontSize] = useState(16);
      const [fontFamily, setFontFamily] = useState('Arial');
      const [fontSizeInput, setFontSizeInput] = useState(String(fontSize));
      const [showCreateMenu, setShowCreateMenu] = useState(false);
      const [voteBoxes, setVoteBoxes] = useState<any[]>([]);
      const [focusedVoteIdx, setFocusedVoteIdx] = useState<number | null>(null);
      const [imageBoxes, setImageBoxes] = useState<ImageBox[]>([]);
      const [focusedImageIdx, setFocusedImageIdx] = useState<number | null>(null);
      const resizeStart = useRef<{ startX: number; startY: number; startW: number; startH: number; }>({ startX: 0, startY: 0, startW: 0, startH: 0 });
      const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
      const textBoxesRef = useRef(textBoxes);
      textBoxesRef.current = textBoxes;
      const draggingIdxRef = useRef(draggingIdx);
      draggingIdxRef.current = draggingIdx;
      const resizingIdxRef = useRef(resizingIdx);
      resizingIdxRef.current = resizingIdx;
      const fileInputRef = useRef<HTMLInputElement>(null);
      const handleImageButtonClick = () => {
        fileInputRef.current?.click();
      };
      const localVideoRef = useRef<HTMLVideoElement>(null);
      const remoteVideoRefs = useRef<{ [peerId: string]: HTMLVideoElement | null }>({});
      const [remoteStreams, setRemoteStreams] = useState<{ [peerId: string]: MediaStream }>({});
      const peerConnections = useRef<{ [peerId: string]: RTCPeerConnection }>({});
      const [inCall, setInCall] = useState(false);
      const [localStream, setLocalStream] = useState<MediaStream | null>(null);

 
      useEffect(() => {
  if (localStream && localVideoRef.current) {
    localVideoRef.current.srcObject = localStream;
    console.log("Local video stream assigned:", localStream);
  }
}, [localStream]);

      useEffect(() => {
  if (!localStream) return;

  // call-user: 상대방이 start-call을 누른 경우
    socketRef.current?.on('call-user', async ({ from }) => {
    console.log("통화 요청 수신:", from);
    if (peerConnections.current[from]) return;
    
    const pc = createPeerConnection(from, localStream);
    peerConnections.current[from] = pc;
    
    console.log("Offer 생성 중...");
    // Offer 생성 및 전송
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socketRef.current?.emit('webrtc-offer', { 
      to: from, 
      from: userId, 
      offer,
      teamId: String(teamId)
    });
  });

  // offer 수신
    socketRef.current?.on('webrtc-offer', async ({ from, offer }) => {
    console.log("Offer 수신:", from);
    if (peerConnections.current[from]) return;
    
    const pc = createPeerConnection(from, localStream);
    peerConnections.current[from] = pc;
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socketRef.current?.emit('webrtc-answer', { 
      to: from, 
      from: userId, 
      answer,
      teamId: String(teamId)
    });
  });


  // answer 수신
  socketRef.current?.on('webrtc-answer', async ({ from, answer }) => {
    console.log("Answer 수신:", from);
    const pc = peerConnections.current[from];
    if (!pc) return;
    await pc.setRemoteDescription(new RTCSessionDescription(answer));
  });

  // candidate 수신
  socketRef.current?.on('webrtc-candidate', async ({ from, candidate }) => {
    console.log("ICE Candidate 수신:", from);
    const pc = peerConnections.current[from];
    if (!pc) return;
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  });

  // clean-up
  return () => {
    socketRef.current?.off('call-user');
    socketRef.current?.off('webrtc-offer');
    socketRef.current?.off('webrtc-answer');
    socketRef.current?.off('webrtc-candidate');
  };
}, [localStream, userId, teamId]);

const handleStartCall = async () => {
  if (inCall) return;
  console.log("통화 시작 버튼 클릭");
  
  // 1. 내 미디어 스트림 얻기
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    });
    setLocalStream(stream);
    setInCall(true);

    
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    
    // 2. 팀 참가 (사용자 매핑을 위해)
    socketRef.current?.emit('join-room', { 
      teamId: String(teamId), 
      userId: String(userId) 
    });
    
    // 3. 서버에 start-call emit
    socketRef.current?.emit('start-call', { 
      teamId: String(teamId) 
    });
    
    console.log("통화 시작 완료");
  } catch (err) {
    console.error("카메라/마이크 접근 실패:", err);
    alert("카메라/마이크 접근 실패: " + err);
    setInCall(false);
  }
};



      useEffect(() => {
  Object.entries(remoteStreams).forEach(([peerId, stream]) => {
    if (remoteVideoRefs.current[peerId]) {
      remoteVideoRefs.current[peerId]!.srcObject = stream;
    }
  });
}, [remoteStreams]);
const handleEndCall = () => {
  console.log("통화 종료");
  
  // 1. 모든 peer 연결 종료
  Object.values(peerConnections.current).forEach(pc => {
    try {
      pc.close();
    } catch (e) {
      console.error("Peer connection 종료 오류:", e);
    }
  });
  peerConnections.current = {};

  // 2. remoteStreams, remoteVideoRefs 초기화
  setRemoteStreams({});
  Object.keys(remoteVideoRefs.current).forEach(peerId => {
    if (remoteVideoRefs.current[peerId]) {
      remoteVideoRefs.current[peerId]!.srcObject = null;
    }
  });
  remoteVideoRefs.current = {};

  // 3. 내 localStream 종료 (카메라/마이크 끄기)
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    setLocalStream(null);
  }

  // 4. inCall 상태도 false로
  setInCall(false);
};



      function createPeerConnection(peerId: string, localStream: MediaStream) {
  console.log("Peer Connection 생성:", peerId);
  
  const pc = new RTCPeerConnection({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  });

  // 내 미디어 트랙 추가
  localStream.getTracks().forEach(track => {
    console.log("트랙 추가:", track.kind);
    pc.addTrack(track, localStream);
  });

  // ICE candidate 발생 시 서버로 전송
  pc.onicecandidate = event => {
    if (event.candidate) {
      console.log("ICE Candidate 전송:", peerId);
      socketRef.current?.emit('webrtc-candidate', { 
        to: peerId, 
        from: userId, 
        candidate: event.candidate,
        teamId: String(teamId)
      });
    }
  };

  // 상대방 미디어 스트림 수신 시
  pc.ontrack = event => {
    console.log("원격 스트림 수신:", peerId);
    setRemoteStreams(prev => ({
      ...prev,
      [peerId]: event.streams[0]
    }));
  };

  // 연결 상태 모니터링
  pc.onconnectionstatechange = () => {
    console.log(`Peer ${peerId} 연결 상태:`, pc.connectionState);
  };

  return pc;
}






      useEffect(() => {
        setFontSizeInput(String(fontSize));
      }, [fontSize]);

      // 드래그/리사이즈 관련 ref
      

      // zIndex 최댓값 구하는 헬퍼
      const getMaxZIndex = () => {
        const textMax = textBoxes.length > 0 ? Math.max(...textBoxes.map(b => b.zIndex ?? 0)) : 0;
        const voteMax = voteBoxes.length > 0 ? Math.max(...voteBoxes.map(b => b.zIndex ?? 0)) : 0;
        return Math.max(textMax, voteMax);
      };

      const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 원하는 위치와 크기 (예: 중앙, 기본값)
        const x = 100;
      const y = 100;
      const width = 200;
      const height = 200;

      const formData = new FormData();
        formData.append("image", file);
        formData.append("tId", teamId);     // 서버 요구 필드
        formData.append("pId", PROJECT_ID);  // 서버 요구 필드
        formData.append("uId", userId);     // 서버 요구 필드
        formData.append("cLocate", JSON.stringify({ x, y }));
        formData.append("cScale", JSON.stringify({ width, height }));

        try {
          const res = await fetch(SOCKET_URL + "/api/image/upload", {
            method: "POST",
            body: formData,
          });
          if (!res.ok) {
            throw new Error("이미지 업로드 실패: " + res.status);
          }
          // 업로드 성공하면 서버가 자동으로 소켓 addImageBox 이벤트를 emit함
          // 별도의 socket.emit("imageEvent", ...)는 필요 없음!
          // (서버에서 addImageBox 이벤트를 받으면 imageBoxes에 추가됨)
        } catch (err) {
          alert("이미지 업로드 실패: " + err);
          console.error(err);
        }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete(46) 또는 Backspace(8) 키
      if (e.key === "Delete") {
        // 텍스트 박스 포커스된 경우
        if (focusedIdx !== null && textBoxes[focusedIdx]) {
          const node = textBoxes[focusedIdx].node;
          if (node && socketRef.current) {
            socketRef.current.emit("textEvent", {
              fnc: "delete",
              node,
              type: "text"
            });
          }
          setTextBoxes(prev => prev.filter((_, i) => i !== focusedIdx));
          setFocusedIdx(null);
          setIsTextMode(false);
          return;
        }
        // 투표 박스 포커스된 경우
        if (focusedVoteIdx !== null && voteBoxes[focusedVoteIdx]) {
          const node = voteBoxes[focusedVoteIdx].node;
          if (node && socketRef.current) {
            socketRef.current.emit("voteEvent", {
              fnc: "delete",
              node,
              type: "vote"
            });
          }
          setVoteBoxes(prev => prev.filter((_, i) => i !== focusedVoteIdx));
          setFocusedVoteIdx(null);
          return;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusedIdx, focusedVoteIdx, textBoxes, voteBoxes, setTextBoxes, setVoteBoxes, setFocusedIdx, setFocusedVoteIdx, setIsTextMode, socketRef]);



      
      // 소켓 연결 및 이벤트 핸들러 (paste.txt와 동일)
      useEffect(() => {
        const socket = io(SOCKET_URL, { transports: ["websocket"] });
        socketRef.current = socket;
        socket.on("connect", () => {
          console.log("Socket connected!", socket.id);
        });
        socket.on("connect_error", (err) => {
          console.error("Socket connection error:", err);
        });
        socket.emit("joinTeam", { uId: userId, tId: teamId, pId: PROJECT_ID });

        socket.on("init", (data) => {
          setTextBoxes(data.texts || []);
          setVoteBoxes(data.votes || []);
          console.log("Init event images:", data.images);
          console.log("Init event vote:", data.votes);
          setImageBoxes(
            (data.images || []).map((img:any) => ({
              ...img,
              x: typeof img.x === "number" ? img.x : 0,
              y: typeof img.y === "number" ? img.y : 0,
              width: typeof img.width === "number" ? img.width : 200,
              height: typeof img.height === "number" ? img.height : 200,
              zIndex: 1
            }))
          );  
        });


        socket.on("addTextBox", (data) => {
    setTextBoxes(prev => {
      const maxZ = prev.length > 0 ? Math.max(...prev.map(b => b.zIndex || 0)) : 0;
      const next = [
        ...prev,
        {
          x: data.cLocate.x,
          y: data.cLocate.y,
          text: data.cContent,
          width: data.cScale.width,
          height: data.cScale.height,
          color: data.cColor,
          size: data.cSize,
          font: data.cFont,
          node: data.node,
          zIndex: getMaxZIndex() + 1, // 전체 박스 중 최댓값 + 1
        }
      ];
      setFocusedIdx(next.length - 1);
      return next;
    });
  });

        socket.on("addImage", (data) => {
    setImageBoxes(prev => [
      ...prev,
      {
        ...data,
        x: data.cLocate?.x ?? 0,
        y: data.cLocate?.y ?? 0,
        width: data.cScale?.width ?? 200,
        height: data.cScale?.height ?? 200,
        zIndex: getMaxZIndex() + 1
      }
    ]);
  });


    socket.on("moveImage", (data) => {
      setImageBoxes(prev =>
        prev.map(img =>
          img.node === data.node
            ? {
                ...img,
                x: data.cLocate.x,
                y: data.cLocate.y,
                width: data.cScale.width,
                height: data.cScale.height,
              }
            : img
        )
      );
    });

    socket.on("removeImage", (data) => {
      setImageBoxes(prev => prev.filter(img => img.node !== data.node));
    });

        socket.on("updateTextBox", (data) => {
          setTextBoxes(prev => prev.map(box =>
            box.node === data.node ? { 
              ...box, 
              text: data.cContent, // value → text로 수정
              color: data.cColor, 
              size: data.cSize, 
              font: data.cFont 
            } : box
          ));
        });

        socket.on("moveTextBox", (data) => {
          if (draggingIdxRef.current !== null || resizingIdxRef.current !== null) return;
          setTextBoxes(
            textBoxesRef.current.map(box =>
              box.node === data.node
                ? { ...box, x: data.cLocate.x, y: data.cLocate.y, width: data.cScale.width, height: data.cScale.height }
                : box
            )
          );
        });

        socket.on("removeTextBox", (data) => {
          setTextBoxes(prev => prev.filter(box => box.node !== data.node));
        });

        socket.on("addVote", (data) => {
    setVoteBoxes(prev => {
      const maxZ = prev.length > 0 ? Math.max(...prev.map(b => b.zIndex || 0)) : 0;
      return [
        ...prev,
        {
          node: data.node,
          x: data.cLocate.x,
          y: data.cLocate.y,
          width: data.cScale.width,
          height: data.cScale.height,
          title: data.cTitle,
          list: data.cList,
          count: [0, 0, 0, 0],
          users: [],
          tId: data.tId,
          pId: data.pId,
          zIndex: getMaxZIndex() + 1, // 전체 박스 중 최댓값 + 1
        },
      ];
    });
  });

        socket.on("updateVote", (data) => {
          setVoteBoxes(prev =>
            prev.map(box =>
              box.node === data.node
                ? { ...box, title: data.cTitle, list: data.cList }
                : box
            )
          );
        });

        socket.on("moveVote", (data) => {
          setVoteBoxes(prev =>
            prev.map(box =>
              box.node === data.node
                ? {
                    ...box,
                    x: data.cLocate?.x ?? box.x,
                    y: data.cLocate?.y ?? box.y,
                    width: data.cScale?.width ?? box.width,
                    height: data.cScale?.height ?? box.height,
                  }
                : box
            )
          );
        });

        socket.on("deleteVote", (data) => {
          setVoteBoxes(prev => prev.filter(box => box.node !== data.node));
        });

        socket.on("choiceVote", (data) => {
          setVoteBoxes(prev =>
            prev.map(box =>
              box.node === data.node
                ? {
                    ...box,
                    count: data.count,
                    users: [
                      ...box.users.filter((u: VoteUser) => u.uId !== data.user),
                      ...(data.num >= 1 && data.num <= 4
                        ? [{ uId: data.user, num: data.num }]
                        : []),
                    ],
                  }
                : box
            )
          );
        });

        return () => {
          socket.disconnect();
        };
      }, []);

      useEffect(() => {
        if (
          focusedIdx !== null &&
          textBoxes[focusedIdx] !== undefined
        ) {
          const currentBox = textBoxes[focusedIdx];
          setTextColor(currentBox.color);
          setFontSize(currentBox.size);
          setFontFamily(currentBox.font);
        }
      }, [focusedIdx, textBoxes]);

      // 스타일 변경 핸들러 (paste.txt와 동일)
      const handleStyleChange = (type: string, value: string | number) => {
        if (focusedIdx === null) return;
        const node = textBoxes[focusedIdx].node;
        if (!node) return;
        setTextBoxes(prev =>
          prev.map((box, i) =>
            i === focusedIdx
              ? {
                  ...box,
                  color: type === 'color' ? value as string : box.color,
                  size: type === 'fontSize' ? value as number : box.size,
                  font: type === 'fontFamily' ? value as string : box.font,
                }
              : box
          )
        );
        const updateData = {
          fnc: "update",
          node,
          type: "text",
          [type === 'color' ? 'cColor' : type === 'fontSize' ? 'cSize' : 'cFont']: value
        };
        socketRef.current?.emit("textEvent", updateData);
      };

      // MainArea 클릭 핸들러: 텍스트/투표 생성 모드 구분
      const handleMainAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!mainAreaRef.current || !socketRef.current) return;
        const rect = mainAreaRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width - 300));
        const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height - 200));

        // 텍스트 박스 생성
        if (isTextMode) {
          socketRef.current.emit("textEvent", {
            fnc: "new",
            cLocate: { x, y },
            cScale: { width: 200, height: 40 },
            cFont: fontFamily,
            cColor: textColor,
            cSize: fontSize,
            cContent: "",
            type: "text"
          });
          setIsTextMode(false);
          return;
        }

        // 투표 생성 모드
        if (isVoteCreateMode) {
          socketRef.current.emit("voteEvent", {
            fnc: "new",
            cLocate: { x, y },
            cScale: { width: 300, height: 200 },
            cTitle: "",
            cList: [
              { content: "항목1" },
              { content: "항목2" },
              { content: "항목3" },
              { content: "항목4" },
            ],
            type: "vote",
          });
          setIsVoteCreateMode(false);
          return;
        }
      };

      // 투표 생성 버튼 (플로팅 메뉴)에서 호출
      const handleCreateVoteBoxButton = () => {
        setShowCreateMenu(false);
        setIsVoteCreateMode(true);
      };

      return (
        <Container>
          <Content>
            <Sidebar>
              <Logo onClick={() => navigate("/")}>BlankSync</Logo>
              <SidebarTitle>
                <strong>팀 프로젝트</strong>
              </SidebarTitle>
              <ProjectSection>
                <ProjectTitle>
                  <span>2025년 신제품</span>
                  <DropdownArrow>▼</DropdownArrow>
                </ProjectTitle>
                <MeetingList>
                  <MeetingItem>
                    <MeetingDate>0315 회의 내용</MeetingDate>
                    <SubItem>일정 정리</SubItem>
                    <SubItem>주제 회의</SubItem>
                  </MeetingItem>
                </MeetingList>
              </ProjectSection>
              <SidebarFooter>
                페이지 생성 / 삭제
              </SidebarFooter>
            </Sidebar>
            <MainArea
              ref={mainAreaRef}
              $isTextMode={isTextMode}
              $isVoteCreateMode={isVoteCreateMode}  // 이 줄 추가!
              onClick={handleMainAreaClick}
              
            > 
              <Draggable 
                nodeRef={toolbarRef as React.RefObject<HTMLElement>}
                bounds="parent"
              >
                <FloatingToolbar ref={toolbarRef}
                  tabIndex={-1}
                  onMouseDown={() => setToolbarMouseDown(true)}
                  onMouseUp={() => setToolbarMouseDown(false)}>
                  {focusedIdx === null ? (
                    <>
                      <ToolIcon
                        onClick={() => setIsTextMode((prev) => !prev)}
                        style={{ color: isTextMode ? "#6b5b95" : undefined }}
                        title="텍스트 상자 생성 모드"
                      >
                        T
                      </ToolIcon>
                      <ToolIcon onClick={handleImageButtonClick}>
    <ImageIcon />
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      style={{ display: "none" }}
      onChange={handleFileChange}
    />
  </ToolIcon>
                      <ToolIcon>
                        <PenIcon />
                      </ToolIcon>
                      <ToolbarDivider />
                      <ToolIcon>+</ToolIcon>
                      <ColorCircle color="#ff0000" />
                      <ColorCircle color="#00ff00" />
                      <ColorCircle color="#0000ff" />
                      <ColorCircle color="#ffb700" />
                    </>
                  ) : (
                    <>
                      <ColorPicker
                        type="color"
                        value={textColor}
                        onChange={(e) => handleStyleChange('color', e.target.value)}
                      />
                      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <input
                          type="number"
                          min={8}
                          max={64}
                          value={fontSizeInput}
                          onChange={e => {
                            const val = e.target.value;
                            setFontSizeInput(val);
                            const num = Number(val);
                            if (val !== '' && !isNaN(num) && num >= 8 && num <= 64) {
                              handleStyleChange('fontSize', num);
                            }
                          }}
                          onBlur={e => {
                            let val = Number(e.target.value);
                            if (isNaN(val)) val = fontSize;
                            val = Math.max(8, Math.min(64, val));
                            setFontSizeInput(String(val));
                            handleStyleChange('fontSize', val);
                          }}
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              let val = Number(e.currentTarget.value);
                              if (isNaN(val)) val = fontSize;
                              val = Math.max(8, Math.min(64, val));
                              setFontSizeInput(String(val));
                              handleStyleChange('fontSize', val);
                              e.currentTarget.blur();
                            }
                          }}
                          style={{ width: 40, textAlign: "center" }}
                        />
                        <span style={{ marginLeft: 2 }}>px</span>
                      </div>
                      <SelectBox
                        value={fontFamily}
                        onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                      >
                        {FONT_FAMILIES.map(font => (
                          <option key={font} value={font}>{font}</option>
                        ))}
                      </SelectBox>
                    </>
                  )}
                </FloatingToolbar>
              </Draggable>
              <TextBoxes
              getMaxZIndex={getMaxZIndex}
              socketRef={socketRef}
              mainAreaRef={mainAreaRef}
              focusedImageIdx={focusedImageIdx}
              setFocusedImageIdx={setFocusedImageIdx}
              teamId={TEAM_ID}
              projectId={PROJECT_ID}
              userId={USER_ID}
            />
            {/* 플로팅 +버튼 및 생성 메뉴 */}
            <FloatingButtonWrap>
              {showCreateMenu && (
                <CreateMenu>
                  <CreateMenuButton onClick={handleCreateVoteBoxButton}>투표</CreateMenuButton>
                  {/* 필요시 다른 생성 버튼들 추가 */}
                </CreateMenu>
              )}
              <FloatingButton onClick={() => setShowCreateMenu((v) => !v)}>+</FloatingButton>
            </FloatingButtonWrap>
          </MainArea>
        </Content>
      </Container>
    );
  };

const COLOR = {
  bg: "#EDE9F2",
  card: "#F2F2F2",
  accent: "#B8B6F2",
  accentDark: "#545159",
  text: "#3B3740",
  subText: "#A19FA6",
  logo: "#C6C4F2",
  imgBg: "#D1D0F2",
  imgShadow: "#CEDEF2",
  border: "#E3DCF2",
};


const Container = styled.div`
  font-family: 'Pretendard', sans-serif;
  background: ${COLOR.bg};
  color: ${COLOR.text};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  height: calc(100vh - 70px);
`;

const Sidebar = styled.div`
  width: 280px;
  background: ${COLOR.card};
  border-right: 1.5px solid ${COLOR.border};
  padding: 32px 24px 0 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 2px 0 8px ${COLOR.imgShadow};
`;

const Logo = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: ${COLOR.logo};
  cursor: pointer;
  margin-bottom: 24px;
  letter-spacing: 1px;
  transition: color 0.18s;
  &:hover {
    color: ${COLOR.accent};
  }
`;

const SidebarTitle = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: ${COLOR.text};
  margin-bottom: 24px;
`;

const ProjectSection = styled.div`
  margin-bottom: 24px;
`;

const ProjectTitle = styled.div`
  font-weight: bold;
  font-size: 16px;
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  color: ${COLOR.text};
`;

const DropdownArrow = styled.span`
  font-size: 14px;
  margin-left: 8px;
  color: ${COLOR.subText};
`;

const MeetingList = styled.ul`
  list-style: none;
  padding: 0;
`;

const MeetingItem = styled.li`
  margin-bottom: 8px;
`;

const MeetingDate = styled.div`
  font-weight: bold;
  margin-bottom: 4px;
  margin-left: 10px;
  color: ${COLOR.text};
`;

const SubItem = styled.div`
  font-size: 15px;
  margin-left: 24px;
  color: ${COLOR.subText};
  margin-bottom: 2px;
`;

const SidebarFooter = styled.div`
  margin-top: auto;
  font-size: 14px;
  color: ${COLOR.subText};
  padding: 18px 0 12px 0;
  border-top: 1.5px solid ${COLOR.border};
`;

const MainArea = styled.div<{
  $isTextMode: boolean;
  $isVoteCreateMode: boolean;
}>`
  position: relative;
  flex: 1;
  background: ${COLOR.bg};
  overflow: hidden;
  padding: 40px 64px;
  cursor: ${({ $isVoteCreateMode, $isTextMode }) =>
    $isVoteCreateMode
      ? `url("data:image/svg+xml;utf8,<svg width='32' height='32' xmlns='http://www.w3.org/2000/svg'><circle cx='16' cy='16' r='15' fill='white' stroke='%236b5b95' stroke-width='2'/><text x='16' y='23' text-anchor='middle' font-size='20' fill='%236b5b95' font-family='Arial' font-weight='bold'>V</text></svg>") 16 16, auto`
      : $isTextMode
      ? `url("data:image/svg+xml;utf8,<svg width='32' height='32' xmlns='http://www.w3.org/2000/svg'><circle cx='16' cy='16' r='15' fill='white' stroke='%236b5b95' stroke-width='2'/><text x='16' y='23' text-anchor='middle' font-size='20' fill='%236b5b95' font-family='Arial' font-weight='bold'>T</text></svg>") 16 16, auto`
      : "default"};
`;
                textBoxes={textBoxes}
                isTextMode={isTextMode}
                setIsTextMode={setIsTextMode}
                setTextBoxes={setTextBoxes}
                focusedIdx={focusedIdx}
                setFocusedIdx={setFocusedIdx}
                draggingIdx={draggingIdx}
                setDraggingIdx={setDraggingIdx}
                resizingIdx={resizingIdx}
                setResizingIdx={setResizingIdx}
                textColor={textColor}
                setTextColor={setTextColor}
                fontSize={fontSize}
                setFontSize={setFontSize}
                fontFamily={fontFamily}
                setFontFamily={setFontFamily}
                fontSizeInput={fontSizeInput}
                setFontSizeInput={setFontSizeInput}
                mainAreaRef={mainAreaRef}
                socketRef={socketRef}
                toolbarRef={toolbarRef}
              />
              <VoteBoxes
              focusedVoteIdx={focusedVoteIdx}
    setFocusedVoteIdx={setFocusedVoteIdx}
              getMaxZIndex={getMaxZIndex}
                voteBoxes={voteBoxes}
                setVoteBoxes={setVoteBoxes}
                socketRef={socketRef}
                mainAreaRef={mainAreaRef}
                userId={userId}
                teamId={teamId}
                projectId={PROJECT_ID}
              />
              <ImageBoxes
                imageBoxes={imageBoxes}
                setImageBoxes={setImageBoxes}
                getMaxZIndex={getMaxZIndex}
                socketRef={socketRef}
                mainAreaRef={mainAreaRef}
                focusedImageIdx={focusedImageIdx}
                setFocusedImageIdx={setFocusedImageIdx}
                teamId={teamId}
                projectId={PROJECT_ID}
                userId={userId}
              />
              {/* 플로팅 +버튼 및 생성 메뉴 */}
              <FloatingButtonWrap>
                {showCreateMenu && (
                  <CreateMenu>
                    <CreateMenuButton onClick={handleCreateVoteBoxButton}>투표</CreateMenuButton>
                    <CreateMenuButton onClick={inCall ? handleEndCall : handleStartCall}>
                      {inCall ? '통화 종료' : '화상통화'}
                    </CreateMenuButton>
                  </CreateMenu>
                )}
                <FloatingButton onClick={() => setShowCreateMenu((v) => !v)}>+</FloatingButton>
              </FloatingButtonWrap>
                <div style={{ position: 'absolute', bottom: 16, left: '16px', zIndex: 200 }}>
  {/* 내 비디오 */}
  {localStream && (
    <video 
      ref={localVideoRef} 
      autoPlay 
      muted 
      width={160} 
      height={120} 
      style={{ 
        borderRadius: 8, 
        marginRight: 8, 
        background: '#000',
        border: '2px solid #6b5b95'
      }} 
    />
  )}
  
  {/* 상대방 비디오들 */}
  {Object.entries(remoteStreams).map(([peerId, stream]) => (
    <video 
      key={peerId} 
      ref={el => { 
        if (el) remoteVideoRefs.current[peerId] = el; 
      }} 
      autoPlay 
      width={160} 
      height={120} 
      style={{ 
        borderRadius: 8, 
        marginRight: 8, 
        background: '#000',
        border: '2px solid #4CAF50'
      }} 
    />
  ))}
</div>

const FloatingToolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${COLOR.card};
  backdrop-filter: blur(8px);
  border-radius: 30px;
  padding: 6px 14px;
  box-shadow: 0 2px 12px ${COLOR.imgShadow};
  width: max-content;
  position: relative;
  z-index: 100;
  cursor: move;
  border: 1px solid ${COLOR.border};
`;

const ToolIcon = styled.button`
  background: transparent;
  border: none;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  color: ${COLOR.text};
  padding: 0;
  &:hover {
    color: ${COLOR.accentDark};
    background: ${COLOR.imgBg};
    border-radius: 50%;
  }
`;

const ToolbarDivider = styled.div`
  height: 20px;
  width: 1px;
  background: ${COLOR.border};
  margin: 0 4px;
`;

const ColorCircle = styled.button<{ color: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${({color}) => color};
  border: none;
  cursor: pointer;
  margin: 0 2px;
  &:hover {
    transform: scale(1.1);
  }
`;

const FloatingButtonWrap = styled.div`
  position: fixed;
  bottom: 36px;
  right: 48px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  z-index: 20;
`;

const CreateMenu = styled.div`
  margin-bottom: 12px;
  background: ${COLOR.card};
  border-radius: 10px;
  box-shadow: 0 2px 12px ${COLOR.imgShadow};
  padding: 6px 0;
  border: 1px solid ${COLOR.border};
`;

const CreateMenuButton = styled.button`
  display: block;
  width: 96px;
  padding: 10px 0;
  background: none;
  border: none;
  color: ${COLOR.text};
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.13s;
  &:hover {
    background: ${COLOR.imgBg};
  }
`;

const FloatingButton = styled.button`
  width: 48px;
  height: 48px;
  background: ${COLOR.accent};
  border: none;
  border-radius: 50%;
  font-size: 2rem;
  color: ${COLOR.card};
  box-shadow: 0 2px 12px ${COLOR.imgShadow};
  cursor: pointer;
  z-index: 10;
  transition: background 0.18s;
  &:hover {
    background: ${COLOR.accentDark};
  }
`;

const ColorPicker = styled.input`
  width: 30px;
  height: 30px;
  border: none;
  background: none;
  cursor: pointer;
`;

const SelectBox = styled.select`
  height: 30px;
  padding: 0 8px;
  border-radius: 4px;
  border: 1px solid ${COLOR.border};
  background: ${COLOR.card};
  color: ${COLOR.text};
`;

            </MainArea>
          </Content>
        </Container>
      );
    };

    // 스타일 컴포넌트들은 paste.txt와 동일하게 아래에 모두 포함

    const Container = styled.div`
      font-family: Arial, sans-serif;
      background-color: #f6f0ff;
      color: #333;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    `;

    const Content = styled.div`
      display: flex;
      flex: 1;
      height: calc(100vh - 70px);
    `;

    const Sidebar = styled.div`
      width: 280px;
      background: #e3e0f8;
      padding: 32px 24px 0 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    `;

    const Logo = styled.h1`
      font-size: 24px;
      font-weight: bold;
      cursor: pointer;
      margin-bottom: 24px;
    `;

    const SidebarTitle = styled.div`
      font-size: 20px;
      margin-bottom: 24px;
    `;

    const ProjectSection = styled.div`
      margin-bottom: 24px;
    `;

    const ProjectTitle = styled.div`
      font-weight: bold;
      font-size: 16px;
      display: flex;
      align-items: center;
      margin-bottom: 12px;
    `;

    const DropdownArrow = styled.span`
      font-size: 14px;
      margin-left: 8px;
    `;

    const MeetingList = styled.ul`
      list-style: none;
      padding: 0;
    `;

    const MeetingItem = styled.li`
      margin-bottom: 8px;
    `;

    const MeetingDate = styled.div`
      font-weight: bold;
      margin-bottom: 4px;
      margin-left: 10px;
    `;

    const SubItem = styled.div`
      font-size: 15px;
      margin-left: 24px;
      color: #444;
      margin-bottom: 2px;
    `;

    const SidebarFooter = styled.div`
      margin-top: auto;
      font-size: 14px;
      color: #888;
      padding: 18px 0 12px 0;
    `;

  const MainArea = styled.div<{
    $isTextMode: boolean;
    $isVoteCreateMode: boolean;
  }>`
    position: relative;
    width: 100vw;
    height: 100vh;
    background: #f6f0ff;
    overflow: hidden;
    cursor: ${({ $isVoteCreateMode, $isTextMode }) =>
      $isVoteCreateMode
        ? `url("data:image/svg+xml;utf8,<svg width='32' height='32' xmlns='http://www.w3.org/2000/svg'><circle cx='16' cy='16' r='15' fill='white' stroke='%236b5b95' stroke-width='2'/><text x='16' y='23' text-anchor='middle' font-size='20' fill='%236b5b95' font-family='Arial' font-weight='bold'>V</text></svg>") 16 16, auto`
        : $isTextMode
        ? `url("data:image/svg+xml;utf8,<svg width='32' height='32' xmlns='http://www.w3.org/2000/svg'><circle cx='16' cy='16' r='15' fill='white' stroke='%236b5b95' stroke-width='2'/><text x='16' y='23' text-anchor='middle' font-size='20' fill='%236b5b95' font-family='Arial' font-weight='bold'>T</text></svg>") 16 16, auto`
        : "default"};
  `;


    const FloatingToolbar = styled.div`
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(235, 235, 245, 0.9);
      backdrop-filter: blur(8px);
      border-radius: 30px;
      padding: 6px 14px;
      box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
      width: max-content;
      position: relative;
      z-index: 100;
      cursor: move;
    `;

    const ToolIcon = styled.button`
      background: transparent;
      border: none;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      cursor: pointer;
      color: #444;
      padding: 0;
      &:hover {
        color: #000;
      }
    `;

    const ToolbarDivider = styled.div`
      height: 20px;
      width: 1px;
      background: #dddddd;
      margin: 0 4px;
    `;

    const ColorCircle = styled.button<{ color: string }>`
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: ${({color}) => color};
      border: none;
      cursor: pointer;
      margin: 0 2px;
      &:hover {
        transform: scale(1.1);
      }
    `;

    const FloatingButtonWrap = styled.div`
      position: fixed;
      bottom: 36px;
      right: 48px;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      z-index: 20;
    `;

    const CreateMenu = styled.div`
      margin-bottom: 12px;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      padding: 6px 0;
    `;

    const CreateMenuButton = styled.button`
      display: block;
      width: 96px;
      padding: 10px 0;
      background: none;
      border: none;
      color: #6b5b95;
      font-weight: bold;
      font-size: 16px;
      cursor: pointer;
      border-radius: 8px;
      transition: background 0.13s;
      &:hover {
        background: #f6f0ff;
      }
    `;

    const FloatingButton = styled.button`
      width: 48px;
      height: 48px;
      background: #e3e0f8;
      border: none;
      border-radius: 50%;
      font-size: 2rem;
      color: #6b5b95;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      cursor: pointer;
      z-index: 10;
    `;

    const ColorPicker = styled.input`
      width: 30px;
      height: 30px;
      border: none;
      background: none;
      cursor: pointer;
    `;

    const SelectBox = styled.select`
      height: 30px;
      padding: 0 8px;
      border-radius: 4px;
      border: 1px solid #ddd;
      background: white;
    `;

    const ImageIcon = () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
        <path d="M21 15L16 10L9 18" stroke="currentColor" strokeWidth="2" />
      </svg>
    );

    const PenIcon = () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 21L12 12M18 6L12 12M12 12L8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M18 6L21 3L18 6ZM18 6L15 3L18 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );

    export default Team;
