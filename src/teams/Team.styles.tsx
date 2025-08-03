import styled from 'styled-components';
import React from 'react';

export const COLOR = {
  bg: "#EDE9F2", card: "#F2F2F2", accent: "#B8B6F2", accentDark: "#545159",
  text: "#3B3740", subText: "#A19FA6", logo: "#C6C4F2", imgBg: "#D1D0F2",
  imgShadow: "#CEDEF2", border: "#E3DCF2",
};

export const Cursor = styled.div.attrs<{ x: number; y: number }>(({ x, y }) => ({
  style: { transform: `translate(${x}px, ${y}px)` },
}))<{ x: number; y: number }>`
  position: absolute; top: 0; left: 0; width: 24px; height: 24px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="%236b5b95" stroke="white" stroke-width="2"><path d="M0 0l18 12L7 14 0 24V0z" transform="translate(1, -1)"/></svg>');
  background-size: contain; z-index: 9999; pointer-events: none;
  transition: transform 0.05s linear;
`;

export const Container = styled.div`
  font-family: 'Pretendard', sans-serif;
  background: ${COLOR.bg};
  color: ${COLOR.text};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

export const Content = styled.div`
  display: flex;
  flex: 1;
  height: 100vh;
`;

export const SidebarContainer = styled.div`
  width: 280px;
  background: ${COLOR.card};
  border-right: 1.5px solid ${COLOR.border};
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 2px 0 8px ${COLOR.imgShadow};
`;

export const Logo = styled.h1`
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

export const SidebarTitle = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: ${COLOR.text};
  margin-bottom: 24px;
`;

export const ProjectSection = styled.div`
  margin-bottom: 24px;
  flex: 1;
`;

export const ProjectTitle = styled.div`
  font-weight: bold;
  font-size: 16px;
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  color: ${COLOR.text};
`;

export const DropdownArrow = styled.span`
  font-size: 14px;
  margin-left: 8px;
  color: ${COLOR.subText};
`;

export const MeetingList = styled.ul`
  list-style: none;
  padding: 0;
`;

export const MeetingItem = styled.li`
  margin-bottom: 8px;
`;

export const MeetingDate = styled.div`
  font-weight: bold;
  margin-bottom: 4px;
  margin-left: 10px;
  color: ${COLOR.text};
`;

export const SubItem = styled.div`
  font-size: 15px;
  margin-left: 24px;
  color: ${COLOR.subText};
  margin-bottom: 2px;
`;

export const SidebarFooter = styled.div`
  font-size: 14px;
  color: ${COLOR.subText};
  padding-top: 18px;
  border-top: 1.5px solid ${COLOR.border};
`;

export const MainArea = styled.div<{ $isTextMode: boolean; $isVoteCreateMode: boolean; }>`
  position: relative;
  flex: 1;
  background: ${COLOR.bg};
  overflow: hidden;
  padding: 40px 64px;
  cursor: ${({ $isVoteCreateMode, $isTextMode }) => $isVoteCreateMode ? 'crosshair' : $isTextMode ? 'text' : "default"};
`;

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
export const PenIcon = () => ( <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M3 21L12 12M18 6L12 12M12 12L8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /> <path d="M18 6L21 3L18 6ZM18 6L15 3L18 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /> </svg> );