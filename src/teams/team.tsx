import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import Draggable from 'react-draggable';

import { useSocketManager } from './hooks/useSocketManager';
import { useWebRTC } from './hooks/useWebRTC';
import { useObjectManager } from './hooks/useObjectManager';
import { VideoGrid } from './components/VideoGrid';
import TextBoxes from "./components/textBox";
import VoteBoxes from "./components/voteBox";
import ImageBoxes from "./components/ImageBox";

const FONT_FAMILIES = [ 'Nanum Gothic', 'Nanum Myeongjo', 'Nanum Pen Script', 'BM Jua', 'Gungseo', 'Arial' ];
const PROJECT_ID = "1";
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "wss://default.domain";

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
  
  const handleImageButtonClick = () => {
      fileInputRef.current?.click();
  };

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
      const res = await fetch(SOCKET_URL + "/api/image/upload", { method: "POST", body: formData });
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
      if (!mainAreaRef.current || !socket) return;
      if (e.target !== mainAreaRef.current) return;

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
                    <ToolIcon onClick={() => setIsTextMode((prev) => !prev)} style={{ color: isTextMode ? "#6b5b95" : undefined }} title="텍스트 상자 생성 모드">T</ToolIcon>
                    <ToolIcon onClick={handleImageButtonClick}>
                      <ImageIcon />
                      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
                    </ToolIcon>
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
                    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <input type="number" min={8} max={64} value={fontSizeInput} 
                        onChange={e => setFontSizeInput(e.target.value)} 
                        onBlur={e => handleStyleChange('fontSize', Number(e.target.value))}
                        style={{ width: 40, textAlign: "center" }} />
                      <span style={{ marginLeft: 2 }}>px</span>
                    </div>
                    <SelectBox value={fontFamily} onChange={(e) => handleStyleChange('fontFamily', e.target.value)}>
                        {FONT_FAMILIES.map(font => <option key={font} value={font}>{font}</option>)}
                    </SelectBox>
                  </>
                )}
              </FloatingToolbar>
            </Draggable>
            
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

            {Object.entries(cursors).map(([id, { x, y }]) => (
                <Cursor key={id} x={x} y={y} />
            ))}

            <VideoGrid localStream={localStream} remoteStreams={remoteStreams} />

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
        </MainArea>
      </Content>
    </Container>
  );
};

export default Teams;

const COLOR = { bg: "#EDE9F2", card: "#F2F2F2", accent: "#B8B6F2", accentDark: "#545159", text: "#3B3740", subText: "#A19FA6", logo: "#C6C4F2", imgBg: "#D1D0F2", imgShadow: "#CEDEF2", border: "#E3DCF2" };
const Cursor = styled.div.attrs<{ x: number; y: number }>(({ x, y }) => ({ style: { transform: `translate(${x}px, ${y}px)` }, }))<{ x: number; y: number }>` position: absolute; top: 0; left: 0; width: 24px; height: 24px; background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%236b5b95" stroke="white" stroke-width="2"><path d="M0 0l18 12L7 14 0 24V0z" transform="translate(1, -1)"/></svg>'); background-size: contain; z-index: 9999; pointer-events: none; transition: transform 0.05s linear; `;
const Container = styled.div` font-family: 'Pretendard', sans-serif; background: ${COLOR.bg}; color: ${COLOR.text}; min-height: 100vh; display: flex; flex-direction: column; `;
const Content = styled.div` display: flex; flex: 1; height: calc(100vh); `;
const SidebarContainer = styled.div` width: 280px; background: ${COLOR.card}; border-right: 1.5px solid ${COLOR.border}; padding: 32px 24px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 2px 0 8px ${COLOR.imgShadow}; `;
const Logo = styled.h1` font-size: 24px; font-weight: bold; color: ${COLOR.logo}; cursor: pointer; margin-bottom: 24px; letter-spacing: 1px; transition: color 0.18s; &:hover { color: ${COLOR.accent}; } `;
const SidebarTitle = styled.div` font-size: 20px; font-weight: 600; color: ${COLOR.text}; margin-bottom: 24px; `;
const ProjectSection = styled.div` margin-bottom: 24px; flex: 1; `;
const ProjectTitle = styled.div` font-weight: bold; font-size: 16px; display: flex; align-items: center; margin-bottom: 12px; color: ${COLOR.text}; `;
const DropdownArrow = styled.span` font-size: 14px; margin-left: 8px; color: ${COLOR.subText}; `;
const MeetingList = styled.ul` list-style: none; padding: 0; `;
const MeetingItem = styled.li` margin-bottom: 8px; `;
const MeetingDate = styled.div` font-weight: bold; margin-bottom: 4px; margin-left: 10px; color: ${COLOR.text}; `;
const SubItem = styled.div` font-size: 15px; margin-left: 24px; color: ${COLOR.subText}; margin-bottom: 2px; `;
const SidebarFooter = styled.div` font-size: 14px; color: ${COLOR.subText}; padding-top: 18px; border-top: 1.5px solid ${COLOR.border}; `;
const MainArea = styled.div<{ $isTextMode: boolean; $isVoteCreateMode: boolean; }>` position: relative; flex: 1; background: ${COLOR.bg}; overflow: hidden; padding: 40px 64px; cursor: ${({ $isVoteCreateMode, $isTextMode }) => $isVoteCreateMode ? 'crosshair' : $isTextMode ? 'text' : "default"}; `;
const FloatingToolbar = styled.div` display: flex; align-items: center; gap: 8px; background: ${COLOR.card}; backdrop-filter: blur(8px); border-radius: 30px; padding: 6px 14px; box-shadow: 0 2px 12px ${COLOR.imgShadow}; width: max-content; position: absolute; z-index: 100; cursor: move; border: 1px solid ${COLOR.border}; `;
const ToolIcon = styled.button` background: transparent; border: none; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 18px; cursor: pointer; color: ${COLOR.text}; padding: 0; &:hover { color: ${COLOR.accentDark}; background: ${COLOR.imgBg}; border-radius: 50%; } `;
const ToolbarDivider = styled.div` height: 20px; width: 1px; background: ${COLOR.border}; margin: 0 4px; `;
const ColorCircle = styled.button<{ color: string }>` width: 20px; height: 20px; border-radius: 50%; background: ${({ color }) => color}; border: none; cursor: pointer; margin: 0 2px; &:hover { transform: scale(1.1); } `;
const FloatingButtonWrap = styled.div` position: fixed; bottom: 36px; right: 48px; display: flex; flex-direction: column; align-items: flex-end; z-index: 20; `;
const CreateMenu = styled.div` margin-bottom: 12px; background: ${COLOR.card}; border-radius: 10px; box-shadow: 0 2px 12px ${COLOR.imgShadow}; padding: 6px 0; border: 1px solid ${COLOR.border}; `;
const CreateMenuButton = styled.button` display: block; width: 96px; padding: 10px 0; background: none; border: none; color: ${COLOR.text}; font-weight: bold; font-size: 16px; cursor: pointer; border-radius: 8px; transition: background 0.13s; &:hover { background: ${COLOR.imgBg}; } `;
const FloatingButton = styled.button` width: 48px; height: 48px; background: ${COLOR.accent}; border: none; border-radius: 50%; font-size: 2rem; color: ${COLOR.card}; box-shadow: 0 2px 12px ${COLOR.imgShadow}; cursor: pointer; z-index: 10; transition: background 0.18s; &:hover { background: ${COLOR.accentDark}; } `;
const ColorPicker = styled.input` width: 30px; height: 30px; border: none; background: none; cursor: pointer; `;
const SelectBox = styled.select` height: 30px; padding: 0 8px; border-radius: 4px; border: 1px solid ${COLOR.border}; background: ${COLOR.card}; color: ${COLOR.text}; `;
const ImageIcon = () => ( <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" /> <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" /> <path d="M21 15L16 10L9 18" stroke="currentColor" strokeWidth="2" /> </svg> );
const PenIcon = () => ( <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M3 21L12 12M18 6L12 12M12 12L8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /> <path d="M18 6L21 3L18 6ZM18 6L15 3L18 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /> </svg> );