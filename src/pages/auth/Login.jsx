import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLoginMutation } from "../../redux/features/auth/authApi";

const Login = () => {
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert("Please fill all fields.");
      return;
    }

    try {
      const response = await login(formData).unwrap();

      console.log(response);

      alert(response.message);

      navigate("/verify-login-otp", {
        state: {
          email: formData.email,
        },
      });
    } catch (error) {
      console.log(error);

      alert(error?.data?.message || "Login failed.");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 450 }}>
      <h2 className="mb-4">Login</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Email</label>

          <input
            type="email"
            className="form-control"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label>Password</label>

          <input
            type="password"
            className="form-control"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <button
          className="btn btn-primary w-100"
          disabled={isLoading}
        >
          {isLoading ? "Please wait..." : "Login"}
        </button>
      </form>

      <div className="mt-3">
        Don't have an account?{" "}
        <Link to="/signup">
          Signup
        </Link>
      </div>
    </div>
  );
};

export default Login;