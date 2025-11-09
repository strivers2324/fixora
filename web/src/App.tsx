import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import "./App.css";
import Header from "./components/layout/Header";
import HomePage from "./components/home/HomePage";
import SpRegistrationForm from "./components/auth/registration/service-provider/RegistrationForm.tsx";
import UserRegistrationForm from "./components/auth/registration/user/RegistrationForm.tsx";
import LoginForm from "./components/auth/login/LoginForm";
import SpMobileVerification from "./components/auth/common/NumberVerification.tsx";

function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="w-full flex-col">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/SpRegistrationForm" element={<SpRegistrationForm />} />
        <Route path="/UserRegistrationForm" element={<UserRegistrationForm />} />
        <Route path="/LoginForm" element={<LoginForm />} />
        <Route path="/SpNumberVerification" element={<SpMobileVerification />} />
      </Routes>
    </div>
  );
}
export default App;