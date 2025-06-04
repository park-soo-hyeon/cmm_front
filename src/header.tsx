import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();

  return (
    <HeaderContainer>
      <Logo onClick={() => navigate("/")}>BlankSync</Logo>
      <Nav>
        <NavItem onClick={() => navigate("/advice")}>홈페이지 설명</NavItem>
        <NavItem onClick={() => navigate("/create")}>팀 구성하기</NavItem>
        <NavItem onClick={() => navigate("/projectList")}>나의 프로젝트</NavItem>
      </Nav>
      <LoginLinks>
        {isLoggedIn ? (
          <>
            <LinkItem onClick={() => navigate("/mypage")}>마이페이지</LinkItem>
            <span style={{ color: COLOR.border }}>/</span>
            <LinkItem onClick={() => { logout(); navigate("/"); }}>로그아웃</LinkItem>
          </>
        ) : (
          <>
            <LinkItem onClick={() => navigate("/login")}>로그인</LinkItem>
            <span style={{ color: COLOR.border }}>/</span>
            <LinkItem onClick={() => navigate("/signup")}>회원가입</LinkItem>
          </>
        )}
      </LoginLinks>
    </HeaderContainer>
  );
};

export default Header;

const COLOR = {
  bg: "#EDE9F2",        // 전체 배경
  card: "#F2F2F2",      // 카드/박스 배경
  accent: "#B8B6F2",    // 주요 버튼/포인트
  accentDark: "#545159",// 버튼 hover 등
  text: "#3B3740",      // 기본 텍스트
  subText: "#A19FA6",   // 서브 텍스트
  logo: "#C6C4F2",      // 로고/포인트
  imgBg: "#D1D0F2",     // 이미지 영역 배경
  imgShadow: "#CEDEF2", // 이미지 그림자
  border: "#E3DCF2",    // 경계선/구분선
};

const HeaderContainer = styled.header`
  width: 100%;
  min-width: 0;
  background: ${COLOR.card};
  border-bottom: 1.5px solid ${COLOR.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 48px;
  height: 64px;
  box-sizing: border-box;
  position: sticky;
  top: 0;
  z-index: 10;

  @media (max-width: 900px) {
    padding: 0 18px;
    height: 56px;
  }
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

const Nav = styled.nav`
  display: flex;
  gap: 28px;
  @media (max-width: 700px) {
    gap: 14px;
  }
`;

const NavItem = styled.span`
  font-size: 16px;
  color: ${COLOR.text};
  font-weight: 500;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 6px;
  transition: background 0.18s, color 0.18s;
  &:hover {
    background: ${COLOR.accent};
    color: ${COLOR.card};
  }
`;

const LoginLinks = styled.div`
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${COLOR.subText};
`;

const LinkItem = styled.span`
  cursor: pointer;
  color: ${COLOR.accentDark};
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 6px;
  transition: background 0.18s, color 0.18s;
  &:hover {
    background: ${COLOR.accent};
    color: ${COLOR.card};
  }
`;

