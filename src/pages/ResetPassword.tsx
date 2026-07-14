import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import logo from "../assets/LogoNew.png";
import "../auth/Login.css";

export default function ResetPassword() {
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
        const res = await api.post("/api/admins/accept-invite", {
          token,
          newPassword,
        });

        setMessage(res.data.message);
      } else {
        const res = await api.post("/api/admin/reset-password", {
          token,
          newPassword,
        });

        setMessage(res.data.message);
      }

      setError("");

      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (err: any) {
      setError(
        err.response?.data?.error || "Failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p style={{ color: "#D43F25" }}>
          Invalid or missing token.
        </p>

        <a href="/login" style={{ color: "#7d5800" }}>
          Back to Login
        </a>
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

      <main
        className="login-right"
        style={{ justifyContent: "center", padding: "40px" }}
      >
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
            <div className="alert success">
              {message} Redirecting to login...
            </div>
          )}

          {error && (
            <div className="alert error">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="login-form"
            style={{ padding: 0 }}
          >

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
                👁
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


            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : isInvite
                ? "Activate Account"
                : "Reset Password"}
            </button>

          </form>


          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
              style={{
                color: "#7d5800",
                textDecoration: "none",
                fontSize: "0.9rem",
              }}
            >
              Back to Login
            </a>
          </div>

        </div>
      </main>
    </div>
  );
}