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

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
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
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁"}
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
