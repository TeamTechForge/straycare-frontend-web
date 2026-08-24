import "../auth/Login.css";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import logo from "../assets/LogoNew.png";

export default function ResetPassword() {
  const [resetCode, setResetCode] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");
  const type = searchParams.get("type");

  const isInvite = type === "invite";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isInvite && !resetCode) {
      setError("Please enter the 6-digit reset code.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,15}$/.test(newPassword)) {
      setError("Must be 8-15 chars, with at least 1 uppercase and 1 symbol.");
      return;
    }

    try {
      setLoading(true);

      const payloadToken = isInvite ? token : resetCode;

      const res = isInvite
        ? await api.post("/api/admins/accept-invite", { token: payloadToken, newPassword })
        : await api.post("/api/admin/reset-password", { token: payloadToken, newPassword });

      setMessage(res.data.message);
      setError("");

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isInvite && !token) {
    return (
      <div className="login-page">
        <div className="login-card auth-card">
          <div className="card-form" style={{ flex: 1, textAlign: "center" }}>
            <p className="error-message">Invalid or missing invite token.</p>
            
              <a href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
              className="forgot-link"
            >
              Back to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card auth-card">
        <div className="card-form" style={{ flex: 1 }}>
          <div className="logo-wrap">
            <img src={logo} alt="StrayCare Logo" />
          </div>

          <div className="login-heading">
            <h1>{isInvite ? "Set Your Password" : "Reset Password"}</h1>
            <p>
              {isInvite
                ? "Welcome! Set a password to activate your admin account."
                : "Enter the 6-digit code sent to your email and your new password below."}
            </p>
          </div>

          {message && <p className="success-message">{message} Redirecting to login...</p>}
          {error && <p className="error-message">{error}</p>}

          <form className="login-form" onSubmit={handleSubmit}>
            {!isInvite && (
              <div className="input-group">
                <label>6-Digit Reset Code</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  maxLength={6}
                />
              </div>
            )}

            <div className="input-group">
              <label>New Password</label>
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M3 3l18 18M10.6 10.7a2 2 0 002.7 2.7M9.9 4.2A10.8 10.8 0 0112 4c5.5 0 9 5.5 9 5.5a15.8 15.8 0 01-2.1 2.6M6.2 6.2C4.2 7.6 3 9.5 3 9.5S6.5 15 12 15c1 0 2-.2 2.8-.5" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M3 12s3.5-5.5 9-5.5 9 5.5 9 5.5-3.5 5.5-9 5.5S3 12 3 12z" />
                      <circle cx="12" cy="12" r="2.5" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Please wait..." : isInvite ? "Activate Account" : "Reset Password"}
            </button>
          </form>

          <div className="form-footer" style={{ justifyContent: "center", marginTop: "12px" }}>
            
              <a href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
              className="forgot-link"
            >
              Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
