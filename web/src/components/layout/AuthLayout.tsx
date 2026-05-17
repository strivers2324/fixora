import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAccountStore } from "../../store/AccountStore";
import { Role } from "@/enums/UserRole";

const AuthLayout = () => {
  const { isAuthenticated, account, otpId } = useAccountStore();
  const location = useLocation();

  if (!isAuthenticated || !account) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!account.is_phone_verified) {
    if (otpId) {
      const isServiceProvider = account.role === Role.SERVICE_PROVIDER;
      const verifyUrl = isServiceProvider ? `/service-provider/verify/otp/${otpId}` : `/user/verify/otp/${otpId}`;

      if (!location.pathname.includes(verifyUrl)) {
        return <Navigate to={verifyUrl} replace />;
      }
    } else {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
          <h2 className="text-xl font-bold text-red-500 mb-2">Verification ID Missing!</h2>
          <p className="mb-4">Something went wrong. Please log out and log in again to verify your account.</p>
        </div>
      );
    }
  }

  return (
    <div className="layout-container">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
