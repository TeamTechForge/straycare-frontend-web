import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import NavTabs from "../components/NavTabs";
import LoadingState from "../components/LoadingState";
import api from "../api/axios";
import { useConfirmation } from "../components/ConfirmationProvider";
import TablePagination from "../components/TablePagination";
import "./ReportedUsers.css";

export default function ReportedUsers() {
  const confirm = useConfirmation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState(null);
  const [reviewingUserId, setReviewingUserId] = useState(null);
  const [reviewingReportId, setReviewingReportId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

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

    if (action !== "Dismiss") {
      const confirmed = await confirm({
        title: `${action} user?`,
        message: confirmMsg,
        confirmLabel: action === "Suspend" ? "Suspend User" : "Warn User",
        tone: action === "Suspend" ? "danger" : "warning",
      });
      if (!confirmed) return;
    }

    setActingOn(report._id);
    try {
      await api.patch(`/api/moderation/user/${report.reportedUserId}/action`, {
        action,
        reportId: report._id,
      });
      setReports(prev =>
        prev.map(r => (r._id === report._id ? { ...r, status: "Resolved" } : r))
      );
      if (action === "Suspend") setReviewingUserId(null);
    } catch (err) {
      console.error(`Failed to ${action} user:`, err);
      const backendMessage = err?.response?.data?.error || err?.response?.data?.message;
      alert(backendMessage || `Failed to ${action.toLowerCase()} user. Please try again.`);
    } finally {
      setActingOn(null);
    }
  };

  const pendingFirst = (first, second) => {
    const firstPending = first.status?.toLowerCase() === "pending";
    const secondPending = second.status?.toLowerCase() === "pending";
    if (firstPending !== secondPending) return firstPending ? -1 : 1;
    return new Date(second.createdAt || 0).getTime() - new Date(first.createdAt || 0).getTime();
  };
  const filteredReports = reports.filter((report) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || [
      report.reportedUserId,
      report.reporterUserId,
      report.reason,
      report.description,
      report.status,
    ].some((value) => String(value || "").toLowerCase().includes(query));
    const matchesDate = !dateFilter || (report.createdAt &&
      new Date(report.createdAt).toLocaleDateString("en-CA") === dateFilter);
    return matchesSearch && matchesDate;
  });
  const sortedReports = [...filteredReports].sort(pendingFirst);
  const paginatedReports = sortedReports.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const selectedUserReports = reviewingUserId
    ? reports.filter((report) => report.reportedUserId === reviewingUserId).sort(pendingFirst)
    : [];
  const pendingSelectedReports = selectedUserReports.filter(
    (report) => report.status?.toLowerCase() === "pending"
  );
  const selectedReport = selectedUserReports.find((report) => report._id === reviewingReportId);
  const canSuspend = pendingSelectedReports.length > 0;

  return (
    <div className="home-container">
      <Sidebar />
      <main className="main-content">
        <div className="reported-users-page reported-users-container">
          <Header title="Reported Users & Posts" />

          <NavTabs
            tabs={[
              { label: "Reported Users", to: "/reports/users" },
              { label: "Reported Posts", to: "/reports/posts" },
            ]}
          />

          <div className="table-filter-bar">
            <div className="table-search-input">
              <input
                type="search"
                placeholder="Search by user ID, reporter ID, reason, description or status"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <button className="dashboard-search-btn" onClick={() => setSearchQuery(searchQuery.trim())}>Search</button>
            <div className="table-date-filter">
              <label>Date</label>
              <input type="date" value={dateFilter} onChange={(event) => {
                setDateFilter(event.target.value);
                setCurrentPage(1);
              }} />
            </div>
          </div>

          {loading ? (
            <LoadingState label="Loading reports..." />
          ) : filteredReports.length === 0 ? (
            <div className="empty-state">
              <p>No reported users or posts found.</p>
            </div>
          ) : (
            <div className="reports-table-box">
              <table className="reports-table">
                <thead>
                  <tr>
                    {["Reported User ID", "Reports", "Reason", "Description", "Reported By ID", "Date", "Status", "Actions"].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedReports.map((r) => {
                    const isResolved = r.status?.toLowerCase() === "resolved";
                    const isBusy = actingOn === r._id;
                    const reportCount = reports.filter(
                      (report) => report.reportedUserId === r.reportedUserId
                    ).length;
                    return (
                      <tr key={r._id}>
                        <td className="mono-id">{r.reportedUserId || "N/A"}</td>
                        <td><span className="report-count-badge">{reportCount}</span></td>
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
                          <button
                            disabled={isBusy}
                            onClick={() => {
                              setReviewingUserId(r.reportedUserId);
                              setReviewingReportId(r._id);
                            }}
                            className="action-btn btn-review"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <TablePagination currentPage={currentPage} totalItems={sortedReports.length} pageSize={pageSize} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>
      </main>

      {reviewingUserId && (
        <div className="user-review-backdrop" onMouseDown={() => setReviewingUserId(null)}>
          <section className="user-review-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <button className="user-review-close" aria-label="Close" onClick={() => setReviewingUserId(null)}>×</button>
            <h2>Review Reported User</h2>
            <p className="review-user-id">User ID: {reviewingUserId}</p>
            <div className="review-summary">
              <span>{selectedUserReports.length} total reports</span>
            </div>

            <div className="review-report-list">
              {selectedUserReports.map((report) => {
                return (
                  <article className="review-report-card" key={report._id}>
                    <div><strong>{report.reason || "No reason"}</strong><span>{report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "—"}</span></div>
                    <p>{report.description || "No additional description."}</p>
                    <small>Reported by: {report.reporterUserId || "Unknown"}</small>
                  </article>
                );
              })}
            </div>

            <div className="review-actions">
              <button
                disabled={!selectedReport || selectedReport.status?.toLowerCase() !== "pending" || actingOn !== null}
                onClick={() => handleAction(selectedReport, "Dismiss")}
                className="action-btn btn-dismiss"
              >Dismiss Report</button>
              <button
                disabled={!pendingSelectedReports.length || actingOn !== null}
                onClick={() => handleAction(pendingSelectedReports[0], "Warn")}
                className="action-btn btn-warn"
              >Warn User</button>
              <button
                disabled={!canSuspend || actingOn !== null}
                onClick={() => handleAction(pendingSelectedReports[0], "Suspend")}
                className="action-btn btn-suspend"
                title={canSuspend ? "" : "No pending reports available"}
              >Suspend User</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
