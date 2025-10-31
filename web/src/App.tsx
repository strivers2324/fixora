import { Routes, Route } from "react-router-dom";

import HomePage from "./components/homepage/homePage.tsx";

import Navigation from "./components/homepage/navigation.tsx";

function App() {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<HomePage />} />

      </Routes>
    </>
  );
}

export default App;