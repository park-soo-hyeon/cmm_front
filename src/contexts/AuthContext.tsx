import React, { createContext, useContext, useState, useEffect } from "react";

type AuthContextType = {
  isLoggedIn: boolean;
  login: (email: string) => void;
  logout: () => void;
  userEmail: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem("userEmail"));

  useEffect(() => {
    // 만료시간 체크
    const expiresAt = localStorage.getItem("expiresAt");
    if (!expiresAt || Date.now() > Number(expiresAt)) {
      localStorage.removeItem("userEmail");
      localStorage.removeItem("expiresAt");
      setUserEmail(null);
    }

    // localStorage 변경 감지 (다른 탭에서 로그아웃 등)
    const onStorage = () => setUserEmail(localStorage.getItem("userEmail"));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = (email: string) => {
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1시간 뒤
    localStorage.setItem("userEmail", email);
    localStorage.setItem("expiresAt", expiresAt.toString());
    setUserEmail(email);
  };

  const logout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("expiresAt");
    setUserEmail(null);
  };

  const expiresAt = localStorage.getItem("expiresAt");
  const isLoggedIn = !!userEmail && !!expiresAt && Date.now() < Number(expiresAt);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, userEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
