import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) {
    alert("로그인 후 이용가능합니다!");
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};


export default ProtectedRoute;
