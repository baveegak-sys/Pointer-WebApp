import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { signup, clearAuthError } from "../redux/authSlice";

import "../css/auth.css";

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState({});

  const errors = {
    name: !form.name.trim() ? "Name is required" : "",

    email: !form.email
        ? "Email is required"
        : !/^\S+@\S+\.\S+$/.test(form.email)
            ? "Enter a valid email"
            : "",

    password: !form.password
        ? "Password is required"
        : form.password.length < 8
            ? "Use at least 8 characters"
            : "",

    confirmPassword: !form.confirmPassword
        ? "Please confirm your password"
        : form.confirmPassword !== form.password
            ? "Passwords don't match"
            : "",
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    if (error) {
      dispatch(clearAuthError());
    }
  };

  const handleBlur = (field) => {
    setTouched((currentTouched) => ({
      ...currentTouched,
      [field]: true,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (Object.values(errors).some(Boolean)) {
      return;
    }

    const result = await dispatch(
        signup({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        })
    );

    if (signup.fulfilled.match(result)) {
      navigate("/dashboard");
    }
  };

  return (
      <main className="auth-scene">
        <div className="auth-radar">
          <span />
          <span />
          <span />
        </div>

        <div className="auth-grid" />

        <section className="auth-card">
          <div className="auth-mark">
            <div className="auth-mark-icon">P</div>
            <p className="auth-mark-name">POINTER</p>
          </div>

          <p className="auth-eyebrow">JOIN THE CIRCLE</p>

          <h1 className="auth-title">Create your account</h1>

          <p className="auth-subtitle">
            Set up tracking, routing and SOS alerts for your family in under a
            minute.
          </p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label" htmlFor="name">
                Full name
              </label>

              <div className="auth-input-wrap">
                <span className="auth-input-icon">#</span>

                <input
                    id="name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    onBlur={() => handleBlur("name")}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    disabled={isLoading}
                />
              </div>

              {touched.name && errors.name && (
                  <p className="auth-error">{errors.name}</p>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="email">
                Email address
              </label>

              <div className="auth-input-wrap">
                <span className="auth-input-icon">@</span>

                <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur("email")}
                    placeholder="Enter your email"
                    autoComplete="email"
                    disabled={isLoading}
                />
              </div>

              {touched.email && errors.email && (
                  <p className="auth-error">{errors.email}</p>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="password">
                Password
              </label>

              <div className="auth-input-wrap">
                <span className="auth-input-icon">•</span>

                <input
                    id="password"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur("password")}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    disabled={isLoading}
                />
              </div>

              {touched.password && errors.password && (
                  <p className="auth-error">{errors.password}</p>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="confirmPassword">
                Confirm password
              </label>

              <div className="auth-input-wrap">
                <span className="auth-input-icon">•</span>

                <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    onBlur={() => handleBlur("confirmPassword")}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    disabled={isLoading}
                />
              </div>

              {touched.confirmPassword && errors.confirmPassword && (
                  <p className="auth-error">{errors.confirmPassword}</p>
              )}
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button
                className="auth-submit"
                type="submit"
                disabled={isLoading}
            >
              {isLoading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>

          <footer className="auth-footer">
            Developed by <strong>Melbourne Institute of Technology</strong>
          </footer>
        </section>
      </main>
  );
};

export default Signup;