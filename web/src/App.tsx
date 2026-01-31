import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { useEffect } from "react";
import "./App.css";
//import Header from "./components/layout/Header";
import HomePage from "./components/home/HomePage";
import SpRegistrationForm from "./components/auth/registration/service-provider/RegistrationForm";
import UserRegistrationForm from "./components/auth/registration/user/RegistrationForm";
import LoginForm from "./components/auth/login/LoginForm";
import MobileVerification from "./components/auth/common/MobileVerification";
import ForgotPassword from "./components/auth/common/ForgotPassword";
import AuthLayout from "./components/layout/AuthLayout";
import MainLayout from "./components/layout/MainLayout";
import DashboardLayout from "./components/layout/DashboardLayout";
import PublicLayout from "./components/layout/PublicLayout";
import UserDashboard from "./components/order/UserDashboard";
import ServiceProviderDashboard from "./components/order/ServiceProviderDashboard";
import { useAccountStore } from "./store/AccountStore";

function DashboardRedirect() {
  const { account } = useAccountStore();

  if (account?.role === "user") {
    return <UserDashboard />;
  } else if (account?.role === "service_provider") {
    return <ServiceProviderDashboard />;
  } else {
    return <Navigate to="/login" replace />;
  }
}

function HomeRedirect() {
  const { isAuthenticated } = useAccountStore();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <HomePage />;
}

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
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomeRedirect />} />

          <Route element={<PublicLayout />}>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/service-provider/registration" element={<SpRegistrationForm />} />
            <Route path="/user/registration" element={<UserRegistrationForm />} />
          </Route>

          <Route path="/service-provider/verify/otp/:otpId" element={<MobileVerification type="service_provider" />} />
          <Route path="/user/verify/otp/:otpId" element={<MobileVerification type="user" />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardRedirect />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
