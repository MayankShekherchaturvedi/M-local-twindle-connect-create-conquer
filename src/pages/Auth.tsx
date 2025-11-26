import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { ForgotPassword } from "@/components/auth/ForgotPassword";
import { SignupFlow } from "@/components/auth/SignupFlow";

const Auth = () => {
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  if (showForgotPassword) {
    return <ForgotPassword onBack={() => setShowForgotPassword(false)} />;
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={<LoginForm onForgotPassword={() => setShowForgotPassword(true)} />} 
      />
      <Route path="/signup" element={<SignupFlow />} />
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
};

export default Auth;
