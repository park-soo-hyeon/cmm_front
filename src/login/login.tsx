import React, { useState } from "react";
import styled from "styled-components";
import Header from "../header";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [uid, setUid] = useState("");
  const [upassword, setUpassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ uid, upassword })
      });
      const result = await response.json(); // true or false가 반환된다고 가정
      if (result === true) {
        alert("로그인 성공!");
        navigate("/");
        // navigate("/dashboard"); // 로그인 성공 시 이동할 페이지로 라우팅
      } else {
        alert("아이디 또는 비밀번호가 올바르지 않습니다.");
      }
    } catch (error) {
      alert("서버와의 통신에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header />

      <Main>
        <Title>BlankSync</Title>
        <Subtitle>새로운 협업툴에 도전해보세요!</Subtitle>
        <InfoText>
          이용이 처음이신가요?{" "}
          <SignUpLink onClick={() => navigate("/signup")}>회원가입하러 가기</SignUpLink>
        </InfoText>

        <Form onSubmit={handleLogin}>
          <InputWrapper>
            <Input
              type="text"
              placeholder="아이디"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              required
            />
          </InputWrapper>
          <InputWrapper>
            <Input
              type="password"
              placeholder="비밀번호"
              value={upassword}
              onChange={(e) => setUpassword(e.target.value)}
              required
            />
          </InputWrapper>
          <Button type="submit" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </Button>
        </Form>

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

const InputWrapper = styled.div`
  display: flex;
  width: 100%;
  position: relative;
`;

const SignUpLink = styled.a`
  color: #6b5b95;
  cursor: pointer;
`;

const Form = styled.div`
  width: 100%;
  max-width: 450px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Input = styled.input`
  width: 100%;
  padding: 15px;
  border-radius: 50px;
  border: none;
  background-color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  outline: none;
`;

const Button = styled.button`
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

// HelpLinks 스타일 정의
const HelpLinks = styled.div`
  margin-top: 20px; /* 상단 여백 추가 */
`;

const HelpLink = styled.a`
  margin-right: 10px; /* 링크 간격 추가 */
`;
