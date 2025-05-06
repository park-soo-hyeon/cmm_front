import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const Team: React.FC = () => {
  const navigate = useNavigate();

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

        {/* 메인 컨텐츠 */}
        <MainArea>
          <FloatingToolbar>
            <ToolIcon>T</ToolIcon>
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

          {/* 여기에 메인 컨텐츠 추가 */}
          
          <FloatingButton>+</FloatingButton>
        </MainArea>
      </Content>
    </Container>
  );
};

export default Team;

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

// 사이드바 관련 컴포넌트 (동일)
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

// 메인 영역 관련 컴포넌트
const MainArea = styled.div`
  flex: 1;
  padding: 40px 32px 32px 32px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  position: relative;
`;

// 새 부유 툴바 스타일
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

// SVG 아이콘 컴포넌트들
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
