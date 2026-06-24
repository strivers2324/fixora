import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAccountStore } from "../../store/AdminAccountStore";
import { Role } from "@/enums/UserRole";

const AdminAuthLayout = () => {
  const { isAuthenticated, adminAccount } = useAdminAccountStore();
  const location = useLocation();

  if (!isAuthenticated || adminAccount?.role !== Role.ADMIN) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return (
    <div className="admin-layout-container">
      <Outlet />
    </div>
  );
};

export default AdminAuthLayout;
