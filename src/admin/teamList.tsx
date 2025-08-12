import React, { useState } from 'react';
import './css/teamList.css';
import Header from '../header';

// 팀 리스트 목업 데이터 (계층 구조)
const initialTeamData = [
  {
    id: 1,
    name: '팀 1',
    leader: '팀장명',
    members: [
      { id: 'm1-1', name: '팀원 A', role: '프론트엔드' },
      { id: 'm1-2', name: '팀원 B', role: '백엔드' },
    ],
  },
  {
    id: 2,
    name: '팀 2',
    leader: '팀장명',
    members: [
      { id: 'm2-1', name: '팀원 C', role: '디자이너' },
    ],
  },
  {
    id: 3,
    name: '팀 3',
    leader: '팀장명',
    members: [],
  },
  {
    id: 4,
    name: '팀 4',
    leader: '팀장명',
    members: [
      { id: 'm4-1', name: '팀원 D', role: 'PM' },
      { id: 'm4-2', name: '팀원 E', role: '기획' },
      { id: 'm4-3', name: '팀원 F', role: '서버' },
    ],
  },
  {
    id: 5,
    name: '팀 5',
    leader: '팀장명',
    members: [
      { id: 'm5-1', name: '팀원 1', role: '팀원' },
      { id: 'm5-2', name: '팀원 2', role: '팀원' },
    ],
  },
];

const TeamList = () => {
  // 현재 펼쳐진 팀의 ID를 저장하는 state
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // 토글 함수
  const handleToggle = (id: number) => {
    // 이미 열려있는 팀을 다시 클릭하면 닫고, 다른 팀을 클릭하면 그 팀을 연다.
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="admin-container">
      <Header />
        <div className="page-container">
        <h1 className="main-title">팀 관리 페이지</h1>

        <div className="list-container">
            <h2 className="list-title">팀 리스트</h2>

            {/* --- 테이블 헤더 --- */}
            <div className="list-header">
            <div>팀 아이디</div>
            <div>팀 이름</div>
            <div>팀장</div>
            <div></div> {/* 액션 버튼 공간 */}
            </div>

            {/* --- 테이블 바디 (팀 목록) --- */}
            <div className="list-body">
            {initialTeamData.map((team) => (
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

                {/* --- 펼쳐지는 상세 정보 섹션 --- */}
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