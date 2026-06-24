import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import "./App.css";
import SpRegistrationForm from "./components/auth/registration/service-provider/RegistrationForm";
import UserRegistrationForm from "./components/auth/registration/user/RegistrationForm";
import LoginForm from "./components/auth/login/LoginForm";
import OtpVerification from "./components/common/OtpVerification";
import ForgotPassword from "./components/auth/login/forgot-password/ForgotPassword";
import ResetPasswordPage from "./components/auth/login/forgot-password/ResetPassword";
import AuthLayout from "./components/layout/AuthLayout";
import MainLayout from "./components/layout/MainLayout";
import DashboardLayout from "./components/layout/DashboardLayout";
import PublicLayout from "./components/layout/PublicLayout";
import { DashboardRedirect, HistoryRedirect, HomeRedirect, ProfileRedirect } from "./routes/AppRoutes";
import { Role } from "./enums/UserRole";
import { useAccountStore } from "./store/AccountStore";
import { useAdminAccountStore } from "./store/AdminAccountStore";
import SplashScreen from "./components/ui/SplashScreen";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import FindProviders from "./components/dashboard/user/FindProviders";
import TermsAndConditions from "./components/policy/TermsAndConditions";
import AdminLoginForm from "./components/auth/login/AdminLoginForm";
import AdminDashboard from "./components/dashboard/admin/AdminDashboard";
import AdminPublicLayout from "./components/layout/AdminPublicLayout";
import AdminAuthLayout from "./components/layout/AdminAuthLayout";
import AdminDashboardLayout from "./components/layout/AdminDashboardLayout";

function App() {
  const location = useLocation();
  const { account, checkSession: checkUserSession, isAuthChecking: isUserAuthChecking } = useAccountStore();
  const { adminAccount, checkSession: checkAdminSession, isAuthChecking: isAdminAuthChecking } = useAdminAccountStore();

  const appRole = localStorage.getItem("app_role");
  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    if (account) {
      localStorage.setItem("app_role", "USER");
    } else if (!isUserAuthChecking && !account && appRole === "USER") {
      localStorage.removeItem("app_role");
    }
  }, [account, isUserAuthChecking, appRole]);

  useEffect(() => {
    if (adminAccount) {
      localStorage.setItem("app_role", "ADMIN");
    } else if (!isAdminAuthChecking && !adminAccount && appRole === "ADMIN") {
      localStorage.removeItem("app_role");
    }
  }, [adminAccount, isAdminAuthChecking, appRole]);

  useEffect(() => {
    if (appRole === "ADMIN") {
      checkAdminSession();
    } else if (appRole === "USER") {
      checkUserSession();
    } else {
      if (isAdminRoute) checkAdminSession();
      else checkUserSession();
    }
  }, [isAdminRoute, checkUserSession, checkAdminSession, appRole]);

  useEffect(() => {
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isChecking =
    appRole === "ADMIN"
      ? isAdminAuthChecking
      : appRole === "USER"
        ? isUserAuthChecking
        : isAdminRoute
          ? isAdminAuthChecking
          : isUserAuthChecking;

  if (isChecking) {
    return <SplashScreen />;
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="w-full flex-col">
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomeRedirect />} />

            <Route element={<PublicLayout />}>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify/otp/:otpId" element={<OtpVerification isForgotPassword={true} />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/registration/service-provider" element={<SpRegistrationForm />} />
              <Route path="/registration/user" element={<UserRegistrationForm />} />
              <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            </Route>

            <Route
              path="/service-provider/verify/otp/:otpId"
              element={<OtpVerification type={Role.SERVICE_PROVIDER} />}
            />
            <Route path="/user/verify/otp/:otpId" element={<OtpVerification type={Role.USER} />} />
          </Route>

          <Route element={<AuthLayout />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardRedirect />} />
              <Route path="/profile" element={<ProfileRedirect />} />
              <Route path="/address" element={<ProfileRedirect />} />
              <Route path="/security" element={<ProfileRedirect />} />
              <Route path="/verify-identity" element={<ProfileRedirect />} />
              <Route path="/find-providers" element={<FindProviders />} />
              <Route path="/history" element={<HistoryRedirect />} />
            </Route>
          </Route>

          <Route element={<AdminPublicLayout />}>
            <Route path="/admin/login" element={<AdminLoginForm />} />
          </Route>

          <Route element={<AdminAuthLayout />}>
            <Route element={<AdminDashboardLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>
          </Route>
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
