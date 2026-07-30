import { Route, Routes } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { ApplicationPage } from "./pages/ApplicationPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/application" element={<ApplicationPage />} />
    </Routes>
  );
}
