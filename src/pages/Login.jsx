import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { login, clearAuthError } from "../redux/authSlice";

import "../css/auth.css";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [touched, setTouched] = useState({});

  const errors = {
    email: !form.email
        ? "Email is required"
        : !/^\S+@\S+\.\S+$/.test(form.email)
            ? "Enter a valid email"
            : "",

    password: !form.password ? "Password is required" : "",
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
      email: true,
      password: true,
    });

    if (Object.values(errors).some(Boolean)) {
      return;
    }

    const result = await dispatch(
        login({
          email: form.email.trim(),
          password: form.password,
        })
    );

    if (login.fulfilled.match(result)) {
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

          <p className="auth-eyebrow">WELCOME BACK</p>

          <h1 className="auth-title">Sign in to your circle</h1>

          <p className="auth-subtitle">
            Pick up right where you left off — live locations, routes and alerts,
            all in sync.
          </p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
              <div className="auth-field-row">
                <label className="auth-label" htmlFor="password">
                  Password
                </label>

                <Link className="auth-forgot" to="/forgot-password">
                  Forgot?
                </Link>
              </div>

              <div className="auth-input-wrap">
                <span className="auth-input-icon">•</span>

                <input
                    id="password"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur("password")}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={isLoading}
                />
              </div>

              {touched.password && errors.password && (
                  <p className="auth-error">{errors.password}</p>
              )}
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button
                className="auth-submit"
                type="submit"
                disabled={isLoading}
            >
              {isLoading ? "SIGNING IN..." : "SIGN IN"}
            </button>
          </form>

          <p className="auth-switch">
            New to Pointer? <Link to="/signup">Create an account</Link>
          </p>

          <footer className="auth-footer">
            Developed by <strong>Melbourne Institute of Technology</strong>
          </footer>
        </section>
      </main>
  );
};

export default Login;

// +