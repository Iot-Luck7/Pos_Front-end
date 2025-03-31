import React, { useState } from "react";
import LoginForm from "./LoginForm";
import { useNavigate } from "react-router-dom";
const Login = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate(); // 👈 추가

  const handleLogin = async ({ posLoginId, posPassword }) => {
    try {
      const response = await fetch("http://localhost:8080/api/pos/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posLoginId, posPassword }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "로그인 실패");
      }

      // ✔️ 로그인 정보 저장
      localStorage.setItem("posId", result.posId);
      localStorage.setItem("businessId", result.businessId);
      localStorage.setItem("businessType", result.businessType);

      window.location.href = `/menu/${result.posId}`; // 메뉴 페이지로 이동
    } catch (error) {
      console.error("❌ 로그인 실패:", error);
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="login-container">
      <LoginForm onSubmit={handleLogin} />
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default Login;
