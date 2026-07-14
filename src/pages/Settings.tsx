import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import api from "../api/axios";
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

    if (!window.confirm("Are you sure you want to remove this admin?"))
      return;

    try {

      await api.delete(`/api/admins/${id}`);

      showMsg("Admin removed successfully!");

      fetchAdmins();

    } catch {

      showMsg("Failed to remove admin.", true);

    }
  };


  const EyeIcon = () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

        <div style={{ padding: "24px", maxWidth: "900px" }}>

          <Header title="Settings" />

          {message && <div className="alert success">{message}</div>}
          {error && <div className="alert error">{error}</div>}


          <div className="card">

            <h3 className="card-title">
              Change Password
            </h3>


            <form onSubmit={handlePasswordChange}>

              <input
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                placeholder="Current Password"
                onChange={(e)=>setCurrentPassword(e.target.value)}
              />

              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                placeholder="New Password"
                onChange={(e)=>setNewPassword(e.target.value)}
              />

              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                placeholder="Confirm Password"
                onChange={(e)=>setConfirmPassword(e.target.value)}
              />


              <button
                type="button"
                onClick={()=>setShowPassword(!showPassword)}
              >
                Toggle Password
              </button>


              <button className="btn">
                Change Password
              </button>

            </form>

          </div>


          <div className="card">

            <h3 className="card-title">
              Admin Management
            </h3>


            <table className="admin-table">

              <tbody>

              {admins.map(admin=>(

                <tr key={admin._id}>

                  <td>{admin.username}</td>
                  <td>{admin.email}</td>
                  <td>{admin.role}</td>

                  <td>
                    {admin.status || "Active"}
                  </td>


                  <td>
                    <button
                      className="btn danger"
                      onClick={()=>handleRemoveAdmin(admin._id)}
                    >
                      Remove
                    </button>
                  </td>

                </tr>

              ))}

              </tbody>

            </table>


            <form onSubmit={handleInviteAdmin}>

              <input
                value={newAdminName}
                placeholder="Username"
                onChange={(e)=>setNewAdminName(e.target.value)}
              />


              <input
                value={newAdminEmail}
                placeholder="Email"
                onChange={(e)=>setNewAdminEmail(e.target.value)}
              />


              <button className="btn">
                Send Invitation
              </button>


            </form>

          </div>


          <div className="card">

            <h3 className="card-title">
              Notification Preferences
            </h3>


            <label>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={()=>setEmailNotifications(!emailNotifications)}
              />
              Email Notifications
            </label>


            <label>
              <input
                type="checkbox"
                checked={donationAlerts}
                onChange={()=>setDonationAlerts(!donationAlerts)}
              />
              Donation Alerts
            </label>


            <label>
              <input
                type="checkbox"
                checked={userReportAlerts}
                onChange={()=>setUserReportAlerts(!userReportAlerts)}
              />
              User Report Alerts
            </label>


          </div>


          <div className="card">

            <h3 className="card-title">
              About
            </h3>

            <p>
              StrayCare Admin Dashboard v1.0.0
              <br />
              Built with React + Node.js + MongoDB
              <br />
              © 2026 StrayCare.
            </p>

          </div>


        </div>

      </main>

    </div>
  );
}