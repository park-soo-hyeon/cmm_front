import React from 'react';
import styled from 'styled-components'; // styled-components import
import Calendar from 'react-calendar';

// --- 스타일 정의 ---

// 모달 배경
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5); /* 반투명 검은색 배경 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100; /* 플로팅 버튼보다 위에 있도록 설정 */
`;

// 모달 창
const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;

  /* react-calendar에 대한 스타일 덮어쓰기 */
  .react-calendar {
    border: none;
    border-radius: 8px;
  }
`;

// 닫기 버튼
const CloseButton = styled.button`
  margin-top: 15px;
  padding: 8px 16px;
  border-radius: 5px;
  border: 1px solid #ccc;
  background-color: #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #e0e0e0;
  }
`;


// --- 컴포넌트 로직 ---

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CalendarModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    // className 대신 styled-component 사용
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <Calendar />
        <CloseButton onClick={onClose}>
          닫기
        </CloseButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CalendarModal;