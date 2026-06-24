import { Navigate } from "react-router-dom";
import { useAccountStore } from "../store/AccountStore";
import { useAdminAccountStore } from "../store/AdminAccountStore";
import { Role } from "../enums/UserRole";
import HomePage from "../components/home/HomePage";
import UserDashboard from "../components/dashboard/user/UserDashboard";
import ServiceProviderDashboard from "../components/dashboard/service-provider/ServiceProviderDashboard";
import UserUpdateProfile from "../components/profile/user/UpdateProfileForm";
import ServiceProviderUpdateProfile from "../components/profile/service-provider/UpdateProfileForm";
import UserBookingHistory from "../components/dashboard/user/UserBookingHistory";
import ServiceProviderJobHistoryPage from "../components/dashboard/service-provider/ServiceProviderJobHistory";

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

export function HistoryRedirect() {
  const { account } = useAccountStore();

  if (account?.role === Role.USER) {
    return <UserBookingHistory />;
  } else if (account?.role === Role.SERVICE_PROVIDER) {
    return <ServiceProviderJobHistoryPage />;
  } else {
    return <Navigate to="/login" replace />;
  }
}

export function HomeRedirect() {
  const { account } = useAccountStore();
  const { adminAccount } = useAdminAccountStore();

  if (adminAccount) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (account) {
    return <Navigate to="/dashboard" replace />;
  }

  return <HomePage />;
}
