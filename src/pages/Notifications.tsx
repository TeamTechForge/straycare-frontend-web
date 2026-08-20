import { useState, useEffect } from "react";
import "./Notifications.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import api from "../api/axios";

interface Notification {
  _id: string;
  title: string;
  message: string;
  audience: string[] | string;
  createdAt: string;
}

const AUDIENCE_OPTIONS = [
  { value: "general_user", label: "General Users" },
  { value: "volunteer", label: "Volunteers" },
  { value: "vet", label: "Vets" },
  { value: "ngo", label: "NGOs" },
  { value: "admin", label: "Admins" },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [title, setTitle] = useState<string>("");
  const [audience, setAudience] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/api/admin-notifications");
      setNotifications(res.data);

      // Visiting this page also marks admin-targeted announcements as seen.
      const adminNotifications = (res.data || []).filter((n: Notification) =>
        Array.isArray(n.audience)
          ? n.audience.includes("admin")
          : n.audience === "Admins"
      );
      if (adminNotifications.length > 0) {
        const newestTimestamp = Math.max(
          ...adminNotifications.map((n: Notification) => new Date(n.createdAt).getTime())
        );
        const adminId = localStorage.getItem("adminId") || "current";
        localStorage.setItem(
          `adminNotificationsLastSeen:${adminId}`,
          new Date(newestTimestamp).toISOString()
        );
      }
    } catch (err) {
      console.error("Failed to fetch admin notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const toggleAudience = (value: string) => {
    // An empty selection represents the All Users option.
    setAudience((prev) =>
      prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await api.post("/api/admin-notifications", {
        title,
        audience,
        message,
      });

      setTitle("");
      setAudience([]);
      setMessage("");

      fetchNotifications();
    } catch (err) {
      console.error("Failed to send admin notification:", err);
    }
  };

  const formatAudience = (audience: string[] | string) => {
    // Convert stored audience keys into readable labels for the sent list.
    if (!audience || (Array.isArray(audience) && audience.length === 0)) {
      return "All Users";
    }

    if (!Array.isArray(audience)) {
      return audience;
    }

    return audience
      .map((a) => AUDIENCE_OPTIONS.find((opt) => opt.value === a)?.label || a)
      .join(", ");
  };

  return (
    <div className="home-container">
      <Sidebar />

      <main className="main-content">
        <div className="notifications-page notifications-container">
          <Header title="Admin Notifications" />

          <div className="notifications-grid">
          <section className="create-notification">
            <div className="notification-section-heading">
              <h3>Create notification</h3>
              <p>Send an announcement to selected StrayCare users.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <label>
                Notification Title
                <input
                  type="text"
                  placeholder="Enter a clear notification title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </label>

              <label>
                Target Audience

                <div className="audience-checkboxes">
                  <label className="audience-option">
                    <input
                      type="checkbox"
                      checked={audience.length === 0}
                      onChange={() => setAudience([])}
                    />
                    All Users
                  </label>

                  {AUDIENCE_OPTIONS.map((opt) => (
                    <label className="audience-option" key={opt.value}>
                      <input
                        type="checkbox"
                        checked={audience.includes(opt.value)}
                        onChange={() => toggleAudience(opt.value)}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </label>

              <label>
                Message Content
                <textarea
                  placeholder="Write the notification message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </label>

              <button type="submit" className="send-btn">
                Send notification
              </button>
            </form>
          </section>

          <section className="previous-notifications">
            <div className="notification-section-heading">
              <h3>Sent notifications</h3>
              <p>Review announcements sent from the dashboard.</p>
            </div>

            {notifications.length === 0 ? (
              <p>No admin notifications sent yet.</p>
            ) : (
              <ul>
                {notifications.map((n: Notification) => (
                  <li key={n._id} className="notification-item">
                    <strong>{n.title}</strong> — {n.message}

                    <span style={{ color: "#777", marginLeft: "10px" }}>
                      ({formatAudience(n.audience)})
                    </span>

                    <br />

                    <small>
                      {new Date(n.createdAt).toLocaleString()}
                    </small>
                  </li>
                ))}
              </ul>
            )}
          </section>
          </div>
        </div>
      </main>
    </div>
  );
}

