import React from "react";
import styled from "styled-components";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Login from "./login/login"; // login.tsx 파일 import
import Header from "./header"; // header.tsx 파일 import
import Terms from "./login/terms";
import NewMember from "./login/newMember";
import Create from "./create";
import Team from "./teams/team";
import ProjectList from "./projectList";
import Advice from "./advice";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import Mypage from "./mypage";
import LoginHandeler from "./login/loginHandeler";
import NaverLoginHandeler from "./login/naverLoginHandeler";



// 라우팅 없는 메인 컴포넌트
const MainComponent: React.FC = () => {

  
  
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleSignUpClick = () => {
    navigate("/signup");
  };

  const handleCreateClick = () => {
    navigate("/create");
  };

  const handleCreateTeam = () => {
    navigate("/main");
  };

  const handleListClick = () => {
    navigate("/projectList");
  }

  const handleAdviceClick = () => {
    navigate("/advice");
  }

  const handleMypageClick = () => {
    navigate("/mypage");
  }

  return (
    <Container>
      <Header />
      <ContentArea>
        <CenterBox>
          <Logo>BlankSync</Logo>
          <MainTitle>실시간 협업, 새로운 시작</MainTitle>
          <SubTitle>
            팀원들과 함께 아이디어를 공유하고, 실시간으로 협업하세요.<br />
            BlankSync가 새로운 협업의 기준이 됩니다.
          </SubTitle>
          <StartButton onClick={() => navigate("/projectList")}>
            시작하기
          </StartButton>
        </CenterBox>
        <ImageBox>
          <MainImage src="/image/mainImage.jpg" alt="협업 플랫폼 이미지" />
        </ImageBox>
      </ContentArea>
    </Container>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainComponent />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/kakao/callback" //redirect_url
            element={<LoginHandeler />} //당신이 redirect_url에 맞춰 꾸밀 컴포넌트
          />
          <Route path="/naver/callback" element={<NaverLoginHandeler />} />
          <Route path="/signup" element={<Terms />} />
          <Route path="/signup2" element={<NewMember />} />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <Create />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team"
            element={
              <ProtectedRoute>
                <Team />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projectList"
            element={
              <ProtectedRoute>
                <ProjectList />
              </ProtectedRoute>
            }
          />
          <Route path="/advice" element={<Advice />} />
          <Route path="/mypage" element={<Mypage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

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

const Container = styled.div`
  font-family: 'Pretendard', Arial, sans-serif;
  background: ${COLOR.bg};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 0 0 0;
  gap: 40px;
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 24px;
    padding: 32px 0 0 0;
  }
`;

const CenterBox = styled.div`
  flex: 1;
  min-width: 320px;
  max-width: 480px;
  background: ${COLOR.card};
  border-radius: 24px;
  box-shadow: 0 4px 24px ${COLOR.imgShadow};
  padding: 48px 40px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  margin-left: 6vw;
  border: 1.5px solid ${COLOR.border};
  @media (max-width: 900px) {
    margin-left: 0;
    align-items: center;
    text-align: center;
    padding: 32px 8vw;
  }
`;

const Logo = styled.div`
  font-size: 22px;
  font-weight: 800;
  color: ${COLOR.logo};
  margin-bottom: 18px;
  letter-spacing: 1.5px;
`;

const MainTitle = styled.h1`
  font-size: 44px;
  font-weight: 800;
  margin-bottom: 16px;
  color: ${COLOR.text};
  line-height: 1.2;
`;

const SubTitle = styled.p`
  font-size: 20px;
  color: ${COLOR.subText};
  margin-bottom: 36px;
  line-height: 1.6;
`;

const StartButton = styled.button`
  background: ${COLOR.accent};
  color: ${COLOR.text};
  border: none;
  border-radius: 8px;
  padding: 18px 48px;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 12px ${COLOR.imgShadow};
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: ${COLOR.accentDark};
    color: ${COLOR.card};
  }
`;

const ImageBox = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 배경, 테두리, 그림자, 패딩 모두 제거 */
  background: none;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
  @media (max-width: 900px) {
    width: 100%;
    margin: 0;
    padding: 0;
    border-radius: 0;
  }
`;

const MainImage = styled.img`
  width: 90%;
  max-width: 520px;
  min-width: 240px;
  border-radius: 20px;
  object-fit: cover;
  /* 아래 두 줄을 주석 처리하거나 삭제 */
  /* box-shadow: 0 4px 32px ${COLOR.imgShadow}; */
  /* border: 2px solid ${COLOR.border}; */
  background: none;
  @media (max-width: 900px) {
    width: 70vw;
    max-width: 90vw;
  }
`;



