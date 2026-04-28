import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sendPhoneOTP, verifyPhoneOTP } from "../firebase/auth";
import "../styles/auth.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Identifier, 2: OTP & New Password, 3: Success
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const isMobile = (val) => /^\d{10}$/.test(val);
  const isEmail = (val) => /\S+@\S+\.\S+/.test(val);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Check if user exists in DB
      const checkRes = await fetch("/api/auth/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });

      if (!checkRes.ok) {
        const checkData = await checkRes.json();
        throw new Error(checkData.message || "User not found.");
      }

      // 2. Send OTP
      if (isMobile(identifier)) {
        // await sendPhoneOTP("+91" + identifier);
        console.log("Dummy OTP: 123456");
        setStep(2);
      } else if (isEmail(identifier)) {
        // For now, email OTP is not implemented in firebase/auth.js
        // We will show an error or a message
        setError("Currently, password reset via OTP is only supported for mobile numbers.");
      } else {
        setError("Please enter a valid 10-digit mobile number or email.");
      }
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // 1. Verify OTP with Firebase
      // await verifyPhoneOTP(otp);
      
      // Dummy OTP Check
      if (otp !== "123456") {
        throw new Error("Invalid dummy OTP. Use 123456");
      }

      // 2. Call backend to update password
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update password.");
      }

      setStep(3);
    } catch (err) {
      setError(err.message || "Verification failed. Please check your OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card glass fade-in">
        <h1 className="brand gradient-text">Reset Password</h1>

        {step === 1 && (
          <>
            <p className="subtitle">Enter your registered email or phone number to receive an OTP.</p>
            <form onSubmit={handleRequestOTP} className="form">
              <input
                className="input"
                placeholder="Enter your mail or phone number"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
              {error && <p className="inline-error">{error}</p>}
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <p className="subtitle">Enter the OTP sent to {identifier} and set your new password.</p>
            <form onSubmit={handleResetPassword} className="form">
              <input
                className="input"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <input
                className="input"
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <input
                className="input"
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {error && <p className="inline-error">{error}</p>}
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? "Updating..." : "Save Password"}
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <div className="success-view" style={{ textAlign: "center" }}>
            <h2 style={{ color: "#10b981", marginBottom: "15px" }}>🎉 Password Reset Successful</h2>
            <p className="subtitle">Your password has been updated successfully. You can now login with your new password.</p>
            <button 
              className="auth-btn" 
              onClick={() => navigate("/login")}
              style={{ marginTop: "20px" }}
            >
              Go to Login
            </button>
          </div>
        )}

        {step !== 3 && (
          <div className="auth-footer" style={{ marginTop: "20px", textAlign: "center" }}>
            <button 
              onClick={() => navigate("/login")}
              className="text-btn"
              style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "14px" }}
            >
              Back to Login
            </button>
          </div>
        )}

        {/* 🔥 REQUIRED FOR FIREBASE */}
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}
