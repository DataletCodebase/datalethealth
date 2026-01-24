import { useState } from "react";

export default function Signup() {

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    mobile: "",
    password: "",
    captchaToken: "dummy", // placeholder
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
const res = await fetch("/api/auth/signup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(form),
});

      const data = await res.json();

      if (res.ok) {
        setMessage("Signup successful 🎉 Redirecting...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1200);
      } else {
        setMessage(data.message || "Signup failed");
      }

    } catch (err) {
      setMessage("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-md mx-auto panel">
        
        <h2 className="text-2xl font-bold text-slate-200 mb-2">
          Create Your Account
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Join Datalet Healthcare Wellness Platform
        </p>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          
          <input
            name="full_name"
            placeholder="Full Name"
            className="panel"
            value={form.full_name}
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            className="panel"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            name="mobile"
            placeholder="Mobile Number"
            className="panel"
            value={form.mobile}
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            className="panel"
            value={form.password}
            onChange={handleChange}
            required
          />

          {/* CAPTCHA placeholder UI token */}
          <input
            name="captchaToken"
            className="panel"
            value={form.captchaToken}
            onChange={handleChange}
            readOnly
          />

          <button
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Signup"}
          </button>
        </form>

        {message && (
          <p className="text-sm text-slate-300 mt-3">{message}</p>
        )}

        <p className="text-xs text-slate-400 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-sky-400 underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
