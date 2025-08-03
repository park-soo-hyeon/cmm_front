import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';

import { useSocketManager } from './hooks/useSocketManager';
import { useWebRTC } from './hooks/useWebRTC';
import { VideoGrid } from './components/VideoGrid';
import TextBoxes from "./components/textBox";
import VoteBoxes from "./components/voteBox";
import ImageBoxes from "./components/ImageBox";

// 컴포넌트 이름: Teams
const Teams: React.FC = () => {
  const { state } = useLocation();
  const { userId, teamId } = state || {};
  const navigate = useNavigate();
  const mainAreaRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null); // 툴바 참조 추가
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const { socket } = useSocketManager(teamId, userId);
  const { inCall, localStream, remoteStreams, cursors, handleStartCall, handleEndCall, broadcastCursorPosition } = useWebRTC(socket, teamId, userId);

  // 각 객체의 상태를 Teams 컴포넌트에서 관리
  const [textBoxes, setTextBoxes] = useState<any[]>([]);
  const [voteBoxes, setVoteBoxes] = useState<any[]>([]);
  const [imageBoxes, setImageBoxes] = useState<any[]>([]);
  
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
  const [focusedVoteIdx, setFocusedVoteIdx] = useState<number | null>(null);
  const [focusedImageIdx, setFocusedImageIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!socket) return;
    // init 이벤트로 모든 객체 상태 초기화
    const onInit = (data: any) => {
      setTextBoxes(data.texts || []);
      setVoteBoxes(data.votes || []);
      setImageBoxes(data.images || []);
    };
    socket.on("init", onInit);
    return () => { socket.off("init", onInit); };
  }, [socket]);

  // z-index 계산 함수
  const getMaxZIndex = () => {
    const textMax = textBoxes.length > 0 ? Math.max(0, ...textBoxes.map(b => b.zIndex ?? 0)) : 0;
    const voteMax = voteBoxes.length > 0 ? Math.max(0, ...voteBoxes.map(b => b.zIndex ?? 0)) : 0;
    const imageMax = imageBoxes.length > 0 ? Math.max(0, ...imageBoxes.map(b => b.zIndex ?? 0)) : 0;
    return Math.max(textMax, voteMax, imageMax);
  };
  
  useEffect(() => {
    const mainArea = mainAreaRef.current;
    if (!mainArea || !broadcastCursorPosition) return;

    let throttleTimeout: NodeJS.Timeout | null = null;
    const handleMouseMove = (e: MouseEvent) => {
      if (throttleTimeout) return;
      throttleTimeout = setTimeout(() => {
        const rect = mainArea.getBoundingClientRect();
        broadcastCursorPosition(e.clientX - rect.left, e.clientY - rect.top);
        throttleTimeout = null;
      }, 50);
    };

    mainArea.addEventListener('mousemove', handleMouseMove);
    return () => mainArea.removeEventListener('mousemove', handleMouseMove);
  }, [broadcastCursorPosition]);

  return (
    <Container>
      <Content>
        <SidebarContainer>
            <Logo onClick={() => navigate("/")}>BlankSync</Logo>
            <SidebarTitle><strong>팀 프로젝트</strong></SidebarTitle>
        </SidebarContainer>

        <MainArea ref={mainAreaRef}>
          <TextBoxes
            textBoxes={textBoxes}
            setTextBoxes={setTextBoxes}
            focusedIdx={focusedIdx}
            setFocusedIdx={setFocusedIdx}
            mainAreaRef={mainAreaRef}
            socketRef={{ current: socket }}
            toolbarRef={toolbarRef}
            getMaxZIndex={getMaxZIndex}
          />
          <VoteBoxes
            voteBoxes={voteBoxes}
            setVoteBoxes={setVoteBoxes}
            focusedVoteIdx={focusedVoteIdx}
            setFocusedVoteIdx={setFocusedVoteIdx}
            mainAreaRef={mainAreaRef}
            socketRef={{ current: socket }}
            getMaxZIndex={getMaxZIndex}
            userId={userId}
          />
          <ImageBoxes
            imageBoxes={imageBoxes}
            setImageBoxes={setImageBoxes}
            focusedImageIdx={focusedImageIdx}
            setFocusedImageIdx={setFocusedImageIdx}
            mainAreaRef={mainAreaRef}
            socketRef={{ current: socket }}
            getMaxZIndex={getMaxZIndex}
          />

          {Object.entries(cursors).map(([id, { x, y }]) => (
            <Cursor key={id} x={x} y={y} />
          ))}

          <VideoGrid localStream={localStream} remoteStreams={remoteStreams} />

          <FloatingButtonWrap>
              {showCreateMenu && (
                <CreateMenu>
                  <CreateMenuButton>투표</CreateMenuButton>
                  <CreateMenuButton onClick={inCall ? handleEndCall : handleStartCall}>
                    {inCall ? '통화 종료' : '화상통화'}
                  </CreateMenuButton>
                </CreateMenu>
              )}
              <FloatingButton onClick={() => setShowCreateMenu((v) => !v)}>+</FloatingButton>
            </FloatingButtonWrap>
        </MainArea>
      </Content>
    </Container>
  );
};

export default Teams;

// --- Styled-components ---
const Cursor = styled.div.attrs<{ x: number; y: number }>(({ x, y }) => ({ style: { transform: `translate(${x}px, ${y}py)` }, }))<{ x: number; y: number }>` position: absolute; top: 0; left: 0; width: 24px; height: 24px; background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%236b5b95" stroke="white" stroke-width="2"><path d="M0 0l18 12L7 14 0 24V0z" transform="translate(1, -1)"/></svg>'); background-size: contain; z-index: 9999; pointer-events: none; transition: transform 0.05s linear; `;
const Container = styled.div` min-height: 100vh; display: flex; flex-direction: column; `;
const Content = styled.div` display: flex; flex: 1; `;
const SidebarContainer = styled.div` width: 280px; padding: 32px 24px; border-right: 1px solid #e0e0e0; `;
const Logo = styled.h1` font-size: 24px; font-weight: bold; cursor: pointer; `;
const SidebarTitle = styled.div` font-size: 20px; font-weight: 600; margin-top: 24px; `;
const MainArea = styled.div` position: relative; flex: 1; overflow: hidden; `;
const FloatingButtonWrap = styled.div` position: fixed; bottom: 36px; right: 48px; `;
const FloatingButton = styled.button` width: 48px; height: 48px; border-radius: 50%; border: none; font-size: 2rem; cursor: pointer; `;
const CreateMenu = styled.div` margin-bottom: 12px; `;
const CreateMenuButton = styled.button` padding: 10px 16px; `;