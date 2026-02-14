import { Outlet } from "react-router-dom";
import UserNavbar from "../home/sections/ProtectedNavbar";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  );
}
