import { Route, Routes } from "react-router-dom";
import "./App.css";
import Homepage from "./components/homepage/homepage";
import SpRegistrationForm from "./components/signup/serviceProvider/sp_registration_form";
import UserRegistrationForm from "./components/signup/user/user_registration_form";

function App() {
  return (
    <div className="w-full flex-col">
      <Homepage />
      <Routes>
        <Route path="/sp_registration_form" element={<SpRegistrationForm />} />

        <Route
          path="/user_registration_form"
          element={<UserRegistrationForm />}
        />
      </Routes>
    </div>
  );
}

export default App;
