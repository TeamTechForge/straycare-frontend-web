import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import logo from "../assets/LogoNew.png";
import "../auth/Login.css";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const type = searchParams.get("type"); // "invite" or null (forgot password)

  const isInvite = type === "invite";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    try {
      setLoading(true);

      if (isInvite) {
        // Accept invite flow
        const res = await api.post("/api/admins/accept-invite", { token, newPassword });
        setMessage(res.data.message);
      } else {
        // Forgot password flow
        const res = await api.post("/api/admin/reset-password", { token, newPassword });
        setMessage(res.data.message);
      }

      setError("");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p style={{ color: "#D43F25" }}>Invalid or missing token.</p>
        <a href="/login" style={{ color: "#7d5800" }}>Back to Login</a>
      </div>
    );
  }

  return (
    <div className="login-container">
      <section className="login-left">
        <div className="logo-circle">
          <img src={logo} alt="StrayCare Logo" />
        </div>
      </section>

      <main className="login-right" style={{ justifyContent: "center", padding: "40px" }}>
        <div style={{ maxWidth: "400px", width: "100%", margin: "0 auto" }}>
          <h2 style={{ color: "#412828", marginBottom: "8px" }}>
            {isInvite ? "Set Your Password" : "Reset Password"}
          </h2>
          <p style={{ color: "#514532", marginBottom: "24px" }}>
            {isInvite
              ? "Welcome! Set a password to activate your admin account."
              : "Enter your new password below."}
          </p>

          {message && (
            <div style={{
              background: "#DCFCE7", color: "#16A34A", padding: "12px 16px",
              borderRadius: "8px", marginBottom: "16px", fontWeight: "600"
            }}>
              {message} Redirecting to login...
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
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Please wait..." : isInvite ? "Activate Account" : "Reset Password"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "16px" }}>
            
              <a href="#"
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
