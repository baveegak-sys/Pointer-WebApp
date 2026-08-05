import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../redux/features/auth/authSlice";
import { useLogoutMutation } from "../../redux/features/auth/authApi";

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [logoutApi, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch (error) {
      console.log(error);
    } finally {
      dispatch(logout());
      navigate("/login", { replace: true });
    }
  };

  return (
    <div>
      <h1>Parents Home Page</h1>
      <button
        className="btn btn-danger"
        onClick={handleLogout}
        disabled={isLoading}
      >
        {isLoading ? "Logging out..." : "Logout"}
      </button>
    </div>
  );
};

export default Home;