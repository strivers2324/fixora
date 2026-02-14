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

      return <Navigate to={verifyUrl} replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  return (
    <div className="layout-container">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
