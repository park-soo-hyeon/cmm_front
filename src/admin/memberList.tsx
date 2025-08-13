import React, { useState, useEffect } from 'react';
import './css/memberList.css';
import Header from '../header';

// API 주소
const API_URL = process.env.REACT_APP_API_URL;

// --- 1. 서버에서 받아올 회원 데이터의 타입을 정의 ---
interface MemberInfo {
  uid: string;
  uname: string;
  upassword: string;
}

const MemberList = () => {
  // --- 2. State 선언 ---
  const [memberList, setMemberList] = useState<MemberInfo[]>([]); // 회원 목록을 저장할 state
  const [loading, setLoading] = useState(true); // 로딩 상태

  // --- 3. 서버에서 데이터를 가져오는 useEffect ---
  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/spring/api/admin/user`, {
          method: "POST",
          // 필요 시 headers, body 추가
        });

        if (!response.ok) {
          throw new Error('서버 응답에 실패했습니다.');
        }

        const data: MemberInfo[] = await response.json();
        setMemberList(data);

      } catch (error) {
        console.error("회원 목록을 가져오는 중 오류 발생:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []); // 컴포넌트가 처음 렌더링될 때 한 번만 실행

  // 로딩 중일 때 표시할 UI
  if (loading) {
    return (
      <div className="admin-container">
        <Header />
        <div className="member-page">
          <h1 className="main-title">회원 목록을 불러오는 중입니다...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <Header />
      <div className="member-page">
        <h1 className="main-title">회원 관리 페이지</h1>

        <div className="list-container">
          <h2 className="list-title">회원 리스트</h2>

          {/* --- 테이블 헤더 --- */}
          <div className="list-header">
            <div className="header-item">회원 아이디</div>
            <div className="header-item">회원 이름</div>
            <div className="header-item">비밀번호</div>
            <div className="header-item"></div>
          </div>

          {/* --- 테이블 바디 (회원 목록) --- */}
          <div className="list-body">
            {/* --- 4. 목업 데이터 대신 state의 memberList를 사용 --- */}
            {memberList.map((member) => (
              <div key={member.uid} className="list-row">
                {/* --- 5. 서버에서 받은 데이터로 UI 표시 --- */}
                <div className="row-item">{member.uid}</div>
                <div className="row-item">{member.uname}</div>
                <div className="row-item">••••••••</div>
                <div className="row-item">
                  <a href="#" className="action-link">수정/삭제</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberList;