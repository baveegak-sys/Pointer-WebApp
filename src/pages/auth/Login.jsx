import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useLoginMutation } from "../../redux/features/auth/authApi";

import "../../css/auth/Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = formData.email.trim().toLowerCase();

    const password = formData.password.trim();

    if (!email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const response = await login({
        email,
        password,
      }).unwrap();

      console.log("Login response:", response);

      navigate("/verify-login-otp", {
        state: {
          email,
        },
      });
    } catch (error) {
      console.log("Login error:", error);

      alert(error?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <div className="brand-icon">P</div>

          <p className="brand-name">POINTER</p>
        </div>

        <header className="login-header">
          <p className="login-eyebrow">WELCOME BACK</p>

          <h1 className="login-title">SIGN IN</h1>

          <p className="login-subtitle">
            Sign in to continue where you left off
          </p>
        </header>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="email">
              Email address
            </label>

            <div className="input-container">
              <span className="input-icon">@</span>

              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="input-group">
            <div className="password-label-row">
              <label className="input-label" htmlFor="password">
                Password
              </label>

              <Link className="forgot-password" to="/forgot-password">
                Forgot password?
              </Link>
            </div>

            <div className="input-container">
              <span className="input-icon">•</span>

              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>
          </div>

          <button className="login-button" type="submit" disabled={isLoading}>
            {isLoading ? "SIGNING IN..." : "SIGN IN"}
          </button>
        </form>

        <footer className="login-footer">
          <p>Developed by</p>

          <strong>Melbourne Institute of Technology</strong>
        </footer>
      </section>

      <aside className="login-information">
        <div className="information-content">
          <div className="live-status">
            <span className="live-dot" />
            SYSTEM ONLINE
          </div>

          <h2>
            Safety that stays
            <br />
            connected.
          </h2>

          <p>
            Real-time location tracking, route monitoring and immediate SOS
            alerts for the people who matter most.
          </p>

          <div className="feature-list">
            <div className="feature">
              <span>01</span>
              <p>Live GPS tracking</p>
            </div>

            <div className="feature">
              <span>02</span>
              <p>Emergency SOS alerts</p>
            </div>

            <div className="feature">
              <span>03</span>
              <p>Secure route monitoring</p>
            </div>
          </div>
        </div>

        <p className="information-copyright">
          © {new Date().getFullYear()} Pointer
        </p>
      </aside>
    </main>
  );
};

export default Login;
