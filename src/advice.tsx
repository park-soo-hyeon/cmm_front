import React from "react";
import styled from "styled-components";
import Header from "./header";
import { useNavigate } from "react-router-dom";

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

const Advice: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Header />
      <Main>
        <CenterBox>
          <Logo>BlankSync</Logo>
          <Title>실시간 협업, 새로운 기준</Title>
          <Subtitle>
            팀원들과 함께 아이디어를 공유하고<br />
            실시간으로 프로젝트를 관리하세요.<br />
            <span>BlankSync</span>는 쉽고 빠른 협업을 위한 올인원 플랫폼입니다.
          </Subtitle>
          <ActionRow>
            <AccentButton onClick={() => navigate("/")}>메인으로</AccentButton>
            <AccentButton onClick={() => navigate("/signup")}>회원가입</AccentButton>
          </ActionRow>
        </CenterBox>

        <FeatureArea>
          <FeatureCard>
            <FeatureTitle>실시간 동기화</FeatureTitle>
            <FeatureDesc>
              모든 팀원이 동시에 작업해도<br />
              실시간으로 변경사항이 반영됩니다.
            </FeatureDesc>
          </FeatureCard>
          <FeatureCard>
            <FeatureTitle>간편한 팀 관리</FeatureTitle>
            <FeatureDesc>
              팀 생성, 멤버 초대, 권한 관리까지<br />
              쉽고 빠르게 처리할 수 있습니다.
            </FeatureDesc>
          </FeatureCard>
          <FeatureCard>
            <FeatureTitle>다양한 협업 도구</FeatureTitle>
            <FeatureDesc>
              채팅, 파일공유, 일정관리 등<br />
              협업에 필요한 모든 기능을 제공합니다.
            </FeatureDesc>
          </FeatureCard>
        </FeatureArea>
      </Main>
    </Container>
  );
};

export default Advice;

const Container = styled.div`
  min-height: 100vh;
  background: ${COLOR.bg};
  color: ${COLOR.text};
  display: flex;
  flex-direction: column;
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 48px 0 0 0;
`;

const CenterBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 48px;
`;

const Logo = styled.div`
  font-size: 22px;
  font-weight: 800;
  color: ${COLOR.logo};
  margin-bottom: 16px;
  letter-spacing: 1.2px;
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 800;
  color: ${COLOR.text};
  margin-bottom: 14px;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: ${COLOR.subText};
  margin-bottom: 28px;
  text-align: center;
  line-height: 1.5;
  span {
    color: ${COLOR.accent};
    font-weight: 700;
  }
`;

const ActionRow = styled.div`
  display: flex;
  gap: 18px;
  margin-bottom: 8px;
`;

const AccentButton = styled.button`
  background: ${COLOR.accent};
  color: ${COLOR.text};
  border: none;
  border-radius: 8px;
  padding: 13px 32px;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 12px ${COLOR.imgShadow};
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: ${COLOR.accentDark};
    color: ${COLOR.card};
  }
`;

const FeatureArea = styled.div`
  display: flex;
  gap: 32px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 16px;
`;

const FeatureCard = styled.div`
  background: ${COLOR.card};
  border-radius: 16px;
  box-shadow: 0 4px 16px ${COLOR.imgShadow};
  border: 1.5px solid ${COLOR.border};
  min-width: 220px;
  max-width: 260px;
  padding: 32px 24px 24px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FeatureTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: ${COLOR.text};
  margin-bottom: 10px;
`;

const FeatureDesc = styled.p`
  font-size: 15px;
  color: ${COLOR.subText};
  text-align: center;
  line-height: 1.5;
`;
