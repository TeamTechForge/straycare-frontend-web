import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import api from "../api/axios";
import { useConfirmation } from "../components/ConfirmationProvider";
import TablePagination from "../components/TablePagination";
import "./Settings.css";

interface Admin {
  _id: string;
  username: string;
  email: string;
  role: string;
  status?: string;
  createdAt?: string;
}

export default function Settings() {
  const confirm = useConfirmation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [adminSearch, setAdminSearch] = useState("");
  const [adminDate, setAdminDate] = useState("");
  const [adminPage, setAdminPage] = useState(1);
  const pageSize = 10;

  const filteredAdmins = admins.filter((admin) => {
    const query = adminSearch.trim().toLowerCase();
    const matchesSearch = !query || [admin.username, admin.email, admin.role, admin.status]
      .some((value) => String(value || "").toLowerCase().includes(query));
    const matchesDate = !adminDate || (admin.createdAt &&
      new Date(admin.createdAt).toLocaleDateString("en-CA") === adminDate);
    return matchesSearch && matchesDate;
  });
  const paginatedAdmins = filteredAdmins.slice((adminPage - 1) * pageSize, adminPage * pageSize);

  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");


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
    const confirmed = await confirm({
      title: "Remove administrator?",
      message: "This administrator will immediately lose access to the dashboard. This action cannot be undone.",
      confirmLabel: "Remove Admin",
      tone: "danger",
    });
    if (!confirmed) return;

    try {
      await api.delete(`/api/admins/${id}`);

      showMsg("Admin removed successfully!");

      fetchAdmins();
    } catch (err: any) {
      showMsg(err.response?.data?.error || "Failed to remove admin.", true);
    }
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

            <div className="table-filter-bar">
              <div className="table-search-input">
                <input type="search" placeholder="Search by username, email, role or status" value={adminSearch} onChange={(event) => {
                  setAdminSearch(event.target.value);
                  setAdminPage(1);
                }} />
              </div>
              <button type="button" className="dashboard-search-btn" onClick={() => setAdminSearch(adminSearch.trim())}>Search</button>
              <div className="table-date-filter">
                <label>Date</label>
                <input type="date" value={adminDate} onChange={(event) => {
                  setAdminDate(event.target.value);
                  setAdminPage(1);
                }} />
              </div>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAdmins.map((admin) => (
                  <tr key={admin._id}>
                    <td>{admin.username}</td>
                    <td>{admin.email}</td>
                    <td>
                      <span className="role-badge">{admin.role}</span>
                    </td>
                    <td>{admin.status || "Active"}</td>
                    <td>{admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "—"}</td>
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
              <TablePagination currentPage={adminPage} totalItems={filteredAdmins.length} pageSize={pageSize} onPageChange={setAdminPage} />
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

        </div>
      </main>
    </div>
  );
}
