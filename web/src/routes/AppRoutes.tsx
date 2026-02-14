import { Navigate } from "react-router-dom";
import { useAccountStore } from "../store/AccountStore";
import { Role } from "../enums/UserRole";
import HomePage from "../components/home/HomePage";
import UserDashboard from "../components/order/Dashboard/user/UserDashboard";
import ServiceProviderDashboard from "../components/order/Dashboard/service-provider/ServiceProviderDashboard";
import UserUpdateProfile from "../components/profile/user/UpdateProfileForm";
import ServiceProviderUpdateProfile from "../components/profile/service-provider/UpdateProfileForm";

export function DashboardRedirect() {
  const { account } = useAccountStore();

  if (account?.role === Role.USER) {
    return <UserDashboard />;
  } else if (account?.role === Role.SERVICE_PROVIDER) {
    return <ServiceProviderDashboard />;
  } else {
    return <Navigate to="/login" replace />;
  }
}

export function ProfileRedirect() {
  const { account } = useAccountStore();

  if (account?.role === Role.USER) {
    return <UserUpdateProfile />;
  } else if (account?.role === Role.SERVICE_PROVIDER) {
    return <ServiceProviderUpdateProfile />;
  } else {
    return <Navigate to="/login" replace />;
  }
}

export function HomeRedirect() {
  const { isAuthenticated } = useAccountStore();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <HomePage />;
}
