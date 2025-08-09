import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import Draggable from 'react-draggable';

// 훅과 컴포넌트 import
import { useSocketManager } from './hooks/useSocketManager';
import { useWebRTC } from './hooks/useWebRTC';
import { useObjectManager } from './hooks/useObjectManager';
import { VideoGrid } from './components/VideoGrid';
import TextBoxes from "./components/textBox";
import VoteBoxes from "./components/voteBox";
import ImageBoxes from "./components/ImageBox";
import {
  Container, Content, SidebarContainer, Logo, SidebarTitle, ProjectSection, ProjectTitle, DropdownArrow,
  MeetingList, MeetingItem, MeetingDate, SubItem, SidebarFooter, MainArea, FloatingToolbar, ToolIcon,
  ToolbarDivider, ColorCircle, FloatingButtonWrap, CreateMenu, CreateMenuButton, FloatingButton,
  ColorPicker, SelectBox, ImageIcon, PenIcon, Cursor
} from './Team.styles';

// 상수 정의
const FONT_FAMILIES = [ 'Nanum Gothic', 'Nanum Myeongjo', 'Nanum Pen Script', 'BM Jua', 'Gungseo', 'Arial' ];
const PROJECT_ID = "1";
const SOCKET_URL = "https://blanksync.kro.kr";

const Teams: React.FC = () => {
  const { state } = useLocation();
  const { userId, teamId } = state || {};
  const navigate = useNavigate();
  const mainAreaRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [isTextMode, setIsTextMode] = useState(false);
  const [isVoteCreateMode, setIsVoteCreateMode] = useState(false);

  const { socket } = useSocketManager(teamId, userId);
  const { inCall, localStream, remoteStreams, cursors, handleStartCall, handleEndCall, broadcastCursorPosition } = useWebRTC(socket, teamId, userId);
  
  // ✅ [수정] useObjectManager에서 상태와 '상태 변경 함수'를 모두 가져옵니다.
  const { textBoxes, setTextBoxes, voteBoxes, setVoteBoxes, imageBoxes, setImageBoxes } = useObjectManager(socket);

  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
  const [focusedVoteIdx, setFocusedVoteIdx] = useState<number | null>(null);
  const [focusedImageIdx, setFocusedImageIdx] = useState<number | null>(null);
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSizeInput, setFontSizeInput] = useState(String(fontSize));

  useEffect(() => {
    if (focusedIdx !== null && textBoxes[focusedIdx]) {
      const currentBox = textBoxes[focusedIdx];
      setTextColor(currentBox.color);
      setFontSize(currentBox.size);
      setFontFamily(currentBox.font);
      setFontSizeInput(String(currentBox.size));
    }
  }, [focusedIdx, textBoxes]);

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

  const getMaxZIndex = () => {
    const textMax = textBoxes.length > 0 ? Math.max(0, ...textBoxes.map(b => b.zIndex ?? 0)) : 0;
    const voteMax = voteBoxes.length > 0 ? Math.max(0, ...voteBoxes.map(b => b.zIndex ?? 0)) : 0;
    const imageMax = imageBoxes.length > 0 ? Math.max(0, ...imageBoxes.map(b => b.zIndex ?? 0)) : 0;
    return Math.max(textMax, voteMax, imageMax);
  };
  
  const handleImageButtonClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const x = 100, y = 100, width = 200, height = 200;
    const formData = new FormData();
    formData.append("image", file);
    formData.append("tId", teamId);
    formData.append("pId", PROJECT_ID);
    formData.append("uId", userId);
    formData.append("cLocate", JSON.stringify({ x, y }));
    formData.append("cScale", JSON.stringify({ width, height }));
    try {
      const res = await fetch(`${SOCKET_URL}/node/api/image/upload`, { method: "POST", body: formData });
      if (!res.ok) throw new Error("이미지 업로드 실패: " + res.status);
    } catch (err) {
      alert("이미지 업로드 실패: " + err);
      console.error(err);
    }
  };

  const handleCreateVoteBoxButton = () => {
    setShowCreateMenu(false);
    setIsVoteCreateMode(true);
  };
  
  const handleStyleChange = (type: string, value: string | number) => {
    if (focusedIdx === null || !socket) return;
    const currentBox = textBoxes[focusedIdx];
    if (!currentBox?.node) return;
    const updatedBox = {
        ...currentBox,
        color: type === 'color' ? value as string : currentBox.color,
        size: type === 'fontSize' ? value as number : currentBox.size,
        font: type === 'fontFamily' ? value as string : currentBox.font,
    };
    setTextBoxes(prev => prev.map((box, i) => i === focusedIdx ? updatedBox : box));
    socket.emit("textEvent", {
        fnc: "update", node: updatedBox.node, type: "text",
        cColor: updatedBox.color, cSize: updatedBox.size, cFont: updatedBox.font,
    });
  };

  const handleMainAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!mainAreaRef.current || !socket || e.target !== mainAreaRef.current) return;
      const rect = mainAreaRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width - 200));
      const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height - 100));
      if (isTextMode) {
        socket.emit("textEvent", {
          fnc: "new", type: "text",
          cLocate: { x, y }, cScale: { width: 200, height: 40 },
          cFont: fontFamily, cColor: textColor, cSize: fontSize, cContent: "",
        });
        setIsTextMode(false);
      }
      if (isVoteCreateMode) {
        socket.emit("voteEvent", {
          fnc: "new", type: "vote",
          cLocate: { x, y }, cScale: { width: 300, height: 200 },
          cTitle: "새 투표", cList: [{ content: "" }, { content: "" }],
        });
        setIsVoteCreateMode(false);
      }
  };

  return (
    <Container>
      <Content>
        <SidebarContainer> 
            <Logo onClick={() => navigate("/")}>BlankSync</Logo>
            <SidebarTitle><strong>팀 프로젝트</strong></SidebarTitle>
            <ProjectSection>
              <ProjectTitle>
                <span>2025년 신제품</span><DropdownArrow>▼</DropdownArrow>
              </ProjectTitle>
              <MeetingList>
                <MeetingItem>
                  <MeetingDate>0315 회의 내용</MeetingDate>
                  <SubItem>일정 정리</SubItem>
                  <SubItem>주제 회의</SubItem>
                </MeetingItem>
              </MeetingList>
            </ProjectSection>
            <SidebarFooter>페이지 생성 / 삭제</SidebarFooter>
        </SidebarContainer>

        <MainArea ref={mainAreaRef} $isTextMode={isTextMode} $isVoteCreateMode={isVoteCreateMode} onClick={handleMainAreaClick}>
            <Draggable nodeRef={toolbarRef as React.RefObject<HTMLElement>} bounds="parent">
              <FloatingToolbar ref={toolbarRef}>
                {focusedIdx === null ? (
                  <>
                    <ToolIcon onClick={(e) => { e.stopPropagation(); setIsTextMode(prev => !prev); }} style={{ color: isTextMode ? "#6b5b95" : undefined }} title="텍스트 상자 생성 모드">T</ToolIcon>
                    <ToolIcon onClick={handleImageButtonClick}><ImageIcon /><input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} /></ToolIcon>
                    <ToolIcon><PenIcon /></ToolIcon>
                    <ToolbarDivider />
                    <ToolIcon>+</ToolIcon>
                    <ColorCircle color="#ff0000" />
                    <ColorCircle color="#00ff00" />
                    <ColorCircle color="#0000ff" />
                    <ColorCircle color="#ffb700" />
                  </>
                ) : (
                  <>
                    <ColorPicker type="color" value={textColor} onChange={(e) => handleStyleChange('color', e.target.value)} />
                    <div><input type="number" min={8} max={64} value={fontSizeInput} onChange={e => setFontSizeInput(e.target.value)} onBlur={e => handleStyleChange('fontSize', Number(e.target.value))} style={{ width: 40, textAlign: "center" }} /><span>px</span></div>
                    <SelectBox value={fontFamily} onChange={(e) => handleStyleChange('fontFamily', e.target.value)}>
                        {FONT_FAMILIES.map(font => <option key={font} value={font}>{font}</option>)}
                    </SelectBox>
                  </>
                )}
              </FloatingToolbar>
            </Draggable>
            
            {/* ✅ [수정] 각 컴포넌트에 상태와 상태 변경 함수(setter)를 모두 넘겨줍니다. */}
            <TextBoxes
                textBoxes={textBoxes} setTextBoxes={setTextBoxes}
                focusedIdx={focusedIdx} setFocusedIdx={setFocusedIdx}
                mainAreaRef={mainAreaRef} socketRef={{ current: socket }}
                toolbarRef={toolbarRef} getMaxZIndex={getMaxZIndex}
            />
            <VoteBoxes
                voteBoxes={voteBoxes} setVoteBoxes={setVoteBoxes}
                focusedVoteIdx={focusedVoteIdx} setFocusedVoteIdx={setFocusedVoteIdx}
                mainAreaRef={mainAreaRef} socketRef={{ current: socket }}
                getMaxZIndex={getMaxZIndex} userId={userId}
            />
            <ImageBoxes
                imageBoxes={imageBoxes} setImageBoxes={setImageBoxes}
                focusedImageIdx={focusedImageIdx} setFocusedImageIdx={setFocusedImageIdx}
                mainAreaRef={mainAreaRef} socketRef={{ current: socket }}
                getMaxZIndex={getMaxZIndex}
            />

            {Object.entries(cursors).map(([id, { x, y }]) => (<Cursor key={id} x={x} y={y} />))}
            <VideoGrid localStream={localStream} remoteStreams={remoteStreams} />

            <FloatingButtonWrap>
                {showCreateMenu && (
                <CreateMenu>
                    <CreateMenuButton onClick={handleCreateVoteBoxButton}>투표</CreateMenuButton>
                    <CreateMenuButton onClick={inCall ? handleEndCall : handleStartCall}>{inCall ? '통화 종료' : '화상통화'}</CreateMenuButton>
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