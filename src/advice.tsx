import React from "react";
import styled from "styled-components";
import Header from "./header";
import { useNavigate } from "react-router-dom";

const Advice: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Header />
    </Container>
  );
};

export default Advice;

// Styled Components
const Container = styled.div`
  font-family: Arial, sans-serif;
  background-color: #f6f0ff;
  color: #333;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

