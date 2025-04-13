import React from "react";
import styled from "styled-components";
import Header from "../header";

const Login: React.FC = () => {
  return (
    <Container>
      <Header />

      <Main>
        <Title>BlankSync</Title>
        <Subtitle>새로운 협업툴에 도전해보세요!</Subtitle>
        <InfoText>
          이용이 처음이신가요?{" "}
          <SignUpLink href="#">회원가입하러 가기</SignUpLink>
        </InfoText>

        <Form>
          <Input type="text" placeholder="아이디" />
          <Input type="password" placeholder="비밀번호" />
          <Button>로그인</Button>
        </Form>

        {/* HelpLinks 추가 */}
        <HelpLinks>
          <HelpLink href="#">아이디 찾기</HelpLink>
          <HelpLink href="#">비밀번호 찾기</HelpLink>
        </HelpLinks>
      </Main>
    </Container>
  );
};

export default Login;

// Styled Components
const Container = styled.div`
  font-family: Arial, sans-serif;
  background-color: #f6f0ff;
  color: #333;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Main = styled.main`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h2`
  font-size: 36px;
  font-weight: bold;
`;

const Subtitle = styled.p`
  font-size: 18px;
`;

const InfoText = styled.p`
  margin-top: -10px;
`;

const SignUpLink = styled.a`
  color: #6b5b95;
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Input = styled.input`
  width: 300px; /* 수정된 부분 */
  padding: 10px; /* 추가 */
  margin-bottom: 15px; /* 추가 */
  border-radius: 5px; /* 추가 */
`;

const Button = styled.button`
  width: 300px; /* 버튼 크기 지정 */
  padding: 10px; /* 버튼 내부 여백 */
  background-color: purple; /* 수정된 부분 */
  color: white; /* 텍스트 색상 */
  border-radius: 5px; /* 둥근 모서리 */
`;

// HelpLinks 스타일 정의
const HelpLinks = styled.div`
  margin-top: 20px; /* 상단 여백 추가 */
`;

const HelpLink = styled.a`
  margin-right: 10px; /* 링크 간격 추가 */
`;
