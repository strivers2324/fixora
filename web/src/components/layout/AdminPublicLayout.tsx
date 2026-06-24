import { Navigate, Outlet } from "react-router-dom";
import { useAdminAccountStore } from "../../store/AdminAccountStore";
import { Role } from "@/enums/UserRole";

const AdminPublicLayout = () => {
  const { isAuthenticated, adminAccount } = useAdminAccountStore();
  const appRole = localStorage.getItem("app_role");

  if (appRole === "USER") {
    return <Navigate to="/dashboard" replace />;
  }

  if (isAuthenticated && adminAccount?.role === Role.ADMIN) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="admin-public-layout">
      <Outlet />
    </div>
  );
};

export default AdminPublicLayout;
