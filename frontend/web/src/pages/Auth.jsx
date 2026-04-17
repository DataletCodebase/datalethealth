import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCaptcha } from "../hooks/useCaptcha";
import "../styles/auth.css";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,16}$/;

export default function Auth({ isLoginDefault = true }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(isLoginDefault);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    mobile: "",
    dob: "",
    address: "",
    disease: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  const { login, signup } = useAuth();
  const { captchaToken, captchaText, refreshCaptcha, onCaptchaChange, isCaptchaValid } = useCaptcha();

  const validate = () => {
    const newErrors = {};

    if (!isLogin && form.mobile && !/^\d{10}$/.test(form.mobile))
      newErrors.mobile = "📱 Only 10 digits allowed";

    if (!isLogin && !passwordRegex.test(form.password))
      newErrors.password =
        "🔐 6–8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special";

    if (!isLogin && form.password !== form.confirmPassword)
      newErrors.confirmPassword = "❌ Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile" && !/^\d*$/.test(value)) return;
    if (name === "mobile" && value.length > 10) return;

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!isLogin && !isCaptchaValid()) {
      setErrors({ captcha: "🤖 Invalid captcha" });
      refreshCaptcha();
      return;
    }

    if (!validate()) return;

    try {
      setLoading(true);

      if (isLogin) {
        await login({
          identifier: form.email,
          password: form.password,
          captchaToken,
        });
        navigate("/dashboard");
      } else {
        await signup({
          ...form,
          captchaToken,
        });
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
          {!isLogin && (
            <>
              <input className="input" placeholder="👤 Enter Full Name" name="full_name" value={form.full_name} onChange={handleChange} required />
              <input className="input" placeholder="📧 Enter Email" name="email" value={form.email} onChange={handleChange} required />

              <input className="input" placeholder="📱 Enter Mobile (10 digits)" name="mobile" value={form.mobile} onChange={handleChange} required />
              {errors.mobile && <p className="inline-error">{errors.mobile}</p>}

              <input className="input" type="date" name="dob" value={form.dob} onChange={handleChange} required />

              <select className="input" name="role" value={form.role} onChange={handleChange} required>
                <option value="">Select Role</option>
                <option value="USER">User</option>
                <option value="EXPERT">Expert</option>
                <option value="ADMIN">Admin</option>
              </select>

              <textarea className="input" placeholder="🏠 Address" name="address" value={form.address} onChange={handleChange} required />
              <input className="input" placeholder="🩺 Medical Condition" name="disease" value={form.disease} onChange={handleChange} />
            </>
          )}

          {isLogin && (
            <input className="input" placeholder="📧 Email / Mobile" name="email" value={form.email} onChange={handleChange} required />
          )}

          <input className="input" type="password" placeholder="🔐 Password" name="password" value={form.password} onChange={handleChange} required />
          {errors.password && <p className="inline-error">{errors.password}</p>}

          {!isLogin && (
            <>
              <input className="input" type="password" placeholder="🔁 Confirm Password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required />
              {errors.confirmPassword && <p className="inline-error">{errors.confirmPassword}</p>}
            </>
          )}

          {!isLogin && (
            <>
              <div className="captcha-box">
                <span>{captchaText}</span>
                <button type="button" onClick={refreshCaptcha}>⟳</button>
              </div>

              <input className="input" placeholder="🤖 Enter captcha" onChange={(e) => onCaptchaChange(e.target.value)} required />
              {errors.captcha && <p className="inline-error">{errors.captcha}</p>}
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
