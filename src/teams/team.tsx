import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import Draggable from 'react-draggable';

// --- 스타일 컴포넌트 import ---
import {
  Container, SidebarContainer, SidebarToggle, ProjectHeader, ProjectList,
  ProjectItem, ProjectActions, CreateProjectButton, MainArea, ProjectSelectPrompt,
  PromptText, FloatingToolbar, ToolIcon, FloatingButtonWrap,
  CreateMenu, CreateMenuButton, FloatingButton, ImageIcon, PenIcon, Cursor
} from './Team.styles';

// --- 커스텀 훅 import ---
import { useSocketManager } from './hooks/useSocketManager';
import { useWebRTC } from './hooks/useWebRTC';
import { useObjectManager } from './hooks/useObjectManager';

// --- 개별 컴포넌트 import ---
import TextBoxes from "./components/textBox";
import VoteBoxes from "./components/voteBox";
import ImageBoxes from "./components/ImageBox";
import { VideoGrid } from './components/VideoGrid';

const SOCKET_URL = "https://blanksync.kro.kr";

// 타입 정의
interface Project { pId: number; pName: string; createDate: string; }

const Teams: React.FC = () => {
  const mainAreaRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const [isTextMode, setIsTextMode] = useState(false);
  const [isVoteCreateMode, setIsVoteCreateMode] = useState(false);
  
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
  const [focusedVoteIdx, setFocusedVoteIdx] = useState<number | null>(null);
  const [focusedImageIdx, setFocusedImageIdx] = useState<number | null>(null);

  const [userId] = useState('user' + Math.floor(Math.random() * 1000));
  const [teamId] = useState(1);
  
  const { socket } = useSocketManager(String(teamId), userId);
  const socketRef = useRef<Socket | null>(null);
  useEffect(() => { socketRef.current = socket; }, [socket]);

  const { inCall, localStream, remoteStreams, cursors, handleStartCall, handleEndCall, broadcastCursorPosition } = useWebRTC(socket, String(teamId), userId);
  const { textBoxes, setTextBoxes, voteBoxes, setVoteBoxes, imageBoxes, setImageBoxes } = useObjectManager(socket);

  useEffect(() => {
    if (!socket) return;
    socket.on('room-info', ({ projects: initialProjects }: { projects: Project[] }) => setProjects(initialProjects));
    socket.on('project-added', (newProject: Project) => setProjects(prev => [...prev, newProject]));
    socket.on('project-renamed', ({ pId, newName }) => setProjects(prev => prev.map(p => p.pId === pId ? { ...p, pName: newName } : p)));
    socket.on('project-deleted', ({ pId }) => {
        setProjects(prev => prev.filter(p => p.pId !== pId));
        if (selectedProjectId === pId) setSelectedProjectId(null);
    });
    return () => {
      socket.off('room-info');
      socket.off('project-added');
      socket.off('project-renamed');
      socket.off('project-deleted');
    };
  }, [socket, selectedProjectId]);
  
  useEffect(() => {
    const mainArea = mainAreaRef.current;
    if (!mainArea || !broadcastCursorPosition) return;
    const handleMouseMove = (e: MouseEvent) => {
        const rect = mainArea.getBoundingClientRect();
        broadcastCursorPosition(e.clientX - rect.left, e.clientY - rect.top);
    };
    mainArea.addEventListener('mousemove', handleMouseMove);
    return () => mainArea.removeEventListener('mousemove', handleMouseMove);
  }, [broadcastCursorPosition]);

  const handleSelectProject = useCallback((pId: number) => {
    if (selectedProjectId === pId) return;
    setSelectedProjectId(pId);
    socket?.emit('join-project', { pId });
  }, [socket, selectedProjectId]);

  const handleCreateProject = useCallback(() => {
    const name = prompt("새 프로젝트의 이름을 입력하세요:");
    if (name && name.trim()) {
      socket?.emit('project-create', { name: name.trim() });
    }
  }, [socket]);

  const handleRenameProject = useCallback((pId: number, currentName: string) => {
    const newName = prompt("새로운 프로젝트 이름을 입력하세요:", currentName);
    if (newName && newName.trim() && newName !== currentName) {
      socket?.emit('project-rename', { pId, newName: newName.trim() });
    }
  }, [socket]);

  const handleDeleteProject = useCallback((pId: number) => {
    const currentProject = projects.find(p => p.pId === pId);
    if (window.confirm(`'${currentProject?.pName}' 프로젝트를 정말로 삭제하시겠습니까?`)) {
      socket?.emit('project-delete', { pId });
    }
  }, [socket, projects]);

  const getMaxZIndex = () => {
    const textMax = textBoxes.length > 0 ? Math.max(0, ...textBoxes.map((b: any) => b.zIndex ?? 0)) : 0;
    const voteMax = voteBoxes.length > 0 ? Math.max(0, ...voteBoxes.map((b: any) => b.zIndex ?? 0)) : 0;
    const imageMax = imageBoxes.length > 0 ? Math.max(0, ...imageBoxes.map((b: any) => b.zIndex ?? 0)) : 0;
    return Math.max(textMax, voteMax, imageMax);
  };
  
  const handleMainAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!mainAreaRef.current || !socket || e.target !== mainAreaRef.current || !selectedProjectId) return;
      const rect = mainAreaRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (isTextMode) {
        socket.emit("textEvent", { fnc: "new", type: "text", pId: selectedProjectId, cLocate: { x, y }, cScale: { width: 200, height: 40 }, cContent: "", cFont: "Arial", cColor: "#000000", cSize: 16 });
        setIsTextMode(false);
      }
      if (isVoteCreateMode) {
        socket.emit("voteEvent", { fnc: "new", type: "vote", pId: selectedProjectId, cLocate: { x, y }, cScale: { width: 300, height: 200 }, cTitle: "새 투표", cList: [{ content: "" }, { content: "" }] });
        setIsVoteCreateMode(false);
      }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProjectId) return;
    const formData = new FormData();
    formData.append("image", file);
    formData.append("tId", String(teamId));
    formData.append("pId", String(selectedProjectId));
    formData.append("uId", userId);
    formData.append("cLocate", JSON.stringify({ x: 100, y: 100 }));
    formData.append("cScale", JSON.stringify({ width: 200, height: 200 }));
    try {
      await fetch(`${SOCKET_URL}/node/api/image/upload`, { method: "POST", body: formData });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container>
      <SidebarContainer $isCollapsed={isSidebarCollapsed}>
        <ProjectHeader><h2>프로젝트 목록</h2></ProjectHeader>
        <ProjectList>
          {projects.map(p => (
            <ProjectItem key={p.pId} $isSelected={selectedProjectId === p.pId} onClick={() => handleSelectProject(p.pId)}>
              <span>{p.pName}</span>
              <ProjectActions>
                <button title="이름 변경" onClick={(e) => { e.stopPropagation(); handleRenameProject(p.pId, p.pName); }}>✏️</button>
                <button title="삭제" onClick={(e) => { e.stopPropagation(); handleDeleteProject(p.pId); }}>🗑️</button>
              </ProjectActions>
            </ProjectItem>
          ))}
        </ProjectList>
        <CreateProjectButton onClick={handleCreateProject}>+ 새 프로젝트 생성</CreateProjectButton>
      </SidebarContainer>

      <SidebarToggle $isCollapsed={isSidebarCollapsed} onClick={() => setIsSidebarCollapsed(v => !v)}>
        {isSidebarCollapsed ? '▶' : '◀'}
      </SidebarToggle>
      
      <MainArea ref={mainAreaRef} $isTextMode={isTextMode} $isVoteCreateMode={isVoteCreateMode} onClick={handleMainAreaClick}>
        {selectedProjectId === null ? (
          <ProjectSelectPrompt><PromptText>👈 사이드바에서 참여할 프로젝트를 선택해주세요.</PromptText></ProjectSelectPrompt>
        ) : (
          <>
            <Draggable nodeRef={toolbarRef as React.RefObject<HTMLElement>} bounds="parent">
              <FloatingToolbar ref={toolbarRef}>
                <ToolIcon onClick={() => setIsTextMode(prev => !prev)} title="텍스트 상자 생성"><p style={{fontWeight: isTextMode ? 'bold' : 'normal'}}>T</p></ToolIcon>
                <ToolIcon onClick={() => fileInputRef.current?.click()}><ImageIcon /><input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} /></ToolIcon>
                <ToolIcon><PenIcon /></ToolIcon>
              </FloatingToolbar>
            </Draggable>

            <TextBoxes 
              textBoxes={textBoxes} 
              setTextBoxes={setTextBoxes} 
              focusedIdx={focusedIdx} 
              setFocusedIdx={setFocusedIdx} 
              mainAreaRef={mainAreaRef} 
              socketRef={socketRef} 
              toolbarRef={toolbarRef} 
              getMaxZIndex={getMaxZIndex} 
              selectedProjectId={selectedProjectId} 
            />
            <VoteBoxes 
              voteBoxes={voteBoxes} 
              setVoteBoxes={setVoteBoxes} 
              focusedVoteIdx={focusedVoteIdx} 
              setFocusedVoteIdx={setFocusedVoteIdx} 
              mainAreaRef={mainAreaRef} 
              socketRef={socketRef} 
              getMaxZIndex={getMaxZIndex} 
              userId={userId} 
              selectedProjectId={selectedProjectId}
            />
            <ImageBoxes 
              imageBoxes={imageBoxes} 
              setImageBoxes={setImageBoxes} 
              focusedImageIdx={focusedImageIdx} 
              setFocusedImageIdx={setFocusedImageIdx} 
              mainAreaRef={mainAreaRef} 
              socketRef={socketRef} 
              getMaxZIndex={getMaxZIndex}
              selectedProjectId={selectedProjectId}
            />
            
            <VideoGrid localStream={localStream} remoteStreams={remoteStreams} />
            {Object.entries(cursors).map(([id, { x, y }]) => (<Cursor key={id} x={x} y={y} />))}

            <FloatingButtonWrap>
              {showCreateMenu && (
              <CreateMenu>
                  <CreateMenuButton onClick={() => { setIsVoteCreateMode(true); setShowCreateMenu(false); }}>투표</CreateMenuButton>
                  <CreateMenuButton onClick={inCall ? handleEndCall : handleStartCall}>{inCall ? '통화 종료' : '화상통화'}</CreateMenuButton>
              </CreateMenu>
              )}
              <FloatingButton onClick={() => setShowCreateMenu((v) => !v)}>+</FloatingButton>
            </FloatingButtonWrap>
          </>
        )}
      </MainArea>
    </Container>
  );
};

export default Teams;