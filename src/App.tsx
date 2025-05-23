import React from "react";
import styled from "styled-components";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Login from "./login/login"; // login.tsx 파일 import
import Header from "./header"; // header.tsx 파일 import
import Terms from "./login/terms";
import NewMember from "./login/newMember";
import Create from "./create";
import Team from "./team";
import ProjectList from "./projectList";
import Advice from "./advice";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

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

  return (
    <Container>
      <Header />
      <Main>
        <TextSection>
          <Title>새로운 형식의 실시간 플랫폼</Title>
          <Subtitle>
            다양한 기능을 하나의 협업 환경에서 실시간으로 공유하며 사용할 수 있는 실시간 협업 플랫폼
          </Subtitle>
          <ActionLink href="#">→ 사용해보기</ActionLink>
        </TextSection>

        <ImageSection>
          <Image src="/image/mainImage.jpg" alt="협업 플랫폼 이미지" />
        </ImageSection>
      </Main>
    </Container>
  );
};

// 라우터가 포함된 앱 컴포넌트
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainComponent />} />
          <Route path="/login" element={<Login />} />
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
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

const Container = styled.div`
  font-family: Arial, sans-serif;
  background-color: #f6f0ff;
  color: #333;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Main = styled.main`
  flex-grow: 1;
  display: flex;
  padding: 40px;
  justify-content: space-between;
  align-items: center;
`;

const TextSection = styled.div`
  max-width: 50%;
`;

const Title = styled.h2`
  font-size: 48px;
  font-weight: bold;
  line-height: 1.2;
  margin-bottom: 20px;
`;

const Subtitle = styled.p`
  font-size: 18px;
  line-height: 1.5;
  margin-bottom: 30px;
`;

const ActionLink = styled.a`
  color: #333;
  font-size: 18px;
  text-decoration: none;
  display: inline-block;
  &:hover {
    text-decoration: underline;
  }
`;

const ImageSection = styled.div`
  max-width: 50%;
`;

const Image = styled.img`
  width: 100%;
  max-width: 600px;
  height: auto;
  border-radius: 20px;
`;
