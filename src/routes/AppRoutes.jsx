import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import VerifyLoginOtp from "../pages/auth/VerifyLoginOtp";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

import AdminLayout from "../layouts/AdminLayout";
import ParentLayout from "../layouts/ParentLayout";


const AppRoutes = () => {
  return (
    <Routes>

      {/* Public routes */}
      <Route 
        path="/login" 
        element={<Login />} 
      />

      <Route 
        path="/verify-login-otp" 
        element={<VerifyLoginOtp />} 
      />


      {/* Parent Home */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={["parent"]} />}>

          <Route 
            path="/" 
            element={<ParentLayout />} 
          />

        </Route>
      </Route>


      {/* Admin */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={["admin"]} />}>

          <Route 
            path="/admin/*" 
            element={<AdminLayout />} 
          />

        </Route>
      </Route>


      {/* Unknown route - MUST BE LAST */}
      <Route 
        path="*" 
        element={<Navigate to="/login" replace />} 
      />

    </Routes>
  );
};

export default AppRoutes;