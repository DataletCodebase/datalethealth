import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/auth.css";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,16}$/;

export default function Auth({ isLoginDefault = true }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(isLoginDefault);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // identifier = email or mobile (shared between login & signup)
  const [form, setForm] = useState({
    full_name: "",
    identifier: "",   // email or mobile — auto-detected
    password: "",
    confirmPassword: "",
  });

  const { login, signup } = useAuth();

  // Detect if identifier is mobile (all digits) or email
  const isMobile = (val) => /^\d+$/.test(val);

  const validate = () => {
    const newErrors = {};

    if (!isLogin) {
      const id = form.identifier.trim();
      if (isMobile(id) && !/^\d{10}$/.test(id))
        newErrors.identifier = "📱 Mobile must be exactly 10 digits";

      if (!passwordRegex.test(form.password))
        newErrors.password =
          "🔐 6–16 chars, 1 uppercase, 1 lowercase, 1 number, 1 special";

      if (form.password !== form.confirmPassword)
        newErrors.confirmPassword = "❌ Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // restrict identifier to 10 digits if typing a mobile number
    if (name === "identifier" && isMobile(value) && value.length > 10) return;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validate()) return;

    try {
      setLoading(true);

      if (isLogin) {
        await login({
          identifier: form.identifier,
          password: form.password,
        });
        navigate("/dashboard");
      } else {
        // Build the signup payload — backend fills missing fields with 'N/A'
        const id = form.identifier.trim();
        const payload = {
          full_name: form.full_name.trim(),
          password: form.password,
          // send email or mobile based on what the user typed
          ...(isMobile(id) ? { mobile: id } : { email: id }),
        };
        await signup(payload);
        setShowSuccess(true);
        setIsLogin(true);
      }
    } catch (err) {
      setErrors({ api: err.message || "⚠️ Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card glass fade-in">
        <h1 className="brand gradient-text">Datalet AI</h1>
        <p className="subtitle">{isLogin ? "Login to your account" : "Create your account"}</p>

        <div className="auth-tabs">
          <button className={isLogin ? "active" : ""} onClick={() => setIsLogin(true)}>Login</button>
          <button className={!isLogin ? "active" : ""} onClick={() => setIsLogin(false)}>Signup</button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          {/* ── SIGNUP-ONLY FIELDS ── */}
          {!isLogin && (
            <>
              <input
                className="input"
                placeholder="👤 Full Name"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                required
              />
            </>
          )}

          {/* Shared identifier field (email or mobile) */}
          <input
            className="input"
            placeholder={isLogin ? "📧 Email / Mobile" : "📧 Email or 📱 Mobile"}
            name="identifier"
            value={form.identifier}
            onChange={handleChange}
            required
          />
          {errors.identifier && <p className="inline-error">{errors.identifier}</p>}

          {/* Password */}
          <input
            className="input"
            type="password"
            placeholder="🔐 Password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          {errors.password && <p className="inline-error">{errors.password}</p>}

          {/* Confirm Password — signup only */}
          {!isLogin && (
            <>
              <input
                className="input"
                type="password"
                placeholder="🔁 Confirm Password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
              {errors.confirmPassword && <p className="inline-error">{errors.confirmPassword}</p>}
            </>
          )}

          {errors.api && <p className="inline-error">{errors.api}</p>}

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? "⏳ Please wait..." : isLogin ? "Login" : "Create Account"}
          </button>
        </form>
      </div>

      {showSuccess && (
        <div className="popup-overlay" onClick={() => setShowSuccess(false)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h2>🎉 Signup Successful</h2>
            <p>Your account has been created.</p>
            <button onClick={() => setShowSuccess(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
