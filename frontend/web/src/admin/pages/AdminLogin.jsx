// import { useState } from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css"; // we’ll create this CSS file

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();


  // 🔐 BLOCK LOGIN PAGE IF ALREADY LOGGED IN
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  const login = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      alert("Invalid admin credentials");
      return;
    }

    const data = await res.json();
    localStorage.setItem("adminToken", data.token);
    navigate("/admin/dashboard", { replace: true });
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={login}>
        <h2>Admin</h2>
        <p className="sub-title">Login to your account</p>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
