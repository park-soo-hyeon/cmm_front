import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import Header from "./header";
import { useLocation, useNavigate } from "react-router-dom";

// --- API 연동을 위한 타입 정의 ---
type TeamMember = {
  uid: string;
  role: string;
};

// --- API URL ---
const API_URL = process.env.REACT_APP_API_URL;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// --- 요청하신 새 컬러 팔레트 ---
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

// --- 그래프 및 포인트 컬러 (기존 색상 유지) ---
const GRAPH_COLOR = {
    bar: "#8683E0",
    donut: "#8683E0",
    line: "#FA5252",
    danger: "#FA5252"
}

const Leader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { teamId } = location.state || {}; // ProjectList에서 넘겨받은 teamId

  // --- 상태 관리 (Mock Data 제거) ---
  const [teamName, setTeamName] = useState<string>("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState(["2025년 3분기 신제품 기획", "하반기 마케팅 전략", "사용자 피드백 분석"]); // 프로젝트는 아직 Mock 데이터 유지
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- 모달 관련 상태 추가 ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState(""); // 모달 내 이메일 입력
  const [newlyInvitedEmails, setNewlyInvitedEmails] = useState<string[]>([]); // 모달 내에서 추가된 이메일 목록
  const [isAddingMember, setIsAddingMember] = useState(false); // 팀원 추가 API 호출 로딩 상태


  // '팀원' 역할만 필터링
  const regularMembers = teamMembers.filter(member => member.role === '팀원');

  // --- 데이터 연동 함수 (useCallback으로 감싸 재사용) ---
  const fetchLeaderData = useCallback(async () => {
        if (!teamId) {
            setError("잘못된 접근입니다. 팀 ID가 없습니다.");
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(`${API_URL}/spring/api/teams/page`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tid: teamId }),
            });
            if (!response.ok) throw new Error("팀 정보를 불러오는데 실패했습니다.");
            const data = await response.json();
            setTeamName(data.tname);
            setTeamMembers(data.members);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }    
    }, [teamId]);

  useEffect(() => {
    fetchLeaderData();
  }, [fetchLeaderData]);

  const handleDeleteMember = async (memberUid: string) => {
        if (window.confirm(`정말로 팀원 '${memberUid}'님을 삭제하시겠습니까?`)) {
        try {
            const response = await fetch(`${API_URL}/spring/api/teams/mem/delete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tid: teamId,      // 현재 팀 ID
                uid: memberUid,   // 삭제할 팀원의 ID
            }),
            });

            if (!response.ok) {
            throw new Error("팀원 삭제에 실패했습니다.");
            }

            // API 요청 성공 시, 화면(state)에서도 해당 팀원 제거
            setTeamMembers(prevMembers =>
            prevMembers.filter(member => member.uid !== memberUid)
            );
            alert("팀원이 성공적으로 삭제되었습니다.");

        } catch (err: any) {
            alert(err.message);
        }
        }
    };

    useEffect(() => {
    fetchLeaderData();
  }, [fetchLeaderData]);

  // --- 모달 열기/닫기 함수 ---
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setMemberEmail("");
    setNewlyInvitedEmails([]);
  };

  // --- 모달 내에서 팀원 추가하는 함수 ---
  const handleAddMember = async () => {
    const currentUserEmail = localStorage.getItem("userEmail");
    if (memberEmail === currentUserEmail) {
      alert("본인은 팀원으로 초대할 수 없습니다!");
      return;
    }
    if (!EMAIL_REGEX.test(memberEmail)) {
      alert("이메일 형식을 지켜주세요!");
      return;
    }
    if (newlyInvitedEmails.includes(memberEmail) || teamMembers.some(m => m.uid === memberEmail)) {
        alert("이미 추가되었거나 초대 요청된 이메일입니다.");
        return;
    }

    setIsAddingMember(true);
    try {
      const response = await fetch(`${API_URL}/spring/api/teams/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tid: teamId,
          uid: memberEmail,
          senduid: currentUserEmail,
        }),
      });
      const result = await response.json();
      if (result === true) {
        alert("팀원 요청 성공!");
        setNewlyInvitedEmails([...newlyInvitedEmails, memberEmail]);
        setMemberEmail("");
        await fetchLeaderData(); // 실시간 업데이트를 위해 팀 정보 다시 로드
      } else {
        alert("팀원 요청에 실패했습니다.");
      }
    } catch (error) {
      alert("서버와의 통신에 실패했습니다.");
    } finally {
      setIsAddingMember(false);
    }
  };

  // --- 모달 내에서 초대 목록을 삭제하는 함수 ---
  const handleDeleteInvitation = async (emailToDelete: string) => {
    setIsAddingMember(true); // 버튼 비활성화를 위해 로딩 상태 사용
    try {
      const response = await fetch(`${API_URL}/spring/api/teams/message/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tid: teamId,
          uid: emailToDelete,
        }),
      });

      if (!response.ok) {
        throw new Error("초대 취소에 실패했습니다.");
      }
      alert("팀원 초대가 취소되었습니다.");
      setNewlyInvitedEmails(prev => prev.filter(email => email !== emailToDelete));
      await fetchLeaderData(); // 메인 팀원 리스트도 갱신

    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (window.confirm(`정말로 '${teamName}' 팀을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      try {
        const response = await fetch(`${API_URL}/spring/api/teams/delete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tid: teamId }),
        });

        if (!response.ok) {
          throw new Error("팀 삭제에 실패했습니다.");
        }

        alert("팀이 성공적으로 삭제되었습니다.");
        navigate("/projectList"); // 삭제 후 프로젝트 목록 페이지로 이동

      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <Container>
      <Header />
      <MainContent>
        <PageHeader>
          {/* 받아온 tname으로 제목 표시 */}
          <PageTitle>{teamName}팀의 팀장페이지</PageTitle>
          <DeleteTeamLink as="button" onClick={handleDeleteTeam}>
            팀 삭제하기
          </DeleteTeamLink>
        </PageHeader>

        <TopSection>
          <Card>
            <CardTitle>팀원 리스트</CardTitle>
            {regularMembers.length > 0 ? (
              <List>
                {regularMembers.map((member) => (
                  <ListItem key={member.uid}>
                    <ItemText>{member.uid}</ItemText>
                    {/* --- SmallButton에 onClick 핸들러를 연결합니다 --- */}
                    <SmallButton onClick={() => handleDeleteMember(member.uid)}>
                      삭제
                    </SmallButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <EmptyListMessage>현재 팀에 팀원이 없습니다.</EmptyListMessage>
            )}
            <AddButton onClick={openModal}>팀원 추가하기</AddButton>
          </Card>
          <Card>
            <CardTitle>프로젝트 리스트</CardTitle>
            <List>
              {projects.map((project, index) => (
                <ListItem key={index}>
                  <ItemText>{project}</ItemText>
                  <SmallButton>삭제</SmallButton>
                </ListItem>
              ))}
            </List>
            <AddButton>프로젝트 추가하기</AddButton>
          </Card>
        </TopSection>

        {/* ... (하단 차트 섹션은 기존 코드와 동일) ... */}
        <BottomSection>
          <SectionTitle>팀원 참여도</SectionTitle>
          <ChartsGrid>
            <ChartCard>
              <CardTitle>팀원별 참여도</CardTitle>
              <BarChartContainer>
                <BarWrapper>
                    <Bar height="90%" />
                    <BarLabel>팀원1</BarLabel>
                </BarWrapper>
                <BarWrapper>
                    <Bar height="75%" />
                    <BarLabel>팀원2</BarLabel>
                </BarWrapper>
                 <BarWrapper>
                    <Bar height="60%" />
                    <BarLabel>팀원3</BarLabel>
                </BarWrapper>
                 <BarWrapper>
                    <Bar height="80%" />
                    <BarLabel>팀원4</BarLabel>
                </BarWrapper>
              </BarChartContainer>
            </ChartCard>
            <ChartCard>
              <CardTitle>팀원 전체 참여도</CardTitle>
              <DonutChartContainer>
                <DonutCircle />
                <DonutText>
                    <strong>80%</strong>
                    <span>달성</span>
                </DonutText>
              </DonutChartContainer>
            </ChartCard>
            <ChartCard>
              <CardTitle>회의 참석율</CardTitle>
              <LineChartContainer>
                 <svg width="100%" height="100%" viewBox="0 0 100 50">
                    <polyline fill="none" stroke={GRAPH_COLOR.line} strokeWidth="2" points="10,20 30,5 50,30 70,15 90,25" />
                 </svg>
              </LineChartContainer>
            </ChartCard>
          </ChartsGrid>
        </BottomSection>
      </MainContent>

      {/* --- 모달 UI 렌더링 --- */}
      {isModalOpen && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>팀원 초대</ModalTitle>
            <InputRow>
              <ModalInput
                type="email"
                placeholder="초대할 팀원의 이메일 입력"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                disabled={isAddingMember}
              />
              <ModalAddButton onClick={handleAddMember} disabled={!memberEmail.trim() || isAddingMember}>
                {isAddingMember ? "추가 중..." : "추가"}
              </ModalAddButton>
            </InputRow>
            <List>
              {newlyInvitedEmails.map((email, idx) => (
                <ListItem key={idx}>
                  <span>{email}</span>
                  <ModalDeleteButton onClick={() => handleDeleteInvitation(email)} disabled={isAddingMember}>
                    ×
                  </ModalDeleteButton>
                </ListItem>
              ))}
            </List>
            <ModalButtonRow>
                <ModalMainButton onClick={closeModal}>완료</ModalMainButton>
            </ModalButtonRow>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};
export default Leader;

// --- Styled Components (기존 코드와 동일) ---
const Container = styled.div`
  font-family: "Pretendard", Arial, sans-serif;
  background-color: ${COLOR.bg};
  color: ${COLOR.text};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;
// ... (이하 모든 styled-component 코드는 기존과 동일하게 유지)
const MainContent = styled.main`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  box-sizing: border-box;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-bottom: 2.5rem;
  padding: 1rem 0;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: ${COLOR.text};
`;

const DeleteTeamLink = styled.a`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: ${GRAPH_COLOR.danger};
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  
  &:hover {
    text-decoration: underline;
  }
`;

const TopSection = styled.section`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: ${COLOR.card};
  border-radius: 16px;
  padding: 1.5rem 2rem;
  box-shadow: 0 4px 12px ${COLOR.imgShadow};
  border: 1px solid ${COLOR.border};
  display: flex;
  flex-direction: column;
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${COLOR.text};
  margin-bottom: 1.5rem;
  text-align: center;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
`;

const ListItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${COLOR.imgBg};
  border-radius: 8px;
  padding: 0.8rem 1rem;
  margin-bottom: 0.8rem;
`;

const ItemText = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: ${COLOR.text};
`;

const SmallButton = styled.button`
  background: ${COLOR.card};
  color: ${COLOR.subText};
  border: 1px solid ${COLOR.border};
  border-radius: 6px;
  padding: 0.3rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${GRAPH_COLOR.danger};
    color: white;
    border-color: ${GRAPH_COLOR.danger};
  }
`;

const AddButton = styled.button`
  background: ${COLOR.card};
  color: ${COLOR.accentDark};
  border: 2px solid ${COLOR.border};
  border-radius: 8px;
  padding: 0.8rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.2s;

  &:hover {
    background: ${COLOR.accent};
    color: ${COLOR.card};
    border-color: ${COLOR.accent};
  }
`;

const BottomSection = styled.section`
  text-align: center;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  color: ${COLOR.text};
  margin-bottom: 2rem;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled(Card)`
  align-items: center;
  min-height: 300px;
`;

const BarChartContainer = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  width: 100%;
  height: 100%;
  padding: 0 1rem;
`;

const BarWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    justify-content: flex-end;
`;

const Bar = styled.div<{ height: string }>`
  width: 30px;
  background-color: ${GRAPH_COLOR.bar};
  border-radius: 4px 4px 0 0;
  height: ${props => props.height};
`;

const BarLabel = styled.span`
    margin-top: 0.5rem;
    font-size: 0.9rem;
    font-weight: 500;
    color: ${COLOR.subText};
`;

const DonutChartContainer = styled.div`
    position: relative;
    width: 150px;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const DonutCircle = styled.div`
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: conic-gradient(${GRAPH_COLOR.donut} 0% 80%, ${COLOR.border} 80% 100%);

    &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 120px;
        height: 120px;
        background: ${COLOR.card};
        border-radius: 50%;
    }
`;

const DonutText = styled.div`
    position: absolute;
    text-align: center;
    display: flex;
    flex-direction: column;

    strong {
        font-size: 2rem;
        font-weight: 700;
        color: ${COLOR.text};
    }
    span {
        font-size: 1rem;
        font-weight: 500;
        color: ${COLOR.subText};
    }
`;

const LineChartContainer = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const EmptyListMessage = styled.div`
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${COLOR.subText};
  font-size: 1rem;
  padding: 2rem 0;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${COLOR.card};
  border-radius: 18px;
  padding: 2rem;
  width: 100%;
  max-width: 450px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

const ModalTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${COLOR.text};
  margin-bottom: 1.5rem;
  text-align: center;
`;

const InputRow = styled.div`
  width: 100%;
  display: flex;
  gap: 8px;
  margin-bottom: 1rem;
  align-items: center;
`;

const ModalInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1.5px solid ${COLOR.border};
  background: #fff;
  font-size: 16px;
  color: ${COLOR.text};
  outline: none;
  transition: border 0.18s;
  &:focus {
    border: 1.5px solid ${COLOR.accent};
  }
`;

const ModalAddButton = styled.button`
  background: ${COLOR.accent};
  color: ${COLOR.card};
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  height: 51px;
  padding: 0 24px;
  white-space: nowrap;
  transition: background 0.18s;

  &:hover {
    background: ${COLOR.accentDark};
  }
  &:disabled {
    background: ${COLOR.imgBg};
    color: ${COLOR.subText};
    cursor: not-allowed;
  }
`;

const ModalButtonRow = styled.div`
  display: flex;
  justify-content: center; 
  margin-top: 1.5rem;
`;

const ModalMainButton = styled.button`
  background: ${COLOR.accent};
  color: ${COLOR.card};
  border: none;
  border-radius: 8px;
  padding: 12px 28px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: ${COLOR.accentDark};
  }
`;

const ModalDeleteButton = styled.button`
  background: none;
  border: none;
  color: ${GRAPH_COLOR.danger};
  font-size: 1.3rem;
  font-weight: bold;
  cursor: pointer;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  &:hover {
    background: #fbe9e9;
  }
  &:disabled {
    color: #ccc;
    cursor: not-allowed;
    background: none;
  }
`;