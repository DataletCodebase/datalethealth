import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "../pages/Auth";
import App from "../App";

export default function AppRouter() {
  return (
    <Routes>
      {/* Signup FIRST */}
      <Route path="/" element={<Auth isLoginDefault={false} />} />

      {/* Login */}
      <Route path="/login" element={<Auth isLoginDefault={true} />} />

      {/* After login */}
      <Route path="/dashboard" element={<App />} />

      {/* Safety redirect */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
