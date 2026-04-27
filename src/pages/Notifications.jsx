import { useState, useEffect } from "react";
import "./Notifications.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import api from "../api/axios";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState("All Users");
  const [message, setMessage] = useState("");

  // Fetch notifications from admin_notifications collection
  const fetchNotifications = async () => {
    try {
      const res = await api.get("/api/admin-notifications"); 
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch admin notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Submit admin notification
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/admin-notifications", { title, audience, message }); 
      setTitle("");
      setAudience("All Users");
      setMessage("");
      fetchNotifications(); // refresh list
    } catch (err) {
      console.error("Failed to send admin notification:", err);
    }
  };

  return (
    <div className="home-container">
      <Sidebar />
      <main className="main-content">
        <div className="notifications-container">
          <Header title="Admin Notifications" />

          {/* Create New Admin Notification Form */}
          <div className="create-notification">
            <h3>Create New Admin Notification</h3>
            <form onSubmit={handleSubmit}>
              <label>
                Notification Title
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </label>

              <label>
                Target Audience
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                >
                  <option>All Users</option>
                  <option>Admins</option>
                  <option>Volunteers</option>
                </select>
              </label>

              <label>
                Message Content
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>
              </label>

              <button type="submit" className="send-btn">
                Send Notification &gt;
              </button>
            </form>
          </div>

          {/* Previously Sent Admin Notifications */}
          <div className="previous-notifications">
            <h3>Previously Sent Admin Notifications</h3>
            {notifications.length === 0 ? (
              <p>No admin notifications sent yet.</p>
            ) : (
              <ul>
                {notifications.map((n) => (
                  <li key={n._id}>
                    <strong>{n.title}</strong> — {n.message}
                    <span style={{ color: "#777", marginLeft: "10px" }}>
                      ({n.audience})
                    </span>
                    <br />
                    <small>{new Date(n.createdAt).toLocaleString()}</small>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


