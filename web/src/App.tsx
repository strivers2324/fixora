import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import "./App.css";
import Header from "./components/layout/Header";
import HomePage from "./components/home/HomePage";
import SpRegistrationForm from "./components/auth/registration/service-provider/RegistrationForm";
import UserRegistrationForm from "./components/auth/registration/user/RegistrationForm";
import Footer from "./components/layout/Footer";

function App() {
  const location = useLocation();
  useEffect(() => {
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <div className="w-full flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/SpRegistrationForm" element={<SpRegistrationForm />} />
          <Route path="/UserRegistrationForm" element={<UserRegistrationForm />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;