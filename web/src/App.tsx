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
import { DashboardRedirect, HomeRedirect, ProfileRedirect } from "./routes/AppRoutes";
import { Role } from "./enums/UserRole";
import { useAccountStore } from "./store/AccountStore";
import SplashScreen from "./components/ui/SplashScreen";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import FindProviders from "./components/Dashboard/user/FindProviders";

function App() {
    const location = useLocation();
    const { checkSession, isAuthChecking } = useAccountStore();

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    useEffect(() => {
        if (window.history.scrollRestoration) {
            window.history.scrollRestoration = "manual";
        }
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    if (isAuthChecking) {
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
                            <Route path="/find-providers" element={<FindProviders />} />
                        </Route>
                    </Route>
                </Routes>
            </div>
        </ThemeProvider>
    );
}

export default App;
