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

// 모달 레이아웃을 가로로 변경
const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: row; /* 캘린더와 상세 정보창을 가로로 배치 */
  align-items: flex-start;
`;

// 캘린더와 닫기 버튼을 묶는 컨테이너
const CalendarContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// 상세 일정 정보를 표시할 컨테이너
const EventDetailsContainer = styled.div`
  width: 300px;
  margin-left: 20px;
  padding-left: 20px;
  border-left: 1px solid #e0e0e0;
  height: 500px; /* 캘린더 높이와 유사하게 설정 */
  overflow-y: auto;
`;

const RightPanelContainer = styled.div`
  width: 300px;
  margin-left: 20px;
  padding-left: 20px;
  border-left: 1px solid #e0e0e0;
  height: 500px;
  overflow-y: auto;
`;

// 개별 이벤트 상세 정보를 감싸는 카드
const EventDetailCard = styled.div`
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 8px;
  background-color: #f9f9f9;
  border: 1px solid #eee;

  h4 {
    margin-top: 0;
    margin-bottom: 8px;
    font-size: 1.1rem;
  }

  p {
    margin: 4px 0;
    font-size: 0.9rem;
    color: #555;
    white-space: pre-wrap; /* 줄바꿈 적용 */
  }
`;

const DetailsHeader = styled.h3`
  font-size: 1.3rem;
  margin-top: 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
`;

const CalendarWrapper = styled.div`
  .react-calendar {
    width: 600px;
    border: none;
    font-size: 1.3rem;
  }
  .react-calendar__navigation__label {
    font-size: 1.8rem;
    font-weight: bold;
  }
  .react-calendar__month-view__weekdays__weekday abbr {
    font-size: 1.2rem;
    text-decoration: none;
    font-weight: 600;
  }
  .react-calendar__tile {
    height: 70px;
    display: flex;
    flex-direction: column; 
    align-items: flex-start; 
    justify-content: flex-start;
    padding: 4px; 
    overflow-y: hidden;
  }
  .react-calendar__tile--now {
    background: #f0f0f0;
    font-weight: bold;
    border-radius: 8px;
  }
  .react-calendar__tile--active {
    background: #007bff;
    color: white;
    border-radius: 8px;
  }
  .saturday {
    color: #007bff;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  width: 100%;
  margin-top: 20px;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border-radius: 5px;
  border: 1px solid #B8B6F2;
  background-color: #B8B6F2;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
  &:hover { background-color: #a09ee0; }
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

// --- 일정 추가 폼 스타일 ---
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  label { font-size: 0.9rem; font-weight: bold; }
  input, textarea {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }
`;
const FormRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
const SwitchLabel = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  input { opacity: 0; width: 0; height: 0; }
`;
const SwitchSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
  &:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }
`;
const SwitchInput = styled.input`
  &:checked + ${SwitchSlider} {
    background-color: #B8B6F2;
  }
  &:checked + ${SwitchSlider}:before {
    transform: translateX(20px);
  }
`;

// --- 컴포넌트 로직 ---

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// 시간 포맷팅 헬퍼 함수
const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

// YYYY-MM-DDTHH:MM 형식으로 변환 (datetime-local input용)
const toDateTimeLocal = (date: Date) => {
  const ten = (i: number) => (i < 10 ? '0' : '') + i;
  return `${date.getFullYear()}-${ten(date.getMonth() + 1)}-${ten(date.getDate())}T${ten(date.getHours())}:${ten(date.getMinutes())}`;
};
// YYYY-MM-DD 형식으로 변환 (date input용)
const toDateInput = (date: Date) => toDateTimeLocal(date).slice(0, 10);

const CalendarModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { userEmail } = useAuth(); 
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [activeDate, setActiveDate] = useState(new Date()); 
  const [loading, setLoading] = useState(false); // 로딩 상태 추가
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // 선택된 날짜 상태
  const [isAddingEvent, setIsAddingEvent] = useState(false); // 일정 추가 폼 표시 여부

  // 일정 추가 폼 상태
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startDate: toDateTimeLocal(new Date()),
    endDate: toDateTimeLocal(new Date(Date.now() + 60 * 60 * 1000)), // 기본 1시간 뒤
    isAllDay: false
  });

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
    } else {
      // 모달이 닫힐 때 선택된 날짜 초기화
      setSelectedDate(null);
    }
  }, [isOpen, activeDate, fetchEvents]);

  const handleActiveStartDateChange = ({ activeStartDate }: { activeStartDate: Date | null }) => {
    if (activeStartDate) {
      setActiveDate(activeStartDate);
    }
  };

  // 일정 추가 폼 열기 핸들러
  const handleShowAddForm = () => {
    setSelectedDate(null); // 상세 정보창 닫기
    setIsAddingEvent(true);
    
    // 폼 상태 초기화 (현재 날짜 기준)
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    setNewEvent({
        title: '',
        description: '',
        startDate: toDateTimeLocal(now),
        endDate: toDateTimeLocal(oneHourLater),
        isAllDay: false,
    });
  };
  
  // 폼 입력 변경 핸들러
  const handleNewEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    
    setNewEvent(prev => ({
      ...prev,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // 새 일정 저장 핸들러
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title) {
        alert("제목을 입력해주세요.");
        return;
    }

    const payload = {
        ...newEvent,
        uid: userEmail,
        // isAllDay가 true일 때, 시간 정보를 제거하고 'YYYY-MM-DD' 형식으로 전송
        startDate: newEvent.isAllDay ? newEvent.startDate.slice(0, 10) : newEvent.startDate,
        endDate: newEvent.isAllDay ? newEvent.endDate.slice(0, 10) : newEvent.endDate,
    };
    
    try {
        const API_URL = process.env.REACT_APP_API_URL || '';
        const response = await fetch(`${API_URL}/spring/calendar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error("일정 저장에 실패했습니다.");
        
        setIsAddingEvent(false); // 폼 닫기
        await fetchEvents(activeDate); // 일정 목록 새로고침
    } catch (error) {
        console.error(error);
        alert(error);
    }
  };

  // 날짜 클릭 핸들러
  const handleDateClick = (date: Date) => {
    // 해당 날짜에 이벤트가 있는지 확인
    const hasEvents = events.some(event => {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      const clickedDate = new Date(date);
      clickedDate.setHours(0, 0, 0, 0);
      return clickedDate >= startDate && clickedDate <= endDate;
    });

    if (hasEvents) {
      setSelectedDate(date);
    }
  };
  
  const renderTileContent = ({ date, view }: { date: Date, view: string }) => {
    if (view !== 'month') return null;
    const dayEvents = events.filter(event => {
      const startDate = new Date(event.startDate); startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(event.endDate); endDate.setHours(0, 0, 0, 0);
      const currentDate = new Date(date); currentDate.setHours(0, 0, 0, 0);
      return currentDate >= startDate && currentDate <= endDate;
    });
    return (
      <>{dayEvents.slice(0, 2).map(event => (<EventHighlighter key={event.eventId} color={getColorForTId(event.tId)} opacity={event.isAllDay ? 1 : 0.5} title={event.title}>{event.title}</EventHighlighter>))}</>
    );
  };

  // 선택된 날짜에 해당하는 이벤트들
  const selectedDayEvents = selectedDate ? events.filter(event => {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      const currentDate = new Date(selectedDate);
      currentDate.setHours(0, 0, 0, 0);
      return currentDate >= startDate && currentDate <= endDate;
  }) : [];

  if (!isOpen) {
    return null;
  }

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CalendarContainer>
          <CalendarWrapper>
            {loading && <div style={{ position: 'absolute', zIndex: 1, top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>로딩 중...</div>}
            <Calendar
              calendarType="gregory"
              formatDay={(locale, date) => date.getDate().toString()}
              tileClassName={({ date, view }) => (view === 'month' && date.getDay() === 6 ? 'saturday' : null)}
              onActiveStartDateChange={handleActiveStartDateChange}
              tileContent={renderTileContent}
              onClickDay={handleDateClick} // 날짜 클릭 이벤트 연결
            />
          </CalendarWrapper>
          <ButtonContainer>
            <ActionButton onClick={handleShowAddForm}>일정 추가</ActionButton>
            <CloseButton onClick={onClose}>닫기</CloseButton>
          </ButtonContainer>
        </CalendarContainer>

        <RightPanelContainer>
          {isAddingEvent ? (
            <>
              <DetailsHeader>새 일정 추가</DetailsHeader>
              <Form onSubmit={handleSaveEvent}>
                <FormGroup>
                  <label htmlFor="title">제목</label>
                  <input type="text" name="title" id="title" value={newEvent.title} onChange={handleNewEventChange} required />
                </FormGroup>
                <FormGroup>
                    <FormRow>
                        <label>하루 종일</label>
                        <SwitchLabel>
                            <SwitchInput type="checkbox" name="isAllDay" checked={newEvent.isAllDay} onChange={handleNewEventChange} />
                            <SwitchSlider />
                        </SwitchLabel>
                    </FormRow>
                </FormGroup>
                <FormGroup>
                  <label htmlFor="startDate">시작</label>
                  <input type={newEvent.isAllDay ? 'date' : 'datetime-local'} name="startDate" id="startDate" value={newEvent.isAllDay ? newEvent.startDate.slice(0,10) : newEvent.startDate} onChange={handleNewEventChange} />
                </FormGroup>
                <FormGroup>
                  <label htmlFor="endDate">종료</label>
                  <input type={newEvent.isAllDay ? 'date' : 'datetime-local'} name="endDate" id="endDate" value={newEvent.isAllDay ? newEvent.endDate.slice(0,10) : newEvent.endDate} onChange={handleNewEventChange} />
                </FormGroup>
                <FormGroup>
                  <label htmlFor="description">상세 설명</label>
                  <textarea name="description" id="description" rows={4} value={newEvent.description} onChange={handleNewEventChange}></textarea>
                </FormGroup>
                <ButtonContainer>
                  <ActionButton type="submit">저장</ActionButton>
                  <CloseButton type="button" onClick={() => setIsAddingEvent(false)}>취소</CloseButton>
                </ButtonContainer>
              </Form>
            </>
          ) : selectedDate && (
            <>
              <DetailsHeader>{selectedDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</DetailsHeader>
              {selectedDayEvents.length > 0 ? (
                selectedDayEvents.map(event => (
                  <EventDetailCard key={event.eventId}>
                    <h4>{event.title}</h4>
                    <p><strong>시간:</strong> {event.isAllDay ? '하루종일' : `${formatTime(event.startDate)} ~ ${formatTime(event.endDate)}`}</p>
                    <p><strong>상세:</strong><br />{event.description}</p>
                  </EventDetailCard>
                ))
              ) : <p>선택된 날짜에 일정이 없습니다.</p>}
            </>
          )}
        </RightPanelContainer>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CalendarModal;