import { Navigate, Outlet } from "react-router-dom";
import { useAccountStore } from "@/store/AccountStore";

export default function PublicLayout() {
  const { isAuthenticated } = useAccountStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
