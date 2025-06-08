import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

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
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [showMessage, setShowMessage] = useState(false);
  const [teams, setTeams] = useState<TeamData[]>([]);
  const userEmail = localStorage.getItem("userEmail");
  const mailIconRef = useRef<HTMLSpanElement>(null);
  const [modalPos, setModalPos] = useState<{top: number, left: number}>({top: 0, left: 0});

  // 팀 목록 가져오기
  useEffect(() => {
    const fetchTeams = async () => {
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
    // 서버에 메시지 요청
    try {
      const response = await fetch(`${API_URL}/api/users/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: userEmail }),
      });
      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }
      const data: MessageData[] = await response.json();
      setMessages(data);
      setShowMessage(true);
    } catch (e) {
      alert("메시지 불러오기에 실패했습니다.");
    }

    setShowMessage(true);
  };

  // 메시지 모달 닫기
  const handleCloseMessage = () => setShowMessage(false);

  const handleChoice = async (choice: boolean, message: MessageData) => {
    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) {
      alert("로그인이 필요합니다.");
      return;
    }
    // 값 체크
    if (typeof message.tid !== 'number' || !userEmail) {
      alert("잘못된 요청입니다.");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/users/message/choice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          tid: message.tid,
          uid: userEmail,
          choice: choice
        }),
      });
      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }
      const result: boolean = await response.json();
      if (result === true) {
        alert(choice ? "팀 초대를 수락하였습니다." : "팀 초대를 거절하였습니다.");
        setMessages(msgs => msgs.filter(msg => msg !== message));
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
          <SidebarTitle>
            {userEmail ? `${userEmail}님의 프로젝트` : "○○○님의 프로젝트"}
          </SidebarTitle>
          <SidebarList>
            {teams.length === 0 ? (
              <SidebarEmpty>팀이 없습니다.</SidebarEmpty>
            ) : (
              teams.map((team, i) => (
                <SidebarItem
                  key={i}
                  onClick={() =>
                    navigate("/team", {
                      state: {
                        userId: userEmail,
                        teamId: team.tid,
                      },
                    })
                  }
                >
                  {team.tname}
                </SidebarItem>
              ))
            )}
          </SidebarList>
          <SidebarFooter>
            <span>설정 / 프로젝트 삭제</span>
            <MailIconWrapper ref={mailIconRef}>
              <MailIcon onClick={handleMailClick} />
            </MailIconWrapper>
          </SidebarFooter>

          {showMessage && (
            <MessagePanel>
              <MessagePanelHeader>
                <MessagePanelTitle>수신함</MessagePanelTitle>
                <CloseButton onClick={handleCloseMessage}>×</CloseButton>
              </MessagePanelHeader>
              <MessagePanelBody>
                {messages.length === 0 ? (
                  <NoMessage>받은 메시지가 없습니다.</NoMessage>
                ) : (
                  messages.map((message, idx) => (
                    <MessageItem key={idx}>
                      <div>
                        {message.content === 1 ? (
                          <>
                            <b>{message.uid}</b>님이 <b>{message.tname}</b>에 회원님을 팀원으로 요청하였습니다.
                          </>
                        ) : (
                          <>
                            <b>{message.uid}</b>님이 <b>{message.tname}</b>에 팀원을 거절하였습니다.
                          </>
                        )}
                      </div>
                      <MessageMeta>
                        {/* 날짜, 시간 등 추가 가능 */}
                        {/* 예: 2024.05.26 */}
                      </MessageMeta>
                      {message.content === 1 && (
                        <ModalButtonRow>
                          <ModalButton $accept onClick={() => handleChoice(true, message)}>
                            수락하기
                          </ModalButton>
                          <ModalButton onClick={() => handleChoice(false, message)}>
                            거절하기
                          </ModalButton>
                        </ModalButtonRow>
                      )}
                    </MessageItem>
                  ))
                )}
              </MessagePanelBody>
            </MessagePanel>
          )}

        </Sidebar>
        <MainArea>
          {teams.length === 0 ? (
            <NoTeamsText>생성된 팀이 없습니다.</NoTeamsText>
          ) : (
            <ProjectGrid>
              {teams.map((team, i) => (
                <ProjectCard
                  key={i}
                  onClick={() =>
                    navigate("/team", {
                      state: {
                        userId: userEmail,
                        teamId: team.tid,
                      },
                    })
                  }
                >
                  <ProjectCardImage src="image/listImage.jpg" alt={team.tname} />
                  <ProjectCardLabel>{team.tname}</ProjectCardLabel>
                </ProjectCard>
              ))}
            </ProjectGrid>
          )}
        </MainArea>
      </Body>
    </Container>
  );
};

export default ProjectList;

const COLOR = {
  bg: "#EDE9F2",
  card: "#F2F2F2",
  accent: "#B8B6F2",
  accentDark: "#545159",
  text: "#3B3740",
  subText: "#A19FA6",
  logo: "#C6C4F2",
  imgBg: "#D1D0F2",
  imgShadow: "#CEDEF2",
  border: "#E3DCF2",
};

const Container = styled.div`
  font-family: 'Pretendard', sans-serif;
  background-color: ${COLOR.bg};
  color: ${COLOR.text};
  min-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const HeaderBar = styled.header`
  width: 100%;
  background: ${COLOR.card};
  border-bottom: 1.5px solid ${COLOR.border};
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 48px;
  height: 64px;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const Logo = styled.h1`
  font-size: 24px;
  font-weight: 800;
  color: ${COLOR.logo};
  letter-spacing: 1.5px;
  cursor: pointer;
  margin: 0;
  transition: color 0.18s;
  &:hover {
    color: ${COLOR.accent};
  }
`;

const RecentTitle = styled.div`
  font-size: 1.18rem;
  font-weight: 600;
  color: ${COLOR.text};
  text-align: center;
  flex: 1 1 auto;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CreateButton = styled.button`
  background: ${COLOR.accent};
  color: ${COLOR.card};
  border: none;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 600;
  padding: 10px 26px;
  margin-left: 16px;
  box-shadow: 0 1px 4px ${COLOR.imgShadow};
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  &:hover {
    background: ${COLOR.accentDark};
    color: ${COLOR.card};
  }
`;

const Body = styled.div`
  display: flex;
  flex: 1 1 0;
  height: 100%;
  gap: 0;
  align-items: stretch;
  overflow: hidden;
`;

const Sidebar = styled.aside`
  width: 280px;
  min-width: 180px;
  background: ${COLOR.card};
  border-right: 1.5px solid ${COLOR.border};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 32px 0 0 0;
  overflow: hidden;
`;

const SidebarTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${COLOR.accentDark};
  margin-left: 36px;
  margin-bottom: 18px;
`;

const SidebarList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
`;

const SidebarItem = styled.li`
  font-size: 1rem;
  margin-bottom: 13px;
  font-weight: 400;
  color: ${COLOR.text};
  padding: 8px 24px;
  border-radius: 8px;
  margin-left: 12px;
  margin-right: 12px;
  transition: background 0.18s;
  box-sizing: border-box;
  &:hover {
    background: ${COLOR.imgBg};
  }
`;

const SidebarFooter = styled.div`
  font-size: 0.95rem;
  color: ${COLOR.subText};
  background: ${COLOR.card};
  padding: 20px 24px 18px 36px;
  border-top: 1.5px solid ${COLOR.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MailIconWrapper = styled.span`
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.18s;
  &:hover {
    background: ${COLOR.imgBg};
  }
`;

const MailIcon = (props: React.HTMLProps<HTMLSpanElement>) => (
  <span {...props}>
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="2.5" y="5" width="17" height="12" rx="2.5" stroke={COLOR.accentDark} strokeWidth="1.5" />
      <path d="M4 7l7 5 7-5" stroke={COLOR.accentDark} strokeWidth="1.5" fill="none" />
    </svg>
  </span>
);

// 메시지 모달 스타일
const MessagePanel = styled.div`
  position: fixed;
  top: 0;
  left: 280px; // Sidebar width와 정확히 맞추기
  height: 100vh;
  width: 360px;
  background: ${COLOR.card};
  border-left: 2.5px solid ${COLOR.border};
  box-shadow: 4px 0 24px 0 ${COLOR.imgShadow};
  z-index: 3000;
  display: flex;
  flex-direction: column;
`;

const MessagePanelHeader = styled.div`
  width: 100%;
  background: ${COLOR.card};
  border-bottom: 1.5px solid ${COLOR.border};
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 48px;
  height: 64px;
`;

const MessagePanelTitle = styled.div`
  font-size: 1.18rem;
  font-weight: 700;
  color: ${COLOR.text};
  letter-spacing: 0.5px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: ${COLOR.subText};
  cursor: pointer;
  &:hover {
    color: ${COLOR.accentDark};
  }
`;

const MessagePanelBody = styled.div`
  flex: 1 1 0;
  overflow-y: auto;
  padding: 18px 28px 18px 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const MessageItem = styled.div`
  background: ${COLOR.bg};
  border-radius: 10px;
  padding: 16px 18px;
  box-shadow: 0 1px 6px ${COLOR.imgShadow};
  font-size: 1rem;
  color: ${COLOR.text};
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MessageMeta = styled.div`
  font-size: 0.92rem;
  color: ${COLOR.subText};
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ModalButtonRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const ModalButton = styled.button<{ $accept?: boolean }>`
  padding: 7px 18px;
  border-radius: 16px;
  border: none;
  font-size: 0.98rem;
  font-weight: 500;
  background: ${(props) => (props.$accept ? COLOR.accent : COLOR.imgBg)};
  color: ${(props) => (props.$accept ? COLOR.card : COLOR.text)};
  cursor: pointer;
  transition: background 0.18s;
  &:hover {
    background: ${(props) => (props.$accept ? COLOR.accentDark : COLOR.border)};
  }
`;

const NoMessage = styled.div`
  color: ${COLOR.subText};
  font-size: 1.05rem;
  text-align: center;
  margin-top: 40px;
`;

const MainArea = styled.main`
  flex: 1 1 0;
  background: ${COLOR.bg};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 32px;
  min-width: 0;
  min-height: 0;
  overflow: auto;
`;

const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
  width: 100%;
`;

const ProjectCardImage = styled.img`
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: contain;
  background: ${COLOR.imgBg};
  border-radius: 12px 12px 0 0;
  display: block;
`;



const ProjectCardLabel = styled.div`
  width: 100%;
  font-size: 1.1rem;
  font-weight: 500;
  color: ${COLOR.text};
  margin-top: 12px;
  text-align: center;
  padding: 0 8px 16px 8px;
`;

const ProjectCard = styled.div`
  background: ${COLOR.card};
  border-radius: 12px;
  border: 1.5px solid ${COLOR.border};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 0;
  min-height: 200px;
  box-shadow: 0 2px 8px ${COLOR.imgShadow};
  transition: box-shadow 0.18s, transform 0.18s;
  cursor: pointer;
  &:hover {
    box-shadow: 0 4px 12px ${COLOR.imgShadow};
    transform: translateY(-2px);
  }
`;

const NoTeamsText = styled.div`
  color: ${COLOR.subText};
  font-size: 1.15rem;
  padding: 60px 0 0 0;
  text-align: center;
  width: 100%;
`;

const SidebarEmpty = styled.div`
  color: ${COLOR.subText};
  font-size: 1.05rem;
  margin-top: 12px;
  margin-bottom: 12px;
`;