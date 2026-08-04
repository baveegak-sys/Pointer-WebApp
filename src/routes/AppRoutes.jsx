import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Login from "../pages/Login";
import Signup from "../pages/Signup";
import DashboardRootPage from "../pages/Dashboard/DashboardRootPage";

/**
 * Wraps any route that requires an authenticated user.
 * Redirects to /login if there's no token in the store.
 */
function ProtectedRoute({ children }) {
  const { token } = useSelector((state) => state.auth);
  return token ? children : <Navigate to="/login" replace />;
}

function DashboardPlaceholder() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e14] text-white">
      <p>You're logged in. Replace this with your real dashboard.</p>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={<DashboardRootPage/>}
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
