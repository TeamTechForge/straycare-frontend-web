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
    } catch (err) {
      console.error("Failed to fetch admin notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const toggleAudience = (value: string) => {
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
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </label>

              <button type="submit" className="send-btn">
                Send Notification &gt;
              </button>
            </form>
          </div>

          <div className="previous-notifications">
            <h3>Previously Sent Admin Notifications</h3>

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
          </div>
        </div>
      </main>
    </div>
  );
}

