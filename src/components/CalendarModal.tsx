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
    width: 600px; /* 캘린더 전체 너비 대폭 키우기 */
    border: none;
    font-size: 1.3rem; /* 전체적인 폰트 크기 키우기 */
  }

  /* 헤더 (2025년 8월) 부분 스타일 */
  .react-calendar__navigation__label {
    font-size: 1.8rem;
    font-weight: bold;
  }

  /* 요일 (일, 월, 화...) 부분 스타일 */
  .react-calendar__month-view__weekdays__weekday abbr {
    font-size: 1.2rem;
    text-decoration: none; /* 밑줄 제거 */
    font-weight: 600;
  }

  /* 각 날짜(타일)의 사이즈와 간격 조절 */
  .react-calendar__tile {
    height: 70px; /* 타일의 세로 높이를 고정하여 키움 */
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* 오늘 날짜 타일의 폰트 굵게 */
  .react-calendar__tile--now {
    background: #f0f0f0;
    font-weight: bold;
    border-radius: 8px;
    &:hover {
      background: #e0e0e0;
    }
  }

  /* 선택된 날짜 타일 */
  .react-calendar__tile--active {
    background: #007bff;
    color: white;
    border-radius: 8px;
  }

  /* 토요일 글자색 파란색으로 변경 */
  .saturday {
    color: #007bff;
  }
`;

// 닫기 버튼
const CloseButton = styled.button`
  margin-top: 20px;
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
        <Calendar
          // 일요일부터 시작하도록 변경
          calendarType="gregory"
          // '일' 글자 제거 (가장 확실한 방법으로 수정)
          formatDay={(locale, date) => date.getDate().toString()}
          // 토요일에 'saturday' 클래스 추가
          tileClassName={({ date, view }) => {
            if (view === 'month' && date.getDay() === 6) { // 6 = Saturday
              return 'saturday';
            }
          }}
        />
        <CloseButton onClick={onClose}>
          닫기
        </CloseButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CalendarModal;