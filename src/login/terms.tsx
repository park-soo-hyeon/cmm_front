import React from "react";
import styled from "styled-components";
import Header from "../header"; // 헤더 컴포넌트 가져오기
import { useNavigate } from "react-router-dom"; // React Router의 useNavigate 가져오기

const Terms: React.FC = () => {
  const navigate = useNavigate(); // useNavigate 훅 선언

  const handleAgreeClick = () => {
    navigate("/signup2"); // "/signup" 경로로 이동 (newMember.tsx가 렌더링됨)
  };

  return (
    <Container>
      <Header />

      <Main>
        <ContentBox>
          <Title>BlankSync 이용 약관</Title>
          <TermsList>
            <TermItem>다음 모든 항목에 동의합니다.</TermItem>
            <TermItem>본인은 만 <strong>14세 이상</strong>입니다.</TermItem>
            <TermItem>이용 약관에 동의합니다.</TermItem>
            <TermItem>
              (필수) 개인정보의 수집 및 사용에 동의합니다. (<a href="#">더보기</a>)
            </TermItem>
          </TermsList>
          <AgreeButton onClick={handleAgreeClick}>동의 및 계속하기</AgreeButton>
        </ContentBox>
      </Main>
    </Container>
  );
};

export default Terms;

// Styled Components
const Container = styled.div`
  font-family: Arial, sans-serif;
  background-color: #f6f0ff;
  color: #333;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Main = styled.main`
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ContentBox = styled.div`
  background-color: #e9dfff;
  padding: 40px;
  border-radius: 20px;
  width: 80%;
  max-width: 600px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
`;

const TermsList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const TermItem = styled.li`
  display: flex;
  align-items: center;
  background-color: #d8c8f4;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 20px;

  font-size: 16px; /* 텍스트 크기 */
`;

const AgreeButton = styled.button`
  width: 100%;
  padding: 15px;
  border-radius: 50px;
  border: none;
  background-color: #a78bfa;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 15px;
  &:hover {
    background-color: #9061f9;
  }
`;
