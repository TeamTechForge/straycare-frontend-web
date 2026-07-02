import "./Login.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import logo from "../assets/LogoNew.png";
import loginBg1 from "../assets/Login01.jpg";
import loginBg2 from "../assets/Login02.jpg";
import loginBg3 from "../assets/Login03.jpg";
import loginBg4 from "../assets/Login04.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const navigate = useNavigate();

  const images = [loginBg1, loginBg2, loginBg3, loginBg4];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/admin/login", { email, password });
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("adminId", res.data.adminId);
        setError("");
        navigate("/home");
      } else {
        setError(res.data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Server error, please try again.");
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Left: image carousel */}
        <div className="card-image">
          {images.map((img, i) => (
            <div
              key={i}
              className={`slide ${i === currentImage ? "active" : ""}`}
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
          <div className="slide-dots">
            {images.map((_, i) => (
              <button
                key={i}
                className={`dot ${i === currentImage ? "active" : ""}`}
                onClick={() => setCurrentImage(i)}
              />
            ))}
          </div>
        </div>

        {/* Right: form */}
        <div className="card-form">
          <div className="logo-wrap">
            <img src={logo} alt="StrayCare Logo" />
          </div>

          <div className="login-heading">
            <h1>Welcome back!</h1>
            <p>Sign in to your admin dashboard</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="text"
                placeholder="admin@straycare.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-footer">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate("/forgot-password"); }} className="forgot-link">
                Forgot password?
              </a>
            </div>

            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="login-btn">Sign in</button>
          </form>
        </div>

      </div>
    </div>
  );
}