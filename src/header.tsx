import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <HeaderContainer>
      <Logo onClick={() => navigate("/")}>BlankSync</Logo>
      <Nav>
        <NavItem onClick={() => navigate("/advice")}>홈페이지 설명</NavItem>
        <NavItem onClick={() => navigate("/create")}>팀 구성하기</NavItem>
        <NavItem onClick={() => navigate("/projectList")}>나의 프로젝트</NavItem>
      </Nav>
      <LoginLinks>
        <LinkItem onClick={() => navigate("/login")}>로그인</LinkItem> / 
        <LinkItem onClick={() => navigate("/signup")}> 회원가입</LinkItem>
      </LoginLinks>
    </HeaderContainer>
  );
};

export default Header;

// Styled Components
const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #e9dfff;
`;

const Logo = styled.h1`
  font-size: 24px;
  font-weight: bold;
  cursor: pointer; /* 추가: 클릭 가능한 커서 */
`;

const Nav = styled.nav`
  display: flex;
  gap: 20px;
`;

const NavItem = styled.span`
  cursor: pointer;
`;

const LoginLinks = styled.div`
  font-size: 14px;
`;

const LinkItem = styled.span`
  cursor: pointer;
`;
