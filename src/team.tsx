import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

type TextBox = { x: number; y: number; value: string };

const Team: React.FC = () => {
  const navigate = useNavigate();

  const [isTextMode, setIsTextMode] = React.useState(false);
  const [textBoxes, setTextBoxes] = React.useState<TextBox[]>([]);
  const [focusedIdx, setFocusedIdx] = React.useState<number | null>(null);
  const [draggingIdx, setDraggingIdx] = React.useState<number | null>(null);
  const dragOffset = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // 반드시 useRef로 최신 상태를 참조해야 함!
  const textBoxesRef = React.useRef(textBoxes);
  textBoxesRef.current = textBoxes;
  const draggingIdxRef = React.useRef(draggingIdx);
  draggingIdxRef.current = draggingIdx;

  // 메인 영역 클릭 시 텍스트 박스 생성
  const handleMainAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isTextMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTextBoxes((prev) => [...prev, { x, y, value: "" }]);
    setIsTextMode(false);
  };

  // 텍스트 박스 내용 변경
  const handleTextBoxChange = (idx: number, value: string) => {
    setTextBoxes((prev) => {
      const copy = [...prev];
      copy[idx].value = value;
      return copy;
    });
  };

  // 텍스트 박스 삭제
  const handleDelete = (idx: number) => {
    setTextBoxes((prev) => prev.filter((_, i) => i !== idx));
    setFocusedIdx(null);
  };

  // 드래그 중 (useRef로 최신 상태 참조)
  const handleDragging = React.useCallback((e: MouseEvent) => {
    const idx = draggingIdxRef.current;
    if (idx === null) return;
    setTextBoxes((prev) => {
      const copy = [...prev];
      copy[idx] = {
        ...copy[idx],
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      };
      return copy;
    });
  }, []);

  // 드래그 종료
  const handleDragEnd = React.useCallback(() => {
    setDraggingIdx(null);
    window.removeEventListener("mousemove", handleDragging);
    window.removeEventListener("mouseup", handleDragEnd);
  }, [handleDragging]);

  // 드래그 시작
  const handleDragStart = (
    idx: number,
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setDraggingIdx(idx);
    dragOffset.current = {
      x: e.clientX - textBoxesRef.current[idx].x,
      y: e.clientY - textBoxesRef.current[idx].y,
    };
    window.addEventListener("mousemove", handleDragging);
    window.addEventListener("mouseup", handleDragEnd);
  };

  return (
    <Container>
      <Content>
        {/* 사이드바 */}
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
          onClick={handleMainAreaClick}
          $isTextMode={isTextMode}
        >
          {/* 툴바 */}
          <FloatingToolbar>
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
          </FloatingToolbar>

          {textBoxes.map((box, idx) => (
            <TextBoxWrap
              key={idx}
              style={{ left: box.x, top: box.y }}
              tabIndex={0}
              onFocus={() => setFocusedIdx(idx)}
              onBlur={() => setFocusedIdx((cur) => (cur === idx ? null : cur))}
            >
              <TextBoxInput
                value={box.value}
                onChange={e => handleTextBoxChange(idx, e.target.value)}
                autoFocus={focusedIdx === idx}
                onFocus={() => setFocusedIdx(idx)}
                onDragStart={e => e.preventDefault()}
              />
              {focusedIdx === idx && (
                <ButtonGroup>
                  <CircleBtn
                    color="#00d26a"
                    title="이동"
                    onMouseDown={e => handleDragStart(idx, e)}
                    onDragStart={e => e.preventDefault()}
                  />
                  <CircleBtn
                    color="#ff4a4a"
                    title="삭제"
                    onClick={() => handleDelete(idx)}
                  />
                </ButtonGroup>
              )}
            </TextBoxWrap>
          ))}
          <FloatingButton>+</FloatingButton>
        </MainArea>
      </Content>
    </Container>
  );
};

export default Team;

// 아래 스타일 컴포넌트는 기존 코드와 동일하게 사용하세요!
/* ... (생략, 기존 코드 그대로 사용) ... */


// Styled Components
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

// 사이드바
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

// 메인 영역
const MainArea = styled.div<{ $isTextMode: boolean }>`
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #f6f0ff;
  cursor: ${({ $isTextMode }) => ($isTextMode ? "text" : "default")};
`;

// 부유 툴바
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
  margin: 0 auto;
  position: relative;
  z-index: 10;
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
  background: ${(props) => props.color};
  border: none;
  cursor: pointer;
  margin: 0 2px;
  &:hover {
    transform: scale(1.1);
  }
`;

// 텍스트 박스 input 스타일
const TextBoxInput = styled.input`
  font-size: 16px;
  padding: 4px 8px;
  border: 1px solid #bdbdbd;
  border-radius: 4px;
  background: #fff;
  color: #333;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
`;


const TextBoxWrap = styled.div`
  position: absolute;
  min-width: 120px;
  z-index: 10;
  outline: none;
`;

// SVG 아이콘 컴포넌트
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

const ButtonGroup = styled.div`
  position: absolute;
  top: -18px;
  right: -8px;
  display: flex;
  gap: 6px;
`;

const CircleBtn = styled.button<{ color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${({ color }) => color};
  border: 1.5px solid #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,0.08);
  cursor: pointer;
  display: inline-block;
  transition: transform 0.1s;
  &:active {
    transform: scale(0.92);
  }
`;