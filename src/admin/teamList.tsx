import React, { useState, useEffect } from 'react';
import './css/teamList.css';
import Header from '../header';

// API 주소
const API_URL = process.env.REACT_APP_API_URL;

// --- 1. 서버에서 받아올 데이터와 컴포넌트에서 사용할 데이터의 타입을 정의 ---

// 서버 응답 데이터의 타입
interface FetchedTeamInfo {
  tid: number;
  tname: string;
  uid: string; // 팀장 ID
}

// 팀원 정보 타입 (아코디언에서 사용)
interface TeamMember {
  id: string;
  name: string;
  role: string;
}

// 컴포넌트 내부에서 사용할 팀 데이터의 최종 형태
interface TeamData {
  id: number;
  name: string;
  leader: string;
  members: TeamMember[];
  membersLoaded: boolean; // 팀원 목록을 이미 불러왔는지 확인하는 플래그
}

const TeamList = () => {
  const [teamList, setTeamList] = useState<TeamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // 페이지 진입 시 전체 팀 목록을 불러오는 useEffect
  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/spring/api/admin/team`, {
          method: "POST",
        });

        if (!response.ok) throw new Error('서버 응답에 실패했습니다.');

        const data: FetchedTeamInfo[] = await response.json();

        const formattedData: TeamData[] = data.map(team => ({
          id: team.tid,
          name: team.tname,
          leader: team.uid,
          members: [],
          membersLoaded: false, // 초기값은 false
        }));

        setTeamList(formattedData);
      } catch (error) {
        console.error("팀 데이터를 가져오는 중 오류 발생:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  // --- 1. 토글 함수를 비동기 함수로 변경 ---
  const handleToggle = async (teamId: number) => {
    // 현재 클릭한 팀의 정보를 찾습니다.
    const targetTeam = teamList.find(t => t.id === teamId);
    if (!targetTeam) return;

    // 만약 이미 팀원 정보를 불러왔다면, 그냥 아코디언만 열고 닫습니다.
    if (targetTeam.membersLoaded) {
      setExpandedId(expandedId === teamId ? null : teamId);
      return;
    }

    // --- 2. 팀원 목록 API 호출 ---
    try {
      const response = await fetch(`${API_URL}/spring/api/admin/team/list`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tid: teamId }), // 서버에 팀 ID를 전달
      });

      if (!response.ok) throw new Error('팀원 목록을 불러오는데 실패했습니다.');
      
      // 서버가 text 형식으로 uid 목록을 보내준다고 가정 (e.g., "user1,user2,user3")
      const memberUidsText = await response.text();
      
      // 텍스트가 비어있지 않은 경우에만 처리
      const members: TeamMember[] = memberUidsText
        ? memberUidsText.split(',').map(uid => ({
            id: uid,
            name: uid,
            role: '팀원',
          }))
        : [];

      // --- 3. teamList 상태 업데이트 ---
      const updatedTeamList = teamList.map(team =>
        team.id === teamId
          ? { ...team, members: members, membersLoaded: true } // 멤버 정보와 로드 상태 업데이트
          : team
      );
      setTeamList(updatedTeamList);

      // 데이터 로딩 후 아코디언을 엽니다.
      setExpandedId(teamId);

    } catch (error) {
      console.error("팀원 목록을 가져오는 중 오류 발생:", error);
    }
  };

  // 로딩 중일 때 표시할 UI
  if (loading) {
    return (
      <div className="admin-container">
        <Header />
        <div className="page-container">
          <h1 className="main-title">팀 목록을 불러오는 중입니다...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <Header />
      <div className="page-container">
        <h1 className="main-title">팀 관리 페이지</h1>
        <div className="list-container">
          <h2 className="list-title">팀 리스트</h2>
          <div className="list-header">
            <div>팀 아이디</div>
            <div>팀 이름</div>
            <div>팀장</div>
            <div></div>
          </div>
          <div className="list-body">
            {teamList.map((team) => (
              <div key={team.id} className="team-item-container">
                <div className="team-row">
                  <div>{team.id}</div>
                  <div>{team.name}</div>
                  <div>{team.leader}</div>
                  <div className="actions">
                    <a href="#" className="action-link">수정/삭제</a>
                    <button onClick={() => handleToggle(team.id)} className={`toggle-button ${expandedId === team.id ? 'expanded' : ''}`}>
                      ▼
                    </button>
                  </div>
                </div>
                {expandedId === team.id && (
                  <div className="details-section">
                    {team.members.length > 0 ? (
                      <>
                        <div className="details-header">
                          <div>팀원명</div>
                          <div>역할</div>
                        </div>
                        {team.members.map((member) => (
                          <div key={member.id} className="details-row">
                            {/* --- 4. 서버에서 받은 데이터로 UI 표시 --- */}
                            <div>{member.name}</div>
                            <div>{member.role}</div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="no-members">소속된 팀원이 없습니다.</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamList;