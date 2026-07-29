import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useVerifyLoginOtpMutation } from "../../redux/features/auth/authApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../redux/features/auth/authSlice";

const VerifyLoginOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [verifyLoginOtp, { isLoading }] = useVerifyLoginOtpMutation();

  const email = location.state?.email;

  const [otp, setOtp] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp) {
      alert("Please enter OTP");
      return;
    }

    try {
      const response = await verifyLoginOtp({
        email,
        otp,
      }).unwrap();

      console.log(response);


      // Save token and user
      localStorage.setItem(
        "accessToken",
        response.data.accessToken
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );


      // Store in Redux
      dispatch(
        setCredentials({
          user: response.data.user,
          token: response.data.accessToken,
        })
      );


      // Redirect based on role
      const role = response.data.user.role;


      if (role === "admin") {
        navigate("/admin/dashboard", {
          replace: true,
        });
      } 
      else if (role === "parent") {
        navigate("/", {
          replace: true,
        });
      } 
      else {
        navigate("/login", {
          replace: true,
        });
      }


    } catch (error) {
      console.log(error);

      alert(
        error?.data?.message ||
        "OTP verification failed"
      );
    }
  };


  return (
    <div 
      className="container mt-5"
      style={{ maxWidth: 450 }}
    >

      <h2 className="mb-4">
        Verify Login OTP
      </h2>


      <p>
        OTP sent to:
        <strong> {email}</strong>
      </p>


      <form onSubmit={handleSubmit}>

        <div className="mb-3">
          <label>
            Enter OTP
          </label>

          <input
            type="text"
            className="form-control"
            placeholder="Enter 6 digit OTP"
            value={otp}
            onChange={(e)=>setOtp(e.target.value)}
            maxLength={6}
          />

        </div>


        <button
          className="btn btn-primary w-100"
          disabled={isLoading}
        >
          {
            isLoading
            ? "Verifying..."
            : "Verify OTP"
          }
        </button>

      </form>

    </div>
  );
};


export default VerifyLoginOtp;