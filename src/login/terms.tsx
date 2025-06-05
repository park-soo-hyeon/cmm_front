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
        <TermsCard>
          <Title>약관 동의</Title>
          <Subtitle>서비스 이용을 위해 아래 약관에 동의해주세요.</Subtitle>
          <TermsList>
            <TermItem>
              <StyledCheckbox
                type="checkbox"
                checked={allChecked}
                onChange={handleAllChecked}
                id="all"
              />
              <Label htmlFor="all"><strong>모두 동의합니다</strong></Label>
            </TermItem>
            <Divider />
            <TermItem>
              <StyledCheckbox
                type="checkbox"
                checked={ageChecked}
                onChange={handleAgeChecked}
                id="age"
              />
              <Label htmlFor="age">본인은 만 <strong>14세 이상</strong>입니다.</Label>
            </TermItem>
            <TermItem>
              <StyledCheckbox
                type="checkbox"
                checked={termsChecked}
                onChange={handleTermsChecked}
                id="terms"
              />
              <Label htmlFor="terms">이용 약관에 동의합니다.</Label>
            </TermItem>
            <TermItem>
              <StyledCheckbox
                type="checkbox"
                checked={privacyChecked}
                onChange={handlePrivacyChecked}
                id="privacy"
              />
              <Label htmlFor="privacy">
                <span style={{ color: COLOR.accentDark, fontWeight: 600 }}>(필수)</span>{" "}
                개인정보의 수집 및 사용에 동의합니다. <MoreLink href="#">더보기</MoreLink>
              </Label>
            </TermItem>
          </TermsList>
          <AgreeButton
            onClick={handleAgreeClick}
            disabled={!isAllAgreed}
          >
            동의 및 계속하기
          </AgreeButton>
        </TermsCard>
      </Main>
    </Container>
  );
};

export default Terms;

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
  min-height: 100vh;
  background: ${COLOR.bg};
  display: flex;
  flex-direction: column;
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TermsCard = styled.div`
  background: ${COLOR.card};
  border-radius: 18px;
  box-shadow: 0 6px 32px ${COLOR.imgShadow};
  padding: 44px 36px 36px 36px;
  min-width: 340px;
  max-width: 420px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1.5px solid ${COLOR.border};
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 800;
  color: ${COLOR.text};
  margin-bottom: 7px;
`;

const Subtitle = styled.p`
  font-size: 15px;
  color: ${COLOR.subText};
  margin-bottom: 22px;
  text-align: center;
`;

const TermsList = styled.ul`
  list-style-type: none;
  padding: 0;
  width: 100%;
  margin-bottom: 18px;
`;

const TermItem = styled.li`
  display: flex;
  align-items: center;
  background: ${COLOR.imgBg};
  padding: 13px 16px;
  margin-bottom: 12px;
  border-radius: 12px;
  font-size: 15px;
  color: ${COLOR.text};
  font-weight: 500;
`;

const StyledCheckbox = styled.input`
  accent-color: ${COLOR.accent};
  width: 20px;
  height: 20px;
  margin-right: 14px;
`;

const Label = styled.label`
  cursor: pointer;
  user-select: none;
`;

const MoreLink = styled.a`
  color: ${COLOR.accent};
  font-weight: 600;
  margin-left: 2px;
  &:hover {
    text-decoration: underline;
    color: ${COLOR.accentDark};
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1.5px solid ${COLOR.border};
  margin: 8px 0 12px 0;
  width: 100%;
`;

const AgreeButton = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: 10px;
  border: none;
  background-color: ${COLOR.accent};
  color: ${COLOR.text};
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.18s, color 0.18s;
  &:hover {
    background-color: ${COLOR.accentDark};
    color: ${COLOR.card};
  }
  &:disabled {
    background-color: ${COLOR.imgBg};
    color: ${COLOR.subText};
    cursor: not-allowed;
  }
`;

