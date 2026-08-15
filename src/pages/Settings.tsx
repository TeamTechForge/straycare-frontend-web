import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import api from "../api/axios";
import { confirmSensitiveAction } from "../utils/dashboardPreferences";
import "./Settings.css";

interface Admin {
  _id: string;
  username: string;
  email: string;
  role: string;
  status?: string;
}

export default function Settings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [admins, setAdmins] = useState<Admin[]>([]);

  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");

  const [sessionTimeout, setSessionTimeout] = useState(
    () => localStorage.getItem("dashboardSessionTimeout") || "30"
  );
  const [confirmActions, setConfirmActions] = useState(
    () => localStorage.getItem("dashboardConfirmActions") !== "false"
  );
  const [refreshInterval, setRefreshInterval] = useState(
    () => localStorage.getItem("dashboardRefreshInterval") || "0"
  );

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

  const showMsg = (msg: string, isError = false) => {
    if (isError) {
      setError(msg);
      setMessage("");
    } else {
      setMessage(msg);
      setError("");
    }

    setTimeout(() => {
      setMessage("");
      setError("");
    }, 3000);
  };

  const handlePasswordChange = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
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
      await api.patch("/api/admins/change-password", {
        currentPassword,
        newPassword,
      });

      showMsg("Password changed successfully!");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      showMsg(
        err.response?.data?.error || "Failed to change password.",
        true
      );
    }
  };

  const handleInviteAdmin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!newAdminName || !newAdminEmail) {
      return showMsg("Please fill in all fields.", true);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(newAdminEmail)) {
      return showMsg("Please enter a valid email address.", true);
    }

    try {
      await api.post("/api/admins/invite", {
        username: newAdminName,
        email: newAdminEmail,
      });

      showMsg("Invitation sent successfully!");

      setNewAdminName("");
      setNewAdminEmail("");
    } catch (err: any) {
      showMsg(
        err.response?.data?.error || "Failed to send invitation.",
        true
      );
    }
  };

  const handleRemoveAdmin = async (id: string) => {
    if (!confirmSensitiveAction("Are you sure you want to remove this admin?"))
      return;

    try {
      await api.delete(`/api/admins/${id}`);

      showMsg("Admin removed successfully!");

      fetchAdmins();
    } catch {
      showMsg("Failed to remove admin.", true);
    }
  };

  const notifyRuntime = () => {
    window.dispatchEvent(new Event("dashboard-preferences-changed"));
  };

  const updateSessionTimeout = (value: string) => {
    setSessionTimeout(value);
    localStorage.setItem("dashboardSessionTimeout", value);
    notifyRuntime();
  };

  const updateConfirmActions = (value: boolean) => {
    setConfirmActions(value);
    localStorage.setItem("dashboardConfirmActions", String(value));
  };

  const updateRefreshInterval = (value: string) => {
    setRefreshInterval(value);
    localStorage.setItem("dashboardRefreshInterval", value);
    notifyRuntime();
  };

  const EyeIcon = () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7"
      />
    </svg>
  );

  return (
    <div className="home-container">
      <Sidebar />

      <main className="main-content">
        <div className="settings-page settings-wrapper">
          <Header title="Settings" />

          {message && <div className="alert success">{message}</div>}
          {error && <div className="alert error">{error}</div>}

          <div className="card">
            <h3 className="card-title">Change Password</h3>

            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label>Current Password</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={currentPassword}
                    placeholder="Current Password"
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <EyeIcon />
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>New Password</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    placeholder="New Password"
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    placeholder="Confirm Password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button className="btn">Change Password</button>
            </form>
          </div>

          <div className="card">
            <h3 className="card-title">Admin Management</h3>

            <div className="admin-table-wrap">
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
                {admins.map((admin) => (
                  <tr key={admin._id}>
                    <td>{admin.username}</td>
                    <td>{admin.email}</td>
                    <td>
                      <span className="role-badge">{admin.role}</span>
                    </td>
                    <td>{admin.status || "Active"}</td>
                    <td>
                      <button
                        className="btn danger"
                        onClick={() => handleRemoveAdmin(admin._id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>

            <form onSubmit={handleInviteAdmin}>
              <div className="form-group">
                <label>Username</label>
                <input
                  value={newAdminName}
                  placeholder="Username"
                  onChange={(e) => setNewAdminName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  value={newAdminEmail}
                  placeholder="Email"
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                />
              </div>

              <button className="btn">Send Invitation</button>
            </form>
          </div>

          <div className="card">
            <h3 className="card-title">Dashboard Preferences</h3>

            <div className="preference-field">
              <label htmlFor="session-timeout">Automatic session timeout</label>
              <select
                id="session-timeout"
                value={sessionTimeout}
                onChange={(event) => updateSessionTimeout(event.target.value)}
              >
                <option value="15">After 15 minutes</option>
                <option value="30">After 30 minutes</option>
                <option value="60">After 1 hour</option>
                <option value="0">Never on this device</option>
              </select>
              <small>Log out after the selected period without activity.</small>
            </div>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={confirmActions}
                onChange={(event) => updateConfirmActions(event.target.checked)}
              />
              <span>
                <strong>Confirm sensitive actions</strong>
                <small>Ask before removing admins or moderating reported users.</small>
              </span>
            </label>

            <div className="preference-field">
              <label htmlFor="refresh-interval">Automatic data refresh</label>
              <select
                id="refresh-interval"
                value={refreshInterval}
                onChange={(event) => updateRefreshInterval(event.target.value)}
              >
                <option value="0">Manual refresh only</option>
                <option value="30">Every 30 seconds</option>
                <option value="60">Every 1 minute</option>
                <option value="300">Every 5 minutes</option>
              </select>
              <small>Reload the current page to retrieve the latest dashboard data.</small>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
