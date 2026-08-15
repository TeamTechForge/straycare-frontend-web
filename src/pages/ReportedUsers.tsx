import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import NavTabs from "../components/NavTabs";
import LoadingState from "../components/LoadingState";
import api from "../api/axios";
import { confirmSensitiveAction } from "../utils/dashboardPreferences";
import "./ReportedUsers.css";

export default function ReportedUsers() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get("/api/admin/reported-users").catch(() => ({ data: [] }));
      setReports(res.data || []);
    } catch (err) {
      console.error("Error fetching reported users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (report, action) => {
    const confirmMsg =
      action === "Suspend"
        ? "Are you sure you want to suspend this user's account?"
        : action === "Warn"
        ? "Send a warning and resolve this report?"
        : "Dismiss this report? No action will be taken on the user.";

    if (action !== "Dismiss" && !confirmSensitiveAction(confirmMsg)) return;

    setActingOn(report._id);
    try {
      await api.patch(`/api/moderation/user/${report.reportedUserId}/action`, {
        action,
        reportId: report._id,
      });
      setReports(prev =>
        prev.map(r => (r._id === report._id ? { ...r, status: "Resolved" } : r))
      );
    } catch (err) {
      console.error(`Failed to ${action} user:`, err);
      alert(`Failed to ${action.toLowerCase()} user. Please try again.`);
    } finally {
      setActingOn(null);
    }
  };

  return (
    <div className="home-container">
      <Sidebar />
      <main className="main-content">
        <div className="reported-users-page reported-users-container">
          <Header title="Reported Users & Posts" />

          <NavTabs
            tabs={[
              { label: "Reported Users", to: "/reports/users" },
              { label: "Reported Posts", disabled: true },
            ]}
          />

          {loading ? (
            <LoadingState label="Loading reports..." />
          ) : reports.length === 0 ? (
            <div className="empty-state">
              <p>No reported users or posts found.</p>
            </div>
          ) : (
            <div className="reports-table-box">
              <table className="reports-table">
                <thead>
                  <tr>
                    {["Reported User ID", "Reason", "Description", "Reported By ID", "Date", "Status", "Actions"].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => {
                    const isResolved = r.status === "Resolved";
                    const isBusy = actingOn === r._id;
                    return (
                      <tr key={r._id}>
                        <td className="mono-id">{r.reportedUserId || "N/A"}</td>
                        <td>{r.reason || "N/A"}</td>
                        <td className="report-description">{r.description || "—"}</td>
                        <td className="mono-id">{r.reporterUserId || "N/A"}</td>
                        <td>
                          {r.createdAt
                            ? new Date(r.createdAt).toLocaleDateString("en-US", {
                                month: "short", day: "2-digit", year: "numeric"
                              })
                            : "—"}
                        </td>
                        <td>
                          <span className={`status-badge ${isResolved ? "status-resolved" : "status-pending"}`}>
                            {r.status || "Pending"}
                          </span>
                        </td>
                        <td>
                          {isResolved ? (
                            <span className="resolved-label">Resolved</span>
                          ) : (
                            <div className="action-buttons">
                              <button
                                disabled={isBusy}
                                onClick={() => handleAction(r, "Dismiss")}
                                className="action-btn btn-dismiss"
                              >
                                Dismiss
                              </button>
                              <button
                                disabled={isBusy}
                                onClick={() => handleAction(r, "Warn")}
                                className="action-btn btn-warn"
                              >
                                Warn
                              </button>
                              <button
                                disabled={isBusy}
                                onClick={() => handleAction(r, "Suspend")}
                                className="action-btn btn-suspend"
                              >
                                Suspend
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
