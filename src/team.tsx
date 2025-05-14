import React, { useRef, useCallback, useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Draggable from 'react-draggable';
import { io, Socket } from "socket.io-client";

type TextBox = { 
  x: number; 
  y: number; 
  value: string; 
  width: number; 
  height: number;
  color: string;
  fontSize: number;
  fontFamily: string;
  node?: string;  // 서버에서 할당하는 고유 ID 추가
};

interface ServerTextBox {
  node: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string;
  size: number;
  font: string;
}

const MIN_WIDTH = 50;
const MIN_HEIGHT = 30;
const FONT_SIZES = [12, 14, 16, 18, 24, 32];
const FONT_FAMILIES = ['Arial', 'Helvetica', 'Times New Roman', 'Verdana', 'Courier New'];
const SOCKET_URL = "http://44.212.5.151:3000";

const Team: React.FC = () => {
  const navigate = useNavigate();
  const mainAreaRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const [isTextMode, setIsTextMode] = useState(false);
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [resizingIdx, setResizingIdx] = useState<number | null>(null);
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Arial');

  // 드래그/리사이즈 관련 ref (기존 코드 유지)
  const resizeStart = useRef<{ 
    startX: number; 
    startY: number; 
    startW: number; 
    startH: number; 
  }>({ startX: 0, startY: 0, startW: 0, startH: 0 });

  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const textBoxesRef = useRef(textBoxes);
  textBoxesRef.current = textBoxes;
  const draggingIdxRef = useRef(draggingIdx);
  draggingIdxRef.current = draggingIdx;
  const resizingIdxRef = useRef(resizingIdx);
  resizingIdxRef.current = resizingIdx;

  // 소켓 연결 및 이벤트 핸들링 (추가된 부분)
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    const uId = "user123"; // 실제 구현시 인증 시스템 필요
    const tId = "1";
    socket.emit("joinTeam", { uId, tId });

      socket.on("initialize", (serverTextBoxes: ServerTextBox[]) => {
    setTextBoxes(serverTextBoxes.map((box: ServerTextBox) => ({
      x: box.x,
      y: box.y,
      value: box.text,
      width: box.width,
      height: box.height,
      color: box.color,
      fontSize: box.size,
      fontFamily: box.font,
      node: box.node
    })));
  });

    socket.on("addTextBox", (data) => {
      setTextBoxes(prev => [...prev, {
        x: data.cLocate.x,
        y: data.cLocate.y,
        value: data.cContent,
        width: data.cScale.width,
        height: data.cScale.height,
        color: data.cColor,
        fontSize: data.cSize,
        fontFamily: data.cFont,
        node: data.node
      }]);
    });

    socket.on("updateTextBox", (data) => {
      setTextBoxes(prev => prev.map(box =>
        box.node === data.node ? { 
          ...box, 
          value: data.cContent, 
          color: data.cColor, 
          fontSize: data.cSize, 
          fontFamily: data.cFont 
        } : box
      ));
    });

    socket.on("moveTextBox", (data) => {
      setTextBoxes(prev => prev.map(box =>
        box.node === data.node ? { 
          ...box, 
          x: data.cLocate.x, 
          y: data.cLocate.y,
          width: data.cScale.width,
          height: data.cScale.height
        } : box
      ));
    });

    socket.on("removeTextBox", (data) => {
      setTextBoxes(prev => prev.filter(box => box.node !== data.node));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // 스타일 변경 핸들러 (기존 코드 유지)
  useEffect(() => {
    if (focusedIdx !== null) {
      const currentBox = textBoxes[focusedIdx];
      setTextColor(currentBox.color);
      setFontSize(currentBox.fontSize);
      setFontFamily(currentBox.fontFamily);
    }
  }, [focusedIdx, textBoxes]);

  // 텍스트 박스 생성 핸들러 (Socket.IO 통신 추가)
  const handleMainAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isTextMode || !mainAreaRef.current) return;
    const rect = mainAreaRef.current.getBoundingClientRect();
    const maxX = rect.width - 200;
    const maxY = rect.height - 40;
    const x = Math.max(0, Math.min(e.clientX - rect.left, maxX));
    const y = Math.max(0, Math.min(e.clientY - rect.top, maxY));

    socketRef.current?.emit("textEvent", {
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
  };

  // 텍스트 내용 변경 핸들러 (Socket.IO 통신 추가)
  const handleTextBoxChange = (idx: number, value: string) => {
  // 1. 로컬 상태를 즉시 업데이트
  setTextBoxes(prev =>
    prev.map((box, i) =>
      i === idx ? { ...box, value } : box
    )
  );

  // 2. 서버에 변경사항 전송
  const node = textBoxes[idx].node;
  if (!node) return;

  socketRef.current?.emit("textEvent", {
    fnc: "update",
    node,
    cContent: value,
    cFont: textBoxes[idx].fontFamily,
    cColor: textBoxes[idx].color,
    cSize: textBoxes[idx].fontSize,
    type: "text"
  });
};


  // 텍스트 박스 삭제 핸들러 (Socket.IO 통신 추가)
  const handleDelete = (idx: number) => {
    const node = textBoxes[idx].node;
    if (!node) return;

    socketRef.current?.emit("textEvent", {
      fnc: "delete",
      node,
      type: "text"
    });
  };

  // 드래그 시작 핸들러 (Socket.IO 통신 추가)
  const handleDragStart = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDraggingIdx(idx);
    dragOffset.current = {
      x: e.clientX - textBoxesRef.current[idx].x,
      y: e.clientY - textBoxesRef.current[idx].y,
    };

    const node = textBoxes[idx].node;
    if (node) {
      socketRef.current?.emit("textEvent", {
        fnc: "move",
        node,
        cLocate: { 
          x: textBoxes[idx].x, 
          y: textBoxes[idx].y 
        },
        cScale: { 
          width: textBoxes[idx].width, 
          height: textBoxes[idx].height 
        },
        type: "text"
      });
    }

    window.addEventListener("mousemove", handleDragging);
    window.addEventListener("mouseup", handleDragOrResizeEnd);
  };

  // 드래그 중 핸들러 (기존 코드 유지)
  const handleDragging = useCallback((e: MouseEvent) => {
    const idx = draggingIdxRef.current;
    if (idx === null || !mainAreaRef.current) return;
    const rect = mainAreaRef.current.getBoundingClientRect();
    const box = textBoxesRef.current[idx];
    const newX = Math.max(0, Math.min(e.clientX - dragOffset.current.x, rect.width - box.width));
    const newY = Math.max(0, Math.min(e.clientY - dragOffset.current.y, rect.height - box.height));
    
    setTextBoxes((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], x: newX, y: newY };
      return copy;
    });
  }, []);

  // 드래그 종료 핸들러 (기존 코드 유지)
  const handleDragOrResizeEnd = useCallback(() => {
    setDraggingIdx(null);
    setResizingIdx(null);
    window.removeEventListener("mousemove", handleDragging);
    window.removeEventListener("mousemove", handleResizing);
    window.removeEventListener("mouseup", handleDragOrResizeEnd);
  }, [handleDragging]);

  // 리사이즈 시작 핸들러 (Socket.IO 통신 추가)
  const handleResizeStart = (
    idx: number,
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setResizingIdx(idx);
    resizeStart.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: textBoxesRef.current[idx].width,
      startH: textBoxesRef.current[idx].height,
    };

    const node = textBoxes[idx].node;
    if (node) {
      socketRef.current?.emit("textEvent", {
        fnc: "move",
        node,
        cLocate: { 
          x: textBoxes[idx].x, 
          y: textBoxes[idx].y 
        },
        cScale: { 
          width: textBoxes[idx].width, 
          height: textBoxes[idx].height 
        },
        type: "text"
      });
    }

    window.addEventListener("mousemove", handleResizing);
    window.addEventListener("mouseup", handleDragOrResizeEnd);
  };

  // 리사이즈 중 핸들러 (기존 코드 유지)
  const handleResizing = useCallback((e: MouseEvent) => {
    const idx = resizingIdxRef.current;
    if (idx === null || !mainAreaRef.current) return;
    const rect = mainAreaRef.current.getBoundingClientRect();
    const { startX, startY, startW, startH } = resizeStart.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const maxWidth = rect.width - textBoxesRef.current[idx].x;
    const maxHeight = rect.height - textBoxesRef.current[idx].y;
    const newWidth = Math.max(MIN_WIDTH, Math.min(startW + dx, maxWidth));
    const newHeight = Math.max(MIN_HEIGHT, Math.min(startH + dy, maxHeight));
    
    setTextBoxes((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], width: newWidth, height: newHeight };
      return copy;
    });
  }, []);

  // 스타일 변경 핸들러 (Socket.IO 통신 추가)
  const handleStyleChange = (type: string, value: string | number) => {
    if (focusedIdx === null) return;
    const node = textBoxes[focusedIdx].node;
    if (!node) return;

    const updateData = {
      fnc: "update",
      node,
      type: "text",
      [type === 'color' ? 'cColor' : 
       type === 'fontSize' ? 'cSize' : 
       'cFont']: value
    };

    socketRef.current?.emit("textEvent", updateData);
  };

  // UI 렌더링 부분 (기존 코드 전체 유지)
  return (
    <Container>
      <Content>
        <Sidebar>
          <Logo onClick={() => navigate("/")}>BlankSync</Logo>
          <SidebarTitle>
            <strong>○○○님의 프로젝트</strong>
          </SidebarTitle>
          <ProjectSection>
            <ProjectTitle>
              <span>2025학년도 졸업작품</span>
              <DropdownArrow>▼</DropdownArrow>
            </ProjectTitle>
            <MeetingList>
              <MeetingItem>
                <MeetingDate>0315 회의 내용</MeetingDate>
                <SubItem>수정사항</SubItem>
                <SubItem>긴급 회의</SubItem>
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
          onClick={handleMainAreaClick}
        >
          <Draggable 
            nodeRef={toolbarRef as React.RefObject<HTMLElement>}
            bounds="parent"
          >
            <FloatingToolbar ref={toolbarRef}>
              {focusedIdx === null ? (
                <>
                  <ToolIcon
                    onClick={() => setIsTextMode((prev) => !prev)}
                    style={{ color: isTextMode ? "#6b5b95" : undefined }}
                    title="텍스트 상자 생성 모드"
                  >
                    T
                  </ToolIcon>
                  <ToolIcon>
                    <ImageIcon />
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
                  <SelectBox
                    value={fontSize}
                    onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value))}
                  >
                    {FONT_SIZES.map(size => (
                      <option key={size} value={size}>{size}px</option>
                    ))}
                  </SelectBox>
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

          {textBoxes.map((box, idx) => (
            <TextBoxWrap
              key={idx}
              style={{ 
                left: box.x, 
                top: box.y,
                width: box.width,
                height: box.height 
              }}
              tabIndex={0}
              onFocus={() => setFocusedIdx(idx)}
              onBlur={() => setFocusedIdx((cur) => (cur === idx ? null : cur))}
            >
              <TextBoxInput
                width={box.width}
                height={box.height}
                value={box.value}
                onChange={(e) => handleTextBoxChange(idx, e.target.value)}
                autoFocus={focusedIdx === idx}
                style={{
                  color: box.color,
                  fontSize: `${box.fontSize}px`,
                  fontFamily: box.fontFamily
                }}
              />
              {focusedIdx === idx && (
                <>
                  <ButtonGroup>
                    <CircleBtn
                      color="#00d26a"
                      title="이동"
                      onMouseDown={(e) => handleDragStart(idx, e)}
                    />
                    <CircleBtn
                      color="#ff4a4a"
                      title="삭제"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(idx);
                      }}
                    />
                  </ButtonGroup>
                  <ResizeHandle onMouseDown={(e) => handleResizeStart(idx, e)} />
                </>
              )}
            </TextBoxWrap>
          ))}
          <FloatingButton>+</FloatingButton>
        </MainArea>
      </Content>
    </Container>
  );
};

// 스타일 컴포넌트 (기존 코드 전체 유지)
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

const MainArea = styled.div<{ $isTextMode: boolean }>`
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #f6f0ff;
  cursor: ${({ $isTextMode }) => ($isTextMode ? "text" : "default")};
  overflow: hidden;
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
  z-index: 10;
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

const TextBoxWrap = styled.div`
  position: absolute;
  min-width: ${MIN_WIDTH}px;
  min-height: ${MIN_HEIGHT}px;
  background: transparent;
  border: 2px solid rgba(107, 91, 149, 0.5);
  border-radius: 4px;
  box-sizing: border-box;
  padding: 0;
  &:hover {
    border-color: #6b5b95;
  }
`;

const TextBoxInput = styled.textarea<{width: number, height: number}>`
  width: ${({width}) => width - 16}px;
  height: ${({height}) => height - 16}px;
  font-size: 16px;
  padding: 8px;
  border: none;
  background: transparent;
  resize: none;
  outline: none;
  color: #333;
  font-family: Arial, sans-serif;
  min-width: ${MIN_WIDTH - 16}px;
  min-height: ${MIN_HEIGHT - 16}px;
  box-sizing: border-box;
`;

const ButtonGroup = styled.div`
  position: absolute;
  top: -18px;
  right: 0;
  display: flex;
  gap: 2px;
`;

const CircleBtn = styled.button<{ color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${({ color }) => color};
  border: 1.5px solid #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: transform 0.1s;
  &:active {
    transform: scale(0.92);
  }
`;

const ResizeHandle = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
  width: 12px;
  height: 12px;
  background: #6b5b95;
  border-radius: 2px;
  cursor: nwse-resize;
  &:hover {
    background: #8a76c5;
  }
`;

const FloatingButton = styled.button`
  position: fixed;
  bottom: 36px;
  right: 48px;
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
