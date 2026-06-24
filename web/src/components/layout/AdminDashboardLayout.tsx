import { Outlet } from "react-router-dom";
import AdminNavbar from "../home/sections/AdminNavbar";

export default function AdminDashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
      <AdminNavbar />
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  );
}
