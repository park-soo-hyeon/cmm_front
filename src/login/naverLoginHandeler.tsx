import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const API_URL = process.env.REACT_APP_API_URL;

const NaverLoginHandeler = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginDone, setLoginDone] = useState(false);

  useEffect(() => {
    if (loginDone) return;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    if (!code || !state) {
      alert("네이버 인증 코드가 없습니다.");
      navigate("/login");
      return;
    }

    const naverLogin = async () => {
      try {
        const response = await fetch(
          `spring/naver/callback`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, state }),
          }
        );
        const contentType = response.headers.get("content-type");
        const text = await response.text();

        if (!response.ok) {
          alert("네이버 로그인 처리 중 오류가 발생했습니다.\n" + text);
          navigate("/login");
          throw new Error(text);
        }

        let userId = text;
        // JSON 응답이면 id 추출
        if (contentType && contentType.includes("application/json")) {
          try {
            const json = JSON.parse(text);
            userId = json.id || text;
          } catch {
            // 파싱 실패 시 그대로 text 사용
          }
        }
        localStorage.setItem("userEmail", userId);
        const expiresAt = Date.now() + 60 * 60 * 1000; // 1시간 뒤
        localStorage.setItem("expiresAt", expiresAt.toString());
        if (login) login(userId);

        setLoginDone(true);
        navigate("/");
      } catch (error) {
        alert("네이버 로그인 처리 중 오류가 발생했습니다.");
        navigate("/login");
        console.error(error);
      }
    };

    naverLogin();
  }, [navigate, loginDone]);

  return (
    <div className="loginHandeler">
      <div className="notice">
        <p>네이버 로그인 중입니다.</p>
        <p>잠시만 기다려주세요.</p>
        <div className="spinner"></div>
      </div>
    </div>
  );
};

export default NaverLoginHandeler;
