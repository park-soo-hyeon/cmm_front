import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const LoginHandeler = () => {
  const navigate = useNavigate();
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
        const res = await response.json();
        localStorage.setItem("name", res.account.kakaoName);
        navigate("/");
      } catch (error) {
        alert("로그인 처리 중 오류가 발생했습니다.");
        console.error(error);
      }
    };
    kakaoLogin();
  }, [navigate, code]);

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
