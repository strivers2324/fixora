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

function App() {
  const location = useLocation();

  useEffect(() => {
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
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
        <Route path="/service-provider/registration" element={<SpRegistrationForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/service-provider/number-verification" element={<SpMobileVerification />} />
        <Route path="/service-provider/information" element={<SpInformation />} />
        <Route path="/service-provider/nid-submission" element={<SpNIDSubmission />} />
        <Route path="/user/registration" element={<UserRegistrationForm />} />
        <Route path="/user/number-verification" element={<UserMobileVerification />} />
        <Route path="/user/information" element={<UserInformation />} />
      </Routes>
    </div>
  );
}
export default App;
