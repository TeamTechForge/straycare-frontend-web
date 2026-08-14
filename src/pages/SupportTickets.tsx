import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import api from "../api/axios";
import "./SupportTickets.css";

interface Ticket {
  _id: string;
  userId?: {
    name?: string;
    email?: string;
  };
  category: string;
  subject: string;
  message: string;
  status: "Pending" | "In Progress" | "Resolved" | "Closed";
  adminReply?: string;
  createdAt: string;
}

export default function SupportTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get("/api/support");
      setTickets(res.data);
    } catch (err) {
      console.error("Failed to fetch support tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: Ticket["status"]) => {
    setUpdatingId(id);
    try {
      await api.patch(`/api/support/${id}`, { status });
      setTickets((prev) =>
        prev.map((t) => (t._id === id ? { ...t, status } : t))
      );
    } catch (err) {
      console.error("Failed to update ticket status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSendReply = async (id: string) => {
    const reply = replyDrafts[id];
    if (!reply || !reply.trim()) return;

    setUpdatingId(id);
    try {
      await api.patch(`/api/support/${id}`, {
        adminReply: reply.trim(),
        status: "In Progress",
      });
      setTickets((prev) =>
        prev.map((t) =>
          t._id === id
            ? { ...t, adminReply: reply.trim(), status: "In Progress" }
            : t
        )
      );
      setReplyDrafts((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      console.error("Failed to send reply:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Pending":
        return { backgroundColor: "#FEF3C7", color: "#D97706" };
      case "In Progress":
        return { backgroundColor: "#DBEAFE", color: "#2563EB" };
      case "Resolved":
        return { backgroundColor: "#DCFCE7", color: "#16A34A" };
      case "Closed":
        return { backgroundColor: "#F3F4F6", color: "#6B7280" };
      default:
        return { backgroundColor: "#F3F4F6", color: "#6B7280" };
    }
  };

  return (
    <div className="home-container">
      <Sidebar />

      <main className="main-content">
        <div className="support-page support-container">
          <Header title="Support Tickets" />

          {loading ? (
            <p>Loading support tickets...</p>
          ) : tickets.length === 0 ? (
            <div className="empty-state">
              <p>No support tickets found.</p>
            </div>
          ) : (
            <div className="tickets-list">
              {tickets.map((ticket) => (
                <div className="ticket-card" key={ticket._id}>
                  <div className="ticket-header">
                    <div>
                      <span className="ticket-category">{ticket.category}</span>
                      <h3 className="ticket-subject">{ticket.subject}</h3>
                    </div>

                    <span
                      className="status-badge"
                      style={getStatusStyle(ticket.status)}
                    >
                      {ticket.status}
                    </span>
                  </div>

                  <p className="ticket-meta">
                    From {ticket.userId?.name || "Unknown user"}
                    {ticket.userId?.email ? ` (${ticket.userId.email})` : ""} ·{" "}
                    {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </p>

                  <p className="ticket-message">{ticket.message}</p>

                  {ticket.adminReply && (
                    <div className="admin-reply">
                      <span className="admin-reply-label">Your reply:</span>
                      <p>{ticket.adminReply}</p>
                    </div>
                  )}

                  <div className="ticket-actions">
                    <select
                      value={ticket.status}
                      disabled={updatingId === ticket._id}
                      onChange={(e) =>
                        handleStatusChange(
                          ticket._id,
                          e.target.value as Ticket["status"]
                        )
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Type a reply..."
                      value={replyDrafts[ticket._id] || ""}
                      onChange={(e) =>
                        setReplyDrafts((prev) => ({
                          ...prev,
                          [ticket._id]: e.target.value,
                        }))
                      }
                    />

                    <button
                      className="reply-btn"
                      disabled={updatingId === ticket._id}
                      onClick={() => handleSendReply(ticket._id)}
                    >
                      Send Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}