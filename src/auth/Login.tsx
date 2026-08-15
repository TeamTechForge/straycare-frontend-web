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
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [currentImage, setCurrentImage] = useState<number>(0);

  const navigate = useNavigate();

  const images = [loginBg1, loginBg2, loginBg3, loginBg4];

  useEffect(() => {
    if (sessionStorage.getItem("dashboardSessionExpired") === "true") {
      setError("Your session expired due to inactivity. Please sign in again.");
      sessionStorage.removeItem("dashboardSessionExpired");
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [images.length]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      const res = await api.post("/api/admin/login", {
        email,
        password,
      });

      if (res.data.token) {
  localStorage.setItem("token", res.data.token);
  localStorage.setItem("adminId", res.data.admin?.id || "");
  setError("");
  navigate("/home");
} else {
  setError(res.data.error || "Login failed");
}

    } catch (err: any) {
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


        <div className="card-form">

          <div className="logo-wrap">
            <img src={logo} alt="StrayCare Logo" />
          </div>

          <div className="login-heading">
            <h1>Welcome back!</h1>
            <p>Sign in to your admin dashboard</p>
          </div>


          <form
            className="login-form"
            onSubmit={handleSubmit}
          >

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
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "🙈" : "👁"}
                </button>

              </div>

            </div>


            <div className="form-footer">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/forgot-password");
                }}
                className="forgot-link"
              >
                Forgot password?
              </a>
            </div>


            {error && (
              <p className="error-message">
                {error}
              </p>
            )}


            <button
              type="submit"
              className="login-btn"
            >
              Sign in
            </button>


          </form>

        </div>

      </div>
    </div>
  );
}
