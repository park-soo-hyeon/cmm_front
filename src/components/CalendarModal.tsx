import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import Calendar from 'react-calendar';
import { useAuth } from '../contexts/AuthContext';

// --- 타입 정의 ---

// API로부터 받아올 이벤트 데이터의 타입
interface CalendarEvent {
  eventId: number;
  tId: number | null;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isAllDay: boolean;
}

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

// 이벤트 제목(title)을 스타일링하기 위한 컴포넌트
const EventHighlighter = styled.div<{ color: string; opacity: number }>`
  background-color: ${(props) => `rgba(${parseInt(props.color.slice(1, 3), 16)}, ${parseInt(props.color.slice(3, 5), 16)}, ${parseInt(props.color.slice(5, 7), 16)}, ${props.opacity})`};
  color: #111;
  padding: 0 4px;
  margin-bottom: 2px;
  border-radius: 3px;
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;


// --- 컴포넌트 로직 ---

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CalendarModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { userEmail } = useAuth(); 
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [activeDate, setActiveDate] = useState(new Date()); 
  const [loading, setLoading] = useState(false); // 로딩 상태 추가

  const tIdColorMap = useMemo(() => new Map<number, string>(), []);

  const getColorForTId = useCallback((tId: number | null): string => {
    if (tId === null) {
      return '#B8B6F2'; 
    }
    if (!tIdColorMap.has(tId)) {
      const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
      tIdColorMap.set(tId, randomColor);
    }
    return tIdColorMap.get(tId)!;
  }, [tIdColorMap]);
  
  const fetchEvents = useCallback(async (date: Date) => {
    if (!userEmail) return; 

    setLoading(true);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const dateParam = `${year}-${month}`;
    
    // API_URL은 환경 변수로 설정하는 것이 가장 좋습니다. (.env 파일)
    // 예: REACT_APP_API_URL=http://localhost:8080
    const API_URL = process.env.REACT_APP_API_URL || '';
    const url = new URL(`${API_URL}/spring/calender`);
    url.searchParams.append('uid', userEmail);
    url.searchParams.append('date', dateParam);

    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: CalendarEvent[] = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("캘린더 데이터를 가져오는 데 실패했습니다:", error);
      // 사용자에게 에러 알림을 보여주는 로직 (예: alert, toast)
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    if (isOpen) {
      fetchEvents(activeDate);
    }
  }, [isOpen, activeDate, fetchEvents]);

  const handleActiveStartDateChange = ({ activeStartDate }: { activeStartDate: Date | null }) => {
    if (activeStartDate) {
      setActiveDate(activeStartDate);
    }
  };
  
  const renderTileContent = ({ date, view }: { date: Date, view: string }) => {
    if (view !== 'month') {
      return null;
    }

    const dayEvents = events.filter(event => {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      const currentDate = new Date(date);
      currentDate.setHours(0, 0, 0, 0);

      return currentDate >= startDate && currentDate <= endDate;
    });

  return (
      <>
        {dayEvents.map(event => (
          <EventHighlighter
            key={event.eventId}
            color={getColorForTId(event.tId)}
            opacity={event.isAllDay ? 1 : 0.5}
            title={event.title} 
          >
            {event.title}
          </EventHighlighter>
        ))}
      </>
    );
  };

  if (!isOpen) {
    return null;
  }

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        {loading && <div>로딩 중...</div>}
        <Calendar
          calendarType="gregory"
          formatDay={(locale, date) => date.getDate().toString()}
          tileClassName={({ date, view }) => (view === 'month' && date.getDay() === 6 ? 'saturday' : null)}
          onActiveStartDateChange={handleActiveStartDateChange}
          tileContent={renderTileContent}
        />
        <CloseButton onClick={onClose}>
          닫기
        </CloseButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CalendarModal;