import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import api from "../api/axios";
import "./Settings.css";

export default function Settings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [admins, setAdmins] = useState([]);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [donationAlerts, setDonationAlerts] = useState(true);
  const [userReportAlerts, setUserReportAlerts] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await api.get("/api/admins");
      setAdmins(res.data);
    } catch (err) {
      console.error("Failed to fetch admins:", err);
    }
  };

  const showMsg = (msg, isError = false) => {
    if (isError) { setError(msg); setMessage(""); }
    else { setMessage(msg); setError(""); }
    setTimeout(() => { setMessage(""); setError(""); }, 3000);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      return showMsg("Please fill in all password fields.", true);
    }
    if (newPassword !== confirmPassword) {
      return showMsg("New passwords do not match.", true);
    }
    if (newPassword.length < 6) {
      return showMsg("Password must be at least 6 characters.", true);
    }
    try {
      await api.patch("/api/admins/change-password", { currentPassword, newPassword });
      showMsg("Password changed successfully!");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      showMsg(err.response?.data?.error || "Failed to change password.", true);
    }
  };

  const handleInviteAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminName || !newAdminEmail) {
      return showMsg("Please fill in all fields.", true);
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newAdminEmail)) {
      return showMsg("Please enter a valid email address.", true);
    }

    // Minimum username length
    if (newAdminName.trim().length < 3) {
      return showMsg("Username must be at least 3 characters.", true);
    }

    try {
      await api.post("/api/admins/invite", { username: newAdminName, email: newAdminEmail });
      showMsg("Invitation sent successfully!");
      setNewAdminName(""); setNewAdminEmail("");
    } catch (err) {
      showMsg(err.response?.data?.error || "Failed to send invitation.", true);
    }
  };

  const handleRemoveAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to remove this admin?")) return;
    try {
      await api.delete(`/api/admins/${id}`);
      showMsg("Admin removed successfully!");
      fetchAdmins();
    } catch (err) {
      showMsg("Failed to remove admin.", true);
    }
  };

  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
    </svg>
  );

  return (
    <div className="home-container">
      <Sidebar />
      <main className="main-content">
        <div style={{ padding: "24px", maxWidth: "900px" }}>
          <Header title="Settings" />

          {message && <div className="alert success">{message}</div>}
          {error && <div className="alert error">{error}</div>}

          {/* Change Password */}
          <div className="card" style={{ marginBottom: "24px" }}>
            <h3 className="card-title">Change Password</h3>
            <form onSubmit={handlePasswordChange}>
              {[
                { label: "Current Password", value: currentPassword, set: setCurrentPassword, placeholder: "Enter current password" },
                { label: "New Password", value: newPassword, set: setNewPassword, placeholder: "Enter new password" },
                { label: "Confirm New Password", value: confirmPassword, set: setConfirmPassword, placeholder: "Confirm new password" },
              ].map((field) => (
                <div className="form-group" key={field.label}>
                  <label>{field.label}</label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={field.value}
                      onChange={(e) => field.set(e.target.value)}
                      placeholder={field.placeholder}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
              ))}
              <button type="submit" className="btn">Change Password</button>
            </form>
          </div>

          {/* Admin Management */}
          <div className="card" style={{ marginBottom: "24px" }}>
            <h3 className="card-title">Admin Management</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                      No admins found.
                    </td>
                  </tr>
                ) : (
                  admins.map((admin) => (
                    <tr key={admin._id}>
                      <td>{admin.username}</td>
                      <td>{admin.email}</td>
                      <td><span className="role-badge">{admin.role.toUpperCase()}</span></td>
                      <td>
                        <span style={{
                          padding: "3px 10px", borderRadius: "9999px",
                          fontSize: "12px", fontWeight: "600",
                          background: admin.status === "active" || !admin.status ? "#DCFCE7" : "#FEF9C3",
                          color: admin.status === "active" || !admin.status ? "#16A34A" : "#854D0E",
                        }}>
                          {admin.status === "pending" ? "Pending" : "Active"}
                        </span>
                      </td>
                      <td>
                        <button className="btn danger" onClick={() => handleRemoveAdmin(admin._id)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "16px", marginTop: "8px" }}>
              <h4 style={{ marginBottom: "12px", color: "#555" }}>Invite New Admin</h4>
              <form onSubmit={handleInviteAdmin}>
                <div className="form-group">
                  <label>Username</label>
                  <input
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    placeholder="Enter username"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="Enter email"
                  />
                </div>
                <button type="submit" className="btn">Send Invitation</button>
              </form>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="card" style={{ marginBottom: "24px" }}>
            <h3 className="card-title">Notification Preferences</h3>
            {[
              { label: "Email Notifications", desc: "Receive general email notifications", value: emailNotifications, set: setEmailNotifications },
              { label: "Donation Alerts", desc: "Get notified when a donation is made", value: donationAlerts, set: setDonationAlerts },
              { label: "User Report Alerts", desc: "Get notified when a user is reported", value: userReportAlerts, set: setUserReportAlerts },
            ].map((pref) => (
              <div key={pref.label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 0", borderBottom: "1px solid #f0f0f0"
              }}>
                <div>
                  <p style={{ fontWeight: "600", fontSize: "14px", color: "#333", margin: 0 }}>{pref.label}</p>
                  <p style={{ fontSize: "12px", color: "#888", margin: "2px 0 0" }}>{pref.desc}</p>
                </div>
                <div onClick={() => pref.set(!pref.value)} style={{
                  width: "44px", height: "24px", borderRadius: "9999px",
                  background: pref.value ? "#F5A623" : "#ddd",
                  cursor: "pointer", position: "relative", transition: "background 0.2s",
                  flexShrink: 0,
                }}>
                  <div style={{
                    position: "absolute", top: "3px",
                    left: pref.value ? "22px" : "3px",
                    width: "18px", height: "18px",
                    borderRadius: "50%", background: "#fff",
                    transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* About */}
          <div className="card">
            <h3 className="card-title">About</h3>
            <p className="about-text">
              StrayCare Admin Dashboard v1.0.0<br />
              Built with React + Node.js + MongoDB<br />
              © 2026 StrayCare. All rights reserved.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}