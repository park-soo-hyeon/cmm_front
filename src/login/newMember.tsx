import React, { useState } from "react";
import styled from "styled-components";
import Header from "../header";

const NewMember: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 회원가입 로직 구현
    console.log("회원가입 정보:", { name, email, password, confirmPassword });
  };

  const checkDuplicate = () => {
    // 아이디 중복 확인 로직
    alert("아이디 중복 확인 기능");
  };

  return (
    <Container>
      <Header>
        <Logo>BlankSync</Logo>
        <Nav>
          <NavItem>홈페이지 설명</NavItem>
          <NavItem>팀 구성하기</NavItem>
          <NavItem>나의 프로젝트</NavItem>
        </Nav>
        <LoginLinks>
          <LinkItem>로그인</LinkItem> / <LinkItem>회원가입</LinkItem>
        </LoginLinks>
      </Header>

      <Main>
        <Title>BlankSync</Title>
        <SubTitle>회원가입하기</SubTitle>

        <Form onSubmit={handleSubmit}>
          <InputWrapper>
            <Input 
              type="text" 
              placeholder="이름" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </InputWrapper>

          <InputWrapper>
            <Input 
              type="email" 
              placeholder="아이디(메일주소)" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <DuplicateCheckButton type="button" onClick={checkDuplicate}>
              중복확인
            </DuplicateCheckButton>
          </InputWrapper>

          <InputWrapper>
            <Input 
              type="password" 
              placeholder="비밀번호" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </InputWrapper>

          <InputWrapper>
            <Input 
              type="password" 
              placeholder="비밀번호 확인" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </InputWrapper>

          <SignUpButton type="submit">회원가입</SignUpButton>
        </Form>
      </Main>
    </Container>
  );
};

export default NewMember;

// Styled Components
const Container = styled.div`
  font-family: Arial, sans-serif;
  background-color: #f6f0ff;
  color: #333;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #e9dfff;
`;

const Logo = styled.h1`
  font-size: 24px;
  font-weight: bold;
`;

const Nav = styled.nav`
  display: flex;
  gap: 20px;
`;

const NavItem = styled.span`
  cursor: pointer;
`;

const LoginLinks = styled.div`
  font-size: 14px;
`;

const LinkItem = styled.span`
  cursor: pointer;
`;

const Main = styled.main`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const Title = styled.h2`
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const SubTitle = styled.h3`
  font-size: 24px;
  margin-bottom: 30px;
`;

const Form = styled.form`
  width: 100%;
  max-width: 450px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const InputWrapper = styled.div`
  display: flex;
  width: 100%;
  position: relative;
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

const DuplicateCheckButton = styled.button`
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #a78bfa;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
`;

const SignUpButton = styled.button`
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
