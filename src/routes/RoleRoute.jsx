import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const RoleRoute = ({ allowedRoles }) => {
  const reduxUser = useSelector((state) => state.auth.user);

  const user =
    reduxUser || JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;