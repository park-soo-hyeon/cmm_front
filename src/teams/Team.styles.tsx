import styled from 'styled-components';
import React from 'react';

// 1. 기존 코드의 핵심 컬러 테마 유지
export const COLOR = {
  bg: "#EDE9F2", card: "#F2F2F2", accent: "#B8B6F2", accentDark: "#545159",
  text: "#3B3740", subText: "#A19FA6", logo: "#C6C4F2", imgBg: "#D1D0F2",
  imgShadow: "#CEDEF2", border: "#E3DCF2",
};

// 2. 캔버스 및 공통 요소 스타일 유지
export const Cursor = styled.div.attrs<{ x: number; y: number }>(({ x, y }) => ({
  style: { transform: `translate(${x}px, ${y}px)` },
}))<{ x: number; y: number }>`
  position: absolute; top: 0; left: 0; width: 24px; height: 24px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="%236b5b95" stroke="white" stroke-width="2"><path d="M0 0l18 12L7 14 0 24V0z" transform="translate(1, -1)"/></svg>');
  background-size: contain; z-index: 9999; pointer-events: none;
  transition: transform 0.05s linear;
`;

// 3. 새 코드의 전체 레이아웃으로 교체
export const Container = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: ${COLOR.bg};
  overflow: hidden;
  font-family: 'Pretendard', sans-serif;
  color: ${COLOR.text};
`;

// 4. 새 코드의 접고 펴는 기능이 있는 사이드바로 교체
export const SidebarContainer = styled.aside<{ $isCollapsed: boolean }>`
  width: 280px;
  background-color: ${COLOR.card};
  border-right: 1px solid ${COLOR.border};
  padding: 24px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease-in-out;
  flex-shrink: 0;
  box-shadow: 2px 0 8px ${COLOR.imgShadow};

  ${({ $isCollapsed }) => $isCollapsed && `
    width: 0;
    padding: 24px 0;
    overflow: hidden;
  `}
`;

// 5. 새 코드의 사이드바 토글 버튼 추가
export const SidebarToggle = styled.button<{ $isCollapsed: boolean }>`
  width: 24px;
  height: 48px;
  background-color: ${COLOR.card};
  border: 1px solid ${COLOR.border};
  border-left: none;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  position: relative;
  left: -1px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${COLOR.bg};
  }
`;

// 6. 새 코드의 프로젝트 목록 관련 스타일 추가
export const ProjectHeader = styled.div`
  margin-bottom: 20px;
  h2 {
    font-size: 1.2rem;
    color: ${COLOR.text};
  }
`;

export const ProjectList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex-grow: 1;
`;

export const ProjectItem = styled.li<{ $isSelected: boolean }>`
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s;

  background-color: ${({ $isSelected }) => $isSelected ? COLOR.imgBg : 'transparent'};
  color: ${({ $isSelected }) => $isSelected ? COLOR.accentDark : COLOR.text};

  &:hover {
    background-color: ${COLOR.bg};
  }
`;

export const ProjectActions = styled.div`
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;

  ${ProjectItem}:hover & {
    opacity: 1;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    color: ${COLOR.subText};
    &:hover {
        color: ${COLOR.text};
    }
  }
`;

export const CreateProjectButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: ${COLOR.accent};
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  margin-top: auto;

  &:hover {
    background-color: ${COLOR.accentDark};
  }
`;

// 7. 기존 MainArea 와 새 MainContent 를 합침
export const MainArea = styled.main<{ $isTextMode?: boolean; $isVoteCreateMode?: boolean; }>`
  flex-grow: 1;
  position: relative;
  overflow: auto;
  padding: 40px 64px;
  cursor: ${({ $isVoteCreateMode, $isTextMode }) => $isVoteCreateMode ? 'crosshair' : $isTextMode ? 'text' : "default"};
`;

// 8. 새 코드의 프로젝트 선택 유도 메시지 스타일 추가
export const ProjectSelectPrompt = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

export const PromptText = styled.h1`
  font-size: 2rem;
  color: ${COLOR.subText};
  font-weight: 500;
`;


// 9. 기존 코드의 캔버스 위젯(툴바, 버튼 등) 스타일 유지
export const FloatingToolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${COLOR.card};
  backdrop-filter: blur(8px);
  border-radius: 30px;
  padding: 6px 14px;
  box-shadow: 0 2px 12px ${COLOR.imgShadow};
  width: max-content;
  position: absolute;
  z-index: 100;
  cursor: move;
  border: 1px solid ${COLOR.border};
`;

export const ToolIcon = styled.button`
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

export const ToolbarDivider = styled.div`
  height: 20px;
  width: 1px;
  background: ${COLOR.border};
  margin: 0 4px;
`;

export const ColorCircle = styled.button<{ color: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${({ color }) => color};
  border: none;
  cursor: pointer;
  margin: 0 2px;
  &:hover {
    transform: scale(1.1);
  }
`;

export const FloatingButtonWrap = styled.div`
  position: fixed;
  bottom: 36px;
  right: 48px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  z-index: 20;
`;

export const CreateMenu = styled.div`
  margin-bottom: 12px;
  background: ${COLOR.card};
  border-radius: 10px;
  box-shadow: 0 2px 12px ${COLOR.imgShadow};
  padding: 6px 0;
  border: 1px solid ${COLOR.border};
`;

export const CreateMenuButton = styled.button`
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

export const FloatingButton = styled.button`
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

export const ColorPicker = styled.input`
  width: 30px;
  height: 30px;
  border: none;
  background: none;
  cursor: pointer;
`;

export const SelectBox = styled.select`
  height: 30px;
  padding: 0 8px;
  border-radius: 4px;
  border: 1px solid ${COLOR.border};
  background: ${COLOR.card};
  color: ${COLOR.text};
`;

export const ImageIcon = () => ( <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" /> <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" /> <path d="M21 15L16 10L9 18" stroke="currentColor" strokeWidth="2" /> </svg> );
export const PenIcon = () => ( <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M3 21L12 12M18 6L12 12M12 12L8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /> <path d="M18 6L21 3L18 6ZM18 6L15 3L18 6Z" stroke="currentColor" strokeWidth="2" strokeLine-linecap="round" /> </svg> );