import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Header from "../header";
import { useNavigate } from "react-router-dom";

const Terms: React.FC = () => {
  const navigate = useNavigate();

  // 체크박스 상태 관리
  const [allChecked, setAllChecked] = useState(false);
  const [ageChecked, setAgeChecked] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);

  // 전체 동의 체크박스 핸들러
  const handleAllChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setAllChecked(checked);
    setAgeChecked(checked);
    setTermsChecked(checked);
    setPrivacyChecked(checked);
  };

  // 개별 체크박스 핸들러
  const handleAgeChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAgeChecked(e.target.checked);
  };
  const handleTermsChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTermsChecked(e.target.checked);
  };
  const handlePrivacyChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrivacyChecked(e.target.checked);
  };

  // 나머지 3개 항목이 모두 체크되면 allChecked도 자동 체크
  useEffect(() => {
    if (ageChecked && termsChecked && privacyChecked) {
      setAllChecked(true);
    } else {
      setAllChecked(false);
    }
  }, [ageChecked, termsChecked, privacyChecked]);

  // 버튼 클릭 핸들러
  const handleAgreeClick = () => {
    if (!(ageChecked && termsChecked && privacyChecked)) {
      alert("모든 항목에 동의해주셔야 합니다.");
      return;
    }
    navigate("/signup2");
  };

  // 버튼 활성화 조건: 모든 항목이 체크되어야 함
  const isAllAgreed = allChecked && ageChecked && termsChecked && privacyChecked;

  return (
    <Container>
      <Header />
      <Main>
        <ContentBox>
          <Title>BlankSync 이용 약관</Title>
          <TermsList>
            <TermItem>
              <input
                type="checkbox"
                checked={allChecked}
                onChange={handleAllChecked}
                id="all"
              />
              <label htmlFor="all" style={{ marginLeft: 10 }}>
                다음 모든 항목에 동의합니다.
              </label>
            </TermItem>
            <TermItem>
              <input
                type="checkbox"
                checked={ageChecked}
                onChange={handleAgeChecked}
                id="age"
              />
              <label htmlFor="age" style={{ marginLeft: 10 }}>
                본인은 만 <strong>14세 이상</strong>입니다.
              </label>
            </TermItem>
            <TermItem>
              <input
                type="checkbox"
                checked={termsChecked}
                onChange={handleTermsChecked}
                id="terms"
              />
              <label htmlFor="terms" style={{ marginLeft: 10 }}>
                이용 약관에 동의합니다.
              </label>
            </TermItem>
            <TermItem>
              <input
                type="checkbox"
                checked={privacyChecked}
                onChange={handlePrivacyChecked}
                id="privacy"
              />
              <label htmlFor="privacy" style={{ marginLeft: 10 }}>
                <span style={{ color: "#a21caf", fontWeight: 600 }}>(필수)</span>{" "}
                개인정보의 수집 및 사용에 동의합니다. (<a href="#">더보기</a>)
              </label>
            </TermItem>
          </TermsList>
          <AgreeButton
            onClick={handleAgreeClick}
            disabled={!isAllAgreed}
          >
            동의 및 계속하기
          </AgreeButton>
        </ContentBox>
      </Main>
    </Container>
  );
};

export default Terms;

// Styled Components (동일)
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
  justify-content: center;
  align-items: center;
`;

const ContentBox = styled.div`
  background-color: #e9dfff;
  padding: 40px;
  border-radius: 20px;
  width: 80%;
  max-width: 600px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
`;

const TermsList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const TermItem = styled.li`
  display: flex;
  align-items: center;
  background-color: #d8c8f4;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 20px;
  font-size: 16px;
`;

const AgreeButton = styled.button`
  width: 100%;
  padding: 15px;
  border-radius: 50px;
  border: none;
  background-color: #a78bfa;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 15px;
  &:hover {
    background-color: #9061f9;
  }
  &:disabled {
    background-color: #d1c4e9;
    cursor: not-allowed;
  }
`;
