import { Outlet } from "react-router-dom";
import Header from "./Header"; // আপনার আগের তৈরি করা Header
import Footer from "./Footer"; // আপনার আগের তৈরি করা Footer

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
