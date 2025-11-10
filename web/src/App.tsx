import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import "./App.css";
import Header from "./components/layout/Header";
import HomePage from "./components/home/HomePage";
import SpRegistrationForm from "./components/auth/registration/service-provider/RegistrationForm.tsx";
import UserRegistrationForm from "./components/auth/registration/user/RegistrationForm.tsx";
import LoginForm from "./components/auth/login/LoginForm";
import SpMobileVerification from "./components/auth/registration/service-provider/NumberVerification.tsx";
import SpInformation from "./components/auth/registration/service-provider/SpInformation.tsx";
import SpNIDSubmission from "./components/auth/registration/service-provider/Document.tsx";
import UserMobileVerification from "./components/auth/registration/user/NumberVerification.tsx";
import UserInformation from "./components/auth/registration/user/UserInformation.tsx";
import Footer from "./components/layout/Footer";

function App() {
  const location = useLocation();

  useEffect(() => {
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="w-full flex-col">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/SpRegistrationForm" element={<SpRegistrationForm />} />
        <Route path="/LoginForm" element={<LoginForm />} />
        <Route path="/SpNumberVerification" element={<SpMobileVerification />} />
        <Route path="/SpInformation" element={<SpInformation />} />
        <Route path="/SpNIDSubmission" element={<SpNIDSubmission />} />
        <Route path="/UserRegistrationForm" element={<UserRegistrationForm />} />
        <Route path="/UserNumberVerification" element={<UserMobileVerification />} />
        <Route path="/UserInformation" element={<UserInformation />} />
      </Routes>
      <Footer />
    </div>
  );
}
export default App;
