import React from 'react';
import styled from 'styled-components'; // styled-components import
import { FaCalendar } from 'react-icons/fa6'; // react-icons에서 아이콘 가져오기

// props 타입 정의 (변화 없음)
interface Props {
  onClick: () => void;
}

// styled-components를 사용해 버튼 스타일을 정의
// 'button' 태그에 스타일을 입힌 'FloatingButtonStyle'이라는 새 컴포넌트를 생성
const FloatingButtonStyle = styled.button`
  position: fixed; /* 화면 스크롤과 상관없이 항상 고정 */
  bottom: 30px;    /* 화면 아래에서 30px 위 */
  right: 30px;     /* 화면 오른쪽에서 30px 왼쪽 */
  z-index: 1000;   /* 다른 요소들보다 항상 위에 있도록 설정 */
  
  /* 버튼 기본 스타일 */
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #007bff;
  color: white;
  border: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s ease;

  /* &는 현재 컴포넌트(버튼) 자신을 의미 */
  &:hover {
    background-color: #0056b3;
  }
`;

const FloatingButton: React.FC<Props> = ({ onClick }) => {
  return (
    // 기존 <button className="..."> 대신 방금 만든 <FloatingButtonStyle> 사용
    <FloatingButtonStyle onClick={onClick}>
      <FaCalendar size={24} />
    </FloatingButtonStyle>
  );
};

export default FloatingButton;