import React, { useState, useRef } from "react";
import styled from "styled-components";
import Header from "../header";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

// 파일 상단에 추가
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const NewMember: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다!");
      setPassword("");
      setConfirmPassword("");
      passwordRef.current?.focus();
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          uid: email,
          uname: name,
          upassword: password
        })
      });
      const result = await response.json(); // true or false가 반환된다고 가정
      if (result === true) {
        alert("회원가입이 완료되었습니다!");
        // 회원가입 성공 후 이동할 페이지가 있다면 여기에 추가
        navigate("/login");
      } else {
        alert("회원가입에 실패했습니다. 이미 등록된 이메일일 수 있습니다.");
      }
    } catch (error) {
      alert("서버와의 통신에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const checkDuplicate = async () => {
    // 이메일 형식 검증
    if (!EMAIL_REGEX.test(email)) {
      alert("이메일 형식이 올바르지 않습니다.");
      return;
    }
  
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({ id: email }).toString();
      const response = await fetch(`${API_URL}/api/users/check-id?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      const result = await response.json(); // 서버에서 boolean 반환
      if (result === false) {
        alert("사용 가능한 이메일입니다.");
      } else {
        alert("이미 사용 중인 이메일입니다.");
      }
    } catch (error) {
      alert("서버와의 통신에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };
  
  // 중복 확인 버튼에 loading 상태 추가
  <DuplicateCheckButton 
    type="button" 
    onClick={checkDuplicate}
    disabled={loading}
  >
    {loading ? "확인 중..." : "중복확인"}
  </DuplicateCheckButton>

  return (
    <Container>
      <Header />

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
              required
            />
          </InputWrapper>

          <InputWrapper>
            <Input 
              type="email" 
              placeholder="아이디(메일주소)" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              ref={passwordRef}
              required
            />
          </InputWrapper>

          <InputWrapper>
            <Input 
              type="password" 
              placeholder="비밀번호 확인" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </InputWrapper>

          <SignUpButton type="submit" disabled={loading}>
            {loading ? "회원가입 중..." : "회원가입"}
          </SignUpButton>
        </Form>
      </Main>
    </Container>
  );
};

export default NewMember;

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
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
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
