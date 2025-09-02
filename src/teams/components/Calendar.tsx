import React, { useState } from 'react';
import {
  CalendarWrapper,
  CalendarHeader,
  NavButton,
  DaysGrid,
  DayName,
  DayCell,
  EventDot,
} from './Calendar.styles';

// 임시 일정 데이터
const MOCK_EVENTS = [
  { date: '2025-08-28', title: '주간 보고' },
  { date: '2025-09-05', title: '팀 회의' },
  { date: '2025-09-15', title: '프로젝트 마감일' },
  { date: '2025-09-16', title: '워크샵' },
  { date: '2025-09-22', title: '기획안 제출' },
];

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const changeMonth = (amount: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + amount);
      return newDate;
    });
  };

  const renderHeader = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    return (
      <CalendarHeader>
        <NavButton onClick={() => changeMonth(-1)}>&lt;</NavButton>
        <span>{`${year}년 ${month}월`}</span>
        <NavButton onClick={() => changeMonth(1)}>&gt;</NavButton>
      </CalendarHeader>
    );
  };

  const renderDays = () => {
    const today = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

    dayNames.forEach(name => days.push(<DayName key={name}>{name}</DayName>));

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const loopDate = new Date(year, month, day);
      const dateString = loopDate.toISOString().split('T')[0];
      const hasEvent = MOCK_EVENTS.some(event => event.date === dateString);
      const isToday =
        today.getFullYear() === year &&
        today.getMonth() === month &&
        today.getDate() === day;

      days.push(
        <DayCell key={day} $isToday={isToday}>
          {day}
          {hasEvent && <EventDot />}
        </DayCell>
      );
    }

    return <DaysGrid>{days}</DaysGrid>;
  };

  return (
    <CalendarWrapper>
      {renderHeader()}
      {renderDays()}
    </CalendarWrapper>
  );
};

export default Calendar;