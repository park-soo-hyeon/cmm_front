import React from 'react';
import styled from 'styled-components'; // styled-components import

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
  
  svg {
    width: 24px;
    height: 24px;
    stroke: currentColor; // 버튼의 color 값을 따라갑니다.
  }
`;

const FloatingButton: React.FC<Props> = ({ onClick }) => {
  return (
    // 기존 <button className="..."> 대신 방금 만든 <FloatingButtonStyle> 사용
    <FloatingButtonStyle onClick={onClick}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z" />
      </svg>
    </FloatingButtonStyle>
  );
};

export default FloatingButton;