import React from 'react';
import './css/memberList.css';
import Header from '../header';

// 회원 리스트 목업 데이터
const memberData = [
  { id: 1, name: '회원 1', password: '••••••••' },
  { id: 2, name: '회원 2', password: '••••••••' },
  { id: 3, name: '회원 3', password: '••••••••' },
  { id: 4, name: '회원 4', password: '••••••••' },
  { id: 5, name: '회원 5', password: '••••••••' },
];

const MemberList = () => {
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
            <div className="header-item"></div> {/* 수정/삭제 공간 */}
          </div>

          {/* --- 테이블 바디 (회원 목록) --- */}
          <div className="list-body">
            {memberData.map((member) => (
              <div key={member.id} className="list-row">
                <div className="row-item">{member.id}</div>
                <div className="row-item">{member.name}</div>
                <div className="row-item">{member.password}</div>
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