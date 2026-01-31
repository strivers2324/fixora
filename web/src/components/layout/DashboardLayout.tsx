import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  );
}
