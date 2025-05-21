import React from "react";
import { Navigate, useLocation } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem("userEmail");
  const location = useLocation();

  if (!isLoggedIn) {
    alert("로그인 후 이용가능합니다!");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
