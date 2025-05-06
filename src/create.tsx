import React, { useState } from "react";
import styled from "styled-components";
import Header from "./header";
import { useNavigate } from "react-router-dom"; // 추가

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Create: React.FC = () => {
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [teamName, setTeamName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleTeamNameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setTeamName(e.target.value);

  const handleMemberEmailChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setMemberEmail(e.target.value);

  const handleTeamNameConfirm = () => setModalStep(2);

  const handleEmailConfirm = () => {
    if (!EMAIL_REGEX.test(memberEmail)) {
      alert("이메일 형식을 지켜주세요!");
      return;
    }
    if (emails.length >= 3) {
      alert("팀원은 최대 3명까지 추가할 수 있습니다.");
      return;
    }
    setEmails([...emails, memberEmail]);
    setMemberEmail("");
  };

  const handleCreateTeam = () => {
    alert(`팀 "${teamName}"이(가) 생성되었습니다!`);
    navigate("/team"); // team.tsx로 이동 (라우팅 경로는 실제 라우터 설정에 맞게 조정)
  };

  const handleCloseModal = () => {
    navigate("/"); // app.tsx(홈)으로 이동
  };

  return (
    <Container>
      <Header />
      <Main>
        <ModalBackdrop>
          <ModalBox>
          <CloseButton onClick={handleCloseModal}>×</CloseButton>
            
            {modalStep === 1 ? (
              <>
                <ModalText>팀 구성하기</ModalText>
                <Input
                  type="text"
                  placeholder="팀 이름을 입력하세요"
                  value={teamName}
                  onChange={handleTeamNameChange}
                />
                <ConfirmButton
                  onClick={handleTeamNameConfirm}
                  disabled={!teamName.trim()}
                >
                  확인
                </ConfirmButton>
              </>
            ) : (
              <>
                <ModalText>팀원 추가</ModalText>
                <Input
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={memberEmail}
                  onChange={handleMemberEmailChange}
                  disabled={emails.length >= 3}
                />
                <ButtonRow>
                  <ConfirmButton
                    onClick={handleEmailConfirm}
                    disabled={
                      !memberEmail.trim() ||
                      emails.length >= 3
                    }
                  >
                    추가
                  </ConfirmButton>
                  <CreateButton
                    onClick={handleCreateTeam}
                    disabled={emails.length === 0}
                  >
                    생성
                  </CreateButton>
                </ButtonRow>
                <EmailList>
                  {emails.map((email, idx) => (
                    <EmailItem key={idx}>{email}</EmailItem>
                  ))}
                </EmailList>
                {emails.length >= 3 && (
                  <MaxNotice>팀원은 최대 3명까지 추가할 수 있습니다.</MaxNotice>
                )}
              </>
            )}
          </ModalBox>
        </ModalBackdrop>
      </Main>
    </Container>
  );
};

export default Create;

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

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalBox = styled.div`
  position: relative; /* 이 줄을 추가하세요! */
  background: #fff;
  padding: 32px 40px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 320px;
`;


const ModalText = styled.div`
  font-size: 1.3rem;
  margin-bottom: 16px;
`;

const Input = styled.input`
  width: 220px;
  padding: 8px 12px;
  margin-bottom: 20px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
`;

const ConfirmButton = styled.button`
  padding: 8px 24px;
  font-size: 1rem;
  background: #7c3aed;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 10px;
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const CreateButton = styled(ConfirmButton)`
  background: #22c55e;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

const EmailList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 10px 0 0 0;
  width: 100%;
`;

const EmailItem = styled.li`
  font-size: 1rem;
  padding: 2px 0;
  color: #444;
`;

const MaxNotice = styled.div`
  color: #ef4444;
  margin-top: 8px;
  font-size: 0.95rem;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  line-height: 1;

  &:hover {
    color: #333;
  }
`;