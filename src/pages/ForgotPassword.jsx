import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import logo from "../assets/LogoNew.png";
import "../auth/Login.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    try {
      setLoading(true);
      const res = await api.post("/api/admin/forgot-password", { email });
      setMessage(res.data.message);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <section className="login-left">
        <div className="logo-circle">
          <img src={logo} alt="StrayCare Logo" />
        </div>
      </section>

      <main className="login-right" style={{ justifyContent: "center", padding: "40px" }}>
        <div style={{ maxWidth: "400px", width: "100%", margin: "0 auto" }}>
          <h2 style={{ color: "#412828", marginBottom: "8px" }}>Forgot Password</h2>
          <p style={{ color: "#514532", marginBottom: "24px" }}>
            Enter your admin email and we'll send you a reset link.
          </p>

          {message && (
            <div style={{
              background: "#DCFCE7", color: "#16A34A", padding: "12px 16px",
              borderRadius: "8px", marginBottom: "16px", fontWeight: "600"
            }}>
              {message}
            </div>
          )}

          {error && (
            <div style={{
              background: "#FCDCDD", color: "#D43F25", padding: "12px 16px",
              borderRadius: "8px", marginBottom: "16px", fontWeight: "600"
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form" style={{ padding: 0 }}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); navigate("/login"); }}
              style={{ color: "#7d5800", textDecoration: "none", fontSize: "0.9rem" }}
            >
              Back to Login
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
