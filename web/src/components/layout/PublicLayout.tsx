import { Navigate, Outlet } from "react-router-dom";
import { useAccountStore } from "@/store/AccountStore";
import { Role } from "@/enums/UserRole";

export default function PublicLayout() {
  const { isAuthenticated, account, otpId } = useAccountStore();
  const appRole = localStorage.getItem("app_role");

  if (appRole === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (isAuthenticated && account) {
    if (!account.is_phone_verified && otpId) {
      const isServiceProvider = account.role === Role.SERVICE_PROVIDER;
      const verifyUrl = isServiceProvider ? `/service-provider/verify/otp/${otpId}` : `/user/verify/otp/${otpId}`;

      return <Navigate to={verifyUrl} replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
