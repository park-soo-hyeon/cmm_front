import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext"; // 로그인 상태 관리용 (선택)

const LoginHandeler = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // 로그인 상태 관리 (선택)
  const code = new URL(window.location.href).searchParams.get("code");

  useEffect(() => {
    const kakaoLogin = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_REDIRECT_URL}/?code=${code}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json;charset=utf-8",
            },
          }
        );
        if (!response.ok) {
          throw new Error("서버 응답 오류");
        }
        // 서버에서 { id: "user@email.com" } 형태의 JSON을 반환한다고 가정
        const res = await response.text();
        // id(유저 이메일) 저장
        localStorage.setItem("userEmail", res);

        // (선택) 전역 로그인 상태 관리가 있다면 아래도 호출
        if (login) login(res);

        navigate("/");
      } catch (error) {
        alert("로그인 처리 중 오류가 발생했습니다.");
        console.error(error);
      }
    };
    kakaoLogin();
  }, [navigate, code, login]);

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
