import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext"; // 로그인 상태 관리용 (선택)


const LoginHandeler = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // 로그인 상태 관리 (선택)
  const code = new URL(window.location.href).searchParams.get("code");
  const [loginDone, setLoginDone] = useState(false);

  useEffect(() => {
    if (!code || loginDone) return;

    const kakaoLogin = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_REDIRECT_URL}?code=${code}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json;charset=utf-8",
            },
          }
        );
        const contentType = response.headers.get("content-type");
        const text = await response.text();

        if (!response.ok) {
          // 서버가 HTML 에러페이지를 반환할 수도 있으니 text로 에러 표시
          alert("로그인 처리 중 오류가 발생했습니다.\n" + text);
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
        // id(유저 이메일) 저장
        localStorage.setItem("userEmail", userId);
        const expiresAt = Date.now() + 60 * 60 * 1000; // 1시간 뒤
        localStorage.setItem("expiresAt", expiresAt.toString());
        if (login) login(userId);

        setLoginDone(true); // 중복 호출 방지

        navigate("/");
      } catch (error) {
        alert("로그인 처리 중 오류가 발생했습니다.");
        console.error(error);
      }
    };
    kakaoLogin();
  }, [navigate, code, loginDone]);

  return (
    <div className="loginHandeler">
      <div className="notice">
        <p>로그인 중입니다.</p>
        <p>잠시만 기다려주세요.</p>
        <div className="spinner"></div>
      </div>
    </div>
  );
};

export default LoginHandeler;
