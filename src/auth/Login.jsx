import "./Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";   
import logo from "../assets/LogoNew.png";
import login1 from "../assets/Login1.jpg";
import login2 from "../assets/Login2New.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      
      const res = await api.post("/api/admin/login", { email, password });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        setError("");
        navigate("/home");
      } else {
        setError(res.data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid credentials or server error");
    }
  };

  return (
    <div className="login-container">
      {/* Left Side */}
      <section className="login-left">
        <div className="logo-circle">
          <img src={logo} alt="StrayCare Logo" />
        </div>
      </section>

      {/* Right Side */}
      <main className="login-right">
        <div className="banner">
          <img src={login1} alt="Rescue Animal 1" className="banner-img" />
          <img src={login2} alt="Rescue Animal 2" className="banner-img" />
        </div>

        <div className="login-heading">
          <h1>Welcome</h1>
          <p>Please Login To Admin Dashboard</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-btn">Login</button>
        </form>

        <div className="forgot-password">
          <a href="#">Forgot Password?</a>
        </div>
      </main>
    </div>
  );
}
