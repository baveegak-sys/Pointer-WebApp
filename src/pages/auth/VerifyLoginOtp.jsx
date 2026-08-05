import React, { useState } from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useDispatch } from "react-redux";

import {
  useVerifyLoginOtpMutation,
} from "../../redux/features/auth/authApi";

import {
  setCredentials,
} from "../../redux/features/auth/authSlice";

import "../../css/auth/VerifyLoginOtp.css";

const VerifyLoginOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");

  const [verifyLoginOtp, { isLoading }] =
    useVerifyLoginOtpMutation();

  const handleOtpChange = event => {
    const numbersOnly = event.target.value.replace(
      /[^0-9]/g,
      "",
    );

    setOtp(numbersOnly);
  };

  const handleSubmit = async event => {
    event.preventDefault();

    if (otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      const response = await verifyLoginOtp({
        email,
        otp,
      }).unwrap();

      console.log(
        "OTP verification response:",
        response,
      );

      const accessToken =
        response?.data?.accessToken;

      const user = response?.data?.user;

      if (!accessToken || !user) {
        alert(
          "Invalid response received from the server.",
        );
        return;
      }

      localStorage.setItem(
        "accessToken",
        accessToken,
      );

      localStorage.setItem(
        "user",
        JSON.stringify(user),
      );

      dispatch(
        setCredentials({
          user,
          token: accessToken,
        }),
      );

      setOtp("");

      if (user.role === "admin") {
        navigate("/admin/dashboard", {
          replace: true,
        });
      } else if (user.role === "parent") {
        navigate("/", {
          replace: true,
        });
      } else {
        navigate("/login", {
          replace: true,
        });
      }
    } catch (error) {
      console.log(
        "OTP verification error:",
        error,
      );

      alert(
        error?.data?.message ||
          "OTP verification failed.",
      );
    }
  };

  return (
    <main className="otp-page">
      <section className="otp-form-section">
        <div className="otp-brand">
          <div className="otp-brand-icon">
            P
          </div>

          <p className="otp-brand-name">
            POINTER
          </p>
        </div>

        <div className="otp-content">
          <div className="verification-icon">
            <div className="verification-lock">
              <span>✓</span>
            </div>
          </div>

          <header className="otp-header">
            <p className="otp-eyebrow">
              TWO-STEP VERIFICATION
            </p>

            <h1 className="otp-title">
              VERIFY OTP
            </h1>

            <p className="otp-subtitle">
              Enter the six-digit verification code
              sent to your email address.
            </p>
          </header>

          <div className="otp-email-box">
            <p>CODE SENT TO</p>

            <strong>
              {email || "Email address unavailable"}
            </strong>
          </div>

          <form
            className="otp-form"
            onSubmit={handleSubmit}
          >
            <label
              className="otp-label"
              htmlFor="otp"
            >
              Verification code
            </label>

            <div className="otp-input-container">
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                value={otp}
                onChange={handleOtpChange}
                maxLength={6}
                autoFocus
                disabled={isLoading}
              />
            </div>

            <div className="otp-length">
              <span>
                {otp.length}/6 digits entered
              </span>

              {otp.length === 6 && (
                <strong>Ready to verify</strong>
              )}
            </div>

            <button
              className="otp-button"
              type="submit"
              disabled={
                isLoading || otp.length !== 6
              }
            >
              {isLoading
                ? "VERIFYING..."
                : "VERIFY & CONTINUE"}
            </button>
          </form>

          <div className="otp-help">
            <p>
              Didn&apos;t receive the code?
            </p>

            <button
              type="button"
              className="resend-button"
              disabled
            >
              Resend code
            </button>
          </div>

          <Link
            to="/login"
            className="back-to-login"
          >
            ← Back to Sign In
          </Link>
        </div>

        <footer className="otp-footer">
          <p>Developed by</p>

          <strong>
            Melbourne Institute of Technology
          </strong>
        </footer>
      </section>

      <aside className="otp-information">
        <div className="otp-information-content">
          <div className="secure-badge">
            <span className="secure-dot" />

            SECURE VERIFICATION
          </div>

          <h2>
            One more step
            <br />
            to stay protected.
          </h2>

          <p>
            Two-step verification adds an additional
            security layer to your Pointer account,
            helping protect your location and safety
            information.
          </p>

          <div className="security-features">
            <div className="security-feature">
              <span>01</span>

              <div>
                <strong>
                  Check your email
                </strong>

                <p>
                  We sent a unique six-digit code.
                </p>
              </div>
            </div>

            <div className="security-feature">
              <span>02</span>

              <div>
                <strong>
                  Enter your code
                </strong>

                <p>
                  The verification code expires in
                  five minutes.
                </p>
              </div>
            </div>

            <div className="security-feature">
              <span>03</span>

              <div>
                <strong>
                  Access Pointer
                </strong>

                <p>
                  Continue securely to your dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="otp-copyright">
          © {new Date().getFullYear()} Pointer
        </p>
      </aside>
    </main>
  );
};

export default VerifyLoginOtp;