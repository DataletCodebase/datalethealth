// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../hooks/useAuth";
// import "../styles/auth.css";

// const passwordRegex =
//   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,16}$/;

// export default function Auth({ isLoginDefault = true }) {
//   const navigate = useNavigate();
//   const [isLogin, setIsLogin] = useState(isLoginDefault);
//   const [loading, setLoading] = useState(false);
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [errors, setErrors] = useState({});

//   // identifier = email or mobile (shared between login & signup)
//   const [form, setForm] = useState({
//     full_name: "",
//     identifier: "",   // email or mobile — auto-detected
//     password: "",
//     confirmPassword: "",
//   });

//   const { login, signup } = useAuth();

//   // Detect if identifier is mobile (all digits) or email
//   const isMobile = (val) => /^\d+$/.test(val);

//   const validate = () => {
//     const newErrors = {};

//     if (!isLogin) {
//       const id = form.identifier.trim();
//       if (isMobile(id) && !/^\d{10}$/.test(id))
//         newErrors.identifier = "📱 Mobile must be exactly 10 digits";

//       if (!passwordRegex.test(form.password))
//         newErrors.password =
//           "🔐 6–16 chars, 1 uppercase, 1 lowercase, 1 number, 1 special";

//       if (form.password !== form.confirmPassword)
//         newErrors.confirmPassword = "❌ Passwords do not match";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     // restrict identifier to 10 digits if typing a mobile number
//     if (name === "identifier" && isMobile(value) && value.length > 10) return;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (loading) return;
//     if (!validate()) return;

//     try {
//       setLoading(true);

//       if (isLogin) {
//         await login({
//           identifier: form.identifier,
//           password: form.password,
//         });
//         navigate("/dashboard");
//       } else {
//         // Build the signup payload — backend fills missing fields with 'N/A'
//         const id = form.identifier.trim();
//         const payload = {
//           full_name: form.full_name.trim(),
//           password: form.password,
//           // send email or mobile based on what the user typed
//           ...(isMobile(id) ? { mobile: id } : { email: id }),
//         };
//         await signup(payload);
//         setShowSuccess(true);
//         setIsLogin(true);
//       }
//     } catch (err) {
//       setErrors({ api: err.message || "⚠️ Something went wrong" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-layout">
//       <div className="auth-card glass fade-in">
//         <h1 className="brand gradient-text">Datalet AI</h1>
//         <p className="subtitle">{isLogin ? "Login to your account" : "Create your account"}</p>

//         <div className="auth-tabs">
//           <button className={isLogin ? "active" : ""} onClick={() => setIsLogin(true)}>Login</button>
//           <button className={!isLogin ? "active" : ""} onClick={() => setIsLogin(false)}>Signup</button>
//         </div>

//         <form onSubmit={handleSubmit} className="form">
//           {/* ── SIGNUP-ONLY FIELDS ── */}
//           {!isLogin && (
//             <>
//               <input
//                 className="input"
//                 placeholder="👤 Full Name"
//                 name="full_name"
//                 value={form.full_name}
//                 onChange={handleChange}
//                 required
//               />
//             </>
//           )}

//           {/* Shared identifier field (email or mobile) */}
//           <input
//             className="input"
//             placeholder={isLogin ? "📧 Email / Mobile" : "📧 Email or 📱 Mobile"}
//             name="identifier"
//             value={form.identifier}
//             onChange={handleChange}
//             required
//           />
//           {errors.identifier && <p className="inline-error">{errors.identifier}</p>}

//           {/* Password */}
//           <input
//             className="input"
//             type="password"
//             placeholder="🔐 Password"
//             name="password"
//             value={form.password}
//             onChange={handleChange}
//             required
//           />
//           {errors.password && <p className="inline-error">{errors.password}</p>}

//           {/* Confirm Password — signup only */}
//           {!isLogin && (
//             <>
//               <input
//                 className="input"
//                 type="password"
//                 placeholder="🔁 Confirm Password"
//                 name="confirmPassword"
//                 value={form.confirmPassword}
//                 onChange={handleChange}
//                 required
//               />
//               {errors.confirmPassword && <p className="inline-error">{errors.confirmPassword}</p>}
//             </>
//           )}

//           {errors.api && <p className="inline-error">{errors.api}</p>}

//           <button className="auth-btn" type="submit" disabled={loading}>
//             {loading ? "⏳ Please wait..." : isLogin ? "Login" : "Create Account"}
//           </button>
//         </form>
//       </div>

//       {showSuccess && (
//         <div className="popup-overlay" onClick={() => setShowSuccess(false)}>
//           <div className="popup" onClick={(e) => e.stopPropagation()}>
//             <h2>🎉 Signup Successful</h2>
//             <p>Your account has been created.</p>
//             <button onClick={() => setShowSuccess(false)}>Close</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { sendPhoneOTP, verifyPhoneOTP } from "../firebase/auth";
import "../styles/auth.css";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,16}$/;

export default function Auth({ isLoginDefault = true }) {
  const navigate = useNavigate();
  const { login, signup, loginOTP, checkUserExists } = useAuth();

  const [isLogin, setIsLogin] = useState(isLoginDefault);
  const [loginMode, setLoginMode] = useState("password"); // password | otp
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    let interval;
    if (otpStep && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [otpStep, timer]);

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      const id = form.identifier.trim();
      await sendPhoneOTP("+91" + id);
      setTimer(60);
      setCanResend(false);
      setStatusMsg({ type: "success", text: "OTP Resent Successfully!" });
    } catch (err) {
      setStatusMsg({ type: "error", text: err.message || "Failed to resend OTP" });
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (toLogin) => {
    setIsLogin(toLogin);
    setOtpStep(false);
    setOtp("");
    setErrors({});
  };

  const [form, setForm] = useState({
    full_name: "",
    identifier: "",
    password: "",
    confirmPassword: "",
  });

  const isMobile = (val) => /^\d{10}$/.test(val);
  const isEmail = (val) => /\S+@\S+\.\S+/.test(val);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "identifier" && /^\d+$/.test(value) && value.length > 10) return;

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ================= LOGIN =================
  const handleLogin = async () => {
    if (loginMode === "password") {
      await login({
        identifier: form.identifier,
        password: form.password,
      });
      // navigate("/dashboard"); login function handles navigation
    } else {
      // OTP LOGIN
      if (!otpStep) {
        if (!isMobile(form.identifier)) {
          setErrors({ api: "OTP login only works with mobile number" });
          return;
        }

        const exists = await checkUserExists(form.identifier);
        if (!exists) {
          setErrors({ api: "No account found with this mobile number. Please signup." });
          return;
        }

        await sendPhoneOTP("+91" + form.identifier);
        setOtpStep(true);
      } else {
        try {
          await verifyPhoneOTP(otp);
          setStatusMsg({ type: "success", text: "OTP Validated Successfully!" });
          await loginOTP({ identifier: form.identifier });
        } catch (err) {
          setStatusMsg({ type: "error", text: "Invalid OTP! Please try again." });
          throw err;
        }
      }
    }
  };

  // ================= SIGNUP =================
  const handleSignup = async () => {
    const id = form.identifier.trim();

    // PHONE SIGNUP WITH OTP
    if (isMobile(id)) {
      if (!otpStep) {
        const exists = await checkUserExists(id);
        if (exists) {
          setErrors({ api: "An account already exists with this mobile number. Please login." });
          return;
        }

        await sendPhoneOTP("+91" + id);
        setOtpStep(true);
        return;
      } else {
        try {
          await verifyPhoneOTP(otp);
          setStatusMsg({ type: "success", text: "OTP Validated Successfully!" });

          const payload = {
            full_name: form.full_name,
            password: form.password,
            mobile: id,
          };

          await signup(payload);
          setShowSuccess(true);
          setIsLogin(true);
          setOtpStep(false);
        } catch (err) {
          setStatusMsg({ type: "error", text: "Invalid OTP! Please try again." });
          throw err;
        }
      }
    }

    // EMAIL SIGNUP (NO OTP)
    else if (isEmail(id)) {
      const payload = {
        full_name: form.full_name,
        password: form.password,
        email: id,
      };

      await signup(payload);
      setShowSuccess(true);
      setIsLogin(true);
    } else {
      setErrors({ api: "Enter valid email or mobile number" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      setErrors({});

      if (isLogin) {
        await handleLogin();
      } else {
        await handleSignup();
      }
    } catch (err) {
      setErrors({ api: err.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card glass fade-in">
        <h1 className="brand gradient-text">Datalet AI</h1>

        <div className="auth-tabs">
          <button type="button" onClick={() => switchTab(true)} className={isLogin ? "active" : ""}>Login</button>
          <button type="button" onClick={() => switchTab(false)} className={!isLogin ? "active" : ""}>Signup</button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          {!isLogin && (
            <input
              className="input"
              placeholder="👤 Full Name"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              required
            />
          )}

          <input
            className="input"
            placeholder="📧 Email or 📱 Mobile"
            name="identifier"
            value={form.identifier}
            onChange={handleChange}
            required
          />

          {/* PASSWORD LOGIN */}
          {(!isLogin || loginMode === "password") && (
            <>
              <input
                className="input"
                type="password"
                placeholder="🔐 Password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />

              {!isLogin && (
                <input
                  className="input"
                  type="password"
                  placeholder="🔁 Confirm Password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
              )}
            </>
          )}

          {/* OTP INPUT */}
          {otpStep && (
            <div className="otp-container">
              <input
                className="input"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <div className="otp-timer-row">
                {timer > 0 ? (
                  <span className="timer-text">Resend OTP in {timer}s</span>
                ) : (
                  <button
                    type="button"
                    className="resend-btn"
                    onClick={handleResendOTP}
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}

          {isLogin && (
            <div className="checkbox-row">
              <input
                type="checkbox"
                id="otp-checkbox"
                checked={loginMode === "otp"}
                onChange={(e) => {
                  setLoginMode(e.target.checked ? "otp" : "password");
                  setOtpStep(false);
                }}
              />
              <label htmlFor="otp-checkbox">Login with OTP</label>
            </div>
          )}

          {errors.api && <p className="inline-error">{errors.api}</p>}

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : otpStep
                ? "Verify OTP"
                : (isLogin && loginMode === "otp") || (!isLogin && isMobile(form.identifier))
                  ? "Send OTP"
                  : isLogin
                    ? "Login"
                    : "Signup"}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: "15px", textAlign: "center", display: "flex", flexDirection: "column", gap: "10px" }}>
          {isLogin && (
            <button
              type="button"
              onClick={() => navigate("/reset-password")}
              className="text-btn"
              style={{ background: "none", border: "none", color: "#38bdf8", cursor: "pointer", textDecoration: "underline", fontSize: "14px" }}
            >
              Forget Password
            </button>
          )}
          <p style={{ fontSize: "13px", color: "#9898A8", margin: 0 }}>
            {isLogin ? "View our " : "By signing up, you agree to our "}
            <button
              type="button"
              onClick={() => navigate("/privacy-policy")}
              style={{ background: "none", border: "none", color: "#38bdf8", cursor: "pointer", textDecoration: "underline", fontSize: "13px", padding: 0 }}
            >
              Privacy Policy
            </button>
          </p>
        </div>

        {/* 🔥 REQUIRED FOR FIREBASE */}
        <div id="recaptcha-container"></div>
      </div>

      {showSuccess && (
        <div className="popup-overlay" onClick={() => setShowSuccess(false)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h2>🎉 Signup Successful</h2>
            <button onClick={() => setShowSuccess(false)}>Close</button>
          </div>
        </div>
      )}

      {statusMsg && (
        <div className={`status-popup-overlay ${statusMsg.type}`} onClick={() => setStatusMsg(null)}>
          <div className="status-popup" onClick={(e) => e.stopPropagation()}>
            <div className="status-icon">
              {statusMsg.type === "success" ? "✅" : "❌"}
            </div>
            <p>{statusMsg.text}</p>
            <button onClick={() => setStatusMsg(null)}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}
