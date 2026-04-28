import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "../pages/Auth";
import ResetPassword from "../pages/ResetPassword";
import App from "../App";
import AdminLogin from "../admin/pages/AdminLogin";
import AdminDashboard from "../admin/pages/AdminDashboard";

const AdminRoute = ({ children }) => {
  // return localStorage.getItem("adminToken") ? children : <Navigate to="/admin/login" />;
  const token = localStorage.getItem("adminToken");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default function AppRouter() {
  return (
    <Routes>

      {/* ================= USER FLOW ================= */}


      {/* Login FIRST */}
      <Route path="/" element={<Auth isLoginDefault={true} />} />

      {/* Login */}
      <Route path="/login" element={<Auth isLoginDefault={true} />} />

      {/* Reset Password */}
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* After login */}
      <Route path="/dashboard/*" element={<App />} />

      

      {/* ================= ADMIN FLOW ================= */}

      <Route path="/admin/login" element={<AdminLogin />} />

       <Route path="/admin/dashboard/*" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />


       {/* ================= CATCH ALL (LAST) ================= */}

      {/* Safety redirect */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
