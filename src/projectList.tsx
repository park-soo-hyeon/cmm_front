import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

type TeamData = {
  tid: number;
  tname: string;
};

type MessageData = {
  tid: number;
  uid: string;
  tname: string;
  content: number; 
};


const ProjectList: React.FC = () => {
  const navigate = useNavigate();
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState<MessageData | null>(null);
  const [teams, setTeams] = useState<TeamData[]>([]);

  // 팀 목록 가져오기
  useEffect(() => {
    const fetchTeams = async () => {
      const userEmail = localStorage.getItem("userEmail");

      try {
        const response = await fetch(`${API_URL}/api/teams/list`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: userEmail }),
        });

        if (!response.ok) {
          throw new Error("팀 목록을 불러오는데 실패했습니다.");
        }

        const data: TeamData[] = await response.json();
        setTeams(data);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };

    fetchTeams();
  }, []);

  // 메시지 모달 열기
  const handleMailClick = async () => {
    // 현재 로그인한 회원 이메일(예시: localStorage)
    const userEmail = localStorage.getItem("userEmail");
    // 서버에 메시지 요청
    try {
      const response = await fetch(`${API_URL}/api/users/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: userEmail }),
      });
      const data: MessageData[] = await response.json();
      if (data.length > 0) {
        setMessage(data[0]);
      } else {
        setMessage(null);
        setShowMessage(true); // "메시지 없음"도 모달로 표시
      }
    } catch (e) {
      alert("메시지 불러오기에 실패했습니다.");
    }
  };

  // 메시지 모달 닫기
  const handleCloseMessage = () => setShowMessage(false);

  const handleChoice = async (choice: boolean) => {
    if (!message) return;
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/users/message/choice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tid: String(message.tid),
          uid: userEmail,
          choice: choice
        }),
      });
      const result: boolean = await response.json();
      if (result === true) {
        alert(choice ? "팀 초대를 수락하였습니다." : "팀 초대를 거절하였습니다.");
        setShowMessage(false);
      } else {
        alert("처리에 실패했습니다.");
      }
    } catch (e) {
      alert("서버와의 통신에 실패했습니다.");
    }
  };

  return (
    <Container>
      <HeaderBar>
        <Logo onClick={() => navigate("/")}>BlankSync</Logo>
        <RecentTitle>최근 프로젝트</RecentTitle>
        <CreateButton onClick={() => navigate("/create")}>생성하기 +</CreateButton>
      </HeaderBar>
      <Body>
        <Sidebar>
          <SidebarTitle>○○○님의 프로젝트</SidebarTitle>
          <SidebarList>
            {teams.length === 0 ? (
              <SidebarEmpty>팀이 없습니다.</SidebarEmpty>
            ) : (
              teams.map((team, i) => (
                <SidebarItem key={i}>{team.tname}</SidebarItem>
              ))
            )}
          </SidebarList>
          <SidebarFooter>
            <span>설정 / 프로젝트 삭제</span>
            <MailIconWrapper>
              <MailIcon onClick={handleMailClick} />
              {showMessage && (
                <MessageModal>
                  <CloseButton onClick={handleCloseMessage}>×</CloseButton>
                  {message ? (
                    <>
                      <MessageText>
                        {message.content === 1 ? (
                          <>
                            <b>{message.uid}</b>님이 <b>{message.tname}</b>에 회원님을 팀원으로 요청하였습니다.
                          </>
                        ) : (
                          <>
                            <b>{message.uid}</b>님이 <b>{message.tname}</b>에 팀원을 거절하였습니다.
                          </>
                      )}
                  </MessageText>
                  {message.content === 1 ? (
                    <ModalButtonRow>
                      <ModalButton accept onClick={() => handleChoice(true)}>
                        수락하기
                      </ModalButton>
                      <ModalButton onClick={() => handleChoice(false)}>거절하기</ModalButton>
                    </ModalButtonRow>
                  ) : (
                    <CloseButtonSmall onClick={handleCloseMessage}>×</CloseButtonSmall>
                  )}
                </>
              ) : (
                <NoMessage>받은 메시지가 없습니다.</NoMessage>
              )}
                </MessageModal>
              )}
            </MailIconWrapper>
          </SidebarFooter>
        </Sidebar>
        <MainArea>
         <ProjectGrid>
            {teams.length === 0 ? (
              <ProjectCard>
                <ProjectCardLabel>생성된 팀이 없습니다.</ProjectCardLabel>
              </ProjectCard>
            ) : (
              teams.map((team, i) => (
                <ProjectCard key={i}>
                  <ProjectCardLabel>{team.tname}</ProjectCardLabel>
                </ProjectCard>
              ))
            )}
          </ProjectGrid>
        </MainArea>
      </Body>
    </Container>
  );
};

export default ProjectList;

// Styled Components

const Container = styled.div`
  font-family: Arial, sans-serif;
  background-color: #f6f0ff;
  min-height: 100vh;
  width: 100vw;
  color: #333;
`;

const HeaderBar = styled.header`
  height: 64px;
  background: #ede6fa;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 36px 0 32px;
  border-bottom: 1px solid #e0d6f8;
`;

const Logo = styled.span`
  font-size: 2rem;
  font-weight: bold;
  font-style: italic;
  color: #444;
  cursor: pointer;
`;

const RecentTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 500;
  color: #444;
  margin-left: -120px; /* 중앙정렬 보정 */
`;

const CreateButton = styled.button`
  background: #f8f6ff;
  color: #444;
  border: none;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 500;
  padding: 10px 26px;
  margin-left: 16px;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(180, 150, 255, 0.06);
  &:hover {
    background: #e3d7fa;
  }
`;

const Body = styled.div`
  display: flex;
  height: calc(100vh - 64px);
`;

const Sidebar = styled.aside`
  width: 320px;
  background: #e6e0fa;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 32px 0 0 0;
`;

const SidebarTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  margin-left: 36px;
  margin-bottom: 18px;
`;

const SidebarList = styled.ul`
  list-style: none;
  padding: 0 0 0 36px;
  margin: 0;
  flex: 1;
`;

const SidebarItem = styled.li`
  font-size: 1.07rem;
  margin-bottom: 13px;
  font-weight: 400;
  color: #333;
`;

const SidebarFooter = styled.div`
  font-size: 0.98rem;
  color: #888;
  background: #e6e0fa;
  padding: 20px 24px 18px 36px;
  border-top: 1px solid #e0d6f8;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MailIconWrapper = styled.span`
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const MailIcon = (props: React.HTMLProps<HTMLSpanElement>) => (
  <span {...props}>
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="2.5" y="5" width="17" height="12" rx="2.5" stroke="#888" strokeWidth="2" />
      <path d="M4 7l7 5 7-5" stroke="#888" strokeWidth="2" fill="none" />
    </svg>
  </span>
);

// 메시지 모달 스타일
const MessageModal = styled.div`
  position: absolute;
  left: 30px;
  top: -10px;
  min-width: 280px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  padding: 20px 24px 18px 24px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 12px;
  background: none;
  border: none;
  font-size: 1.4rem;
  color: #888;
  cursor: pointer;
  &:hover {
    color: #333;
  }
`;

const CloseButtonSmall = styled.button`
  align-self: flex-end;
  background: none;
  border: none;
  font-size: 1.4rem;
  color: #888;
  cursor: pointer;
  margin-top: 10px;
  &:hover {
    color: #333;
  }
`;

const MessageText = styled.div`
  font-size: 1rem;
  margin-bottom: 20px;
  color: #333;
  line-height: 1.4;
`;

const ModalButtonRow = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  justify-content: flex-end;
`;

const ModalButton = styled.button<{ accept?: boolean }>`
  padding: 8px 20px;
  border-radius: 18px;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  background: ${(props) => (props.accept ? "#7c3aed" : "#eee")};
  color: ${(props) => (props.accept ? "#fff" : "#444")};
  cursor: pointer;
  &:hover {
    background: ${(props) => (props.accept ? "#6b21a8" : "#ddd")};
  }
`;

const NoMessage = styled.div`
  color: #888;
  font-size: 1rem;
  padding: 18px 0 8px 0;
`;

const MainArea = styled.main`
  flex: 1;
  background: #f6f0ff;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 46px 0 0 0;
`;

const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 320px);
  grid-template-rows: repeat(2, 160px);
  gap: 48px 36px;
`;

const ProjectCard = styled.div`
  background: #ece6fa;
  border-radius: 24px;
  border: 4px solid #d6cdf5;
  display: flex;
  align-items: flex-end;
  padding: 0 0 18px 0;
  min-height: 120px;
  min-width: 220px;
  box-shadow: 0 2px 8px rgba(180, 150, 255, 0.07);
`;

const ProjectCardLabel = styled.div`
  width: 100%;
  text-align: center;
  font-size: 1.1rem;
  font-weight: 400;
  color: #333;
`;

const SidebarEmpty = styled.div`
  color: #bbb;
  font-size: 1.05rem;
  margin-top: 12px;
  margin-bottom: 12px;
`;