import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ element: Component, isAuthenticated, ...rest }) => {
  const token = localStorage.getItem("token");

  if (token) {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // текущая дата в секундах
    if (decodedToken.exp < currentTime) {
      localStorage.removeItem("token"); // Удаляем истекший токен
      return <Navigate to="/login" />;
    }
  } else if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <Component {...rest} />;
};

export default ProtectedRoute;
