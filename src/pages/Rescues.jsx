import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "./Rescues.css";
import api from "../api/axios";

export default function Rescues() {
  const [rescues, setRescues] = useState([]);
  const [filteredRescues, setFilteredRescues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    fetchRescues();
  }, []);

  useEffect(() => {
    let filtered = rescues;
    if (statusFilter) {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    if (dateFilter) {
      filtered = filtered.filter(r =>
        r.createdAt && new Date(r.createdAt).toISOString().startsWith(dateFilter)
      );
    }
    setFilteredRescues(filtered);
  }, [statusFilter, dateFilter, rescues]);

  async function fetchRescues() {
    try {
      const response = await api.get("/api/rescue-cases");
      setRescues(response.data);
      setFilteredRescues(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleReset = () => {
    setStatusFilter("");
    setDateFilter("");
    setFilteredRescues(rescues);
  };

  // Real statuses in the data: "pending", "completed", "rejected"
  const totalCases = rescues.length;
  const pending = rescues.filter(r => r.status === "pending").length;
  const completed = rescues.filter(r => r.status === "completed").length;

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending": return { backgroundColor: "#FEF3C7", color: "#D97706" };
      case "completed": return { backgroundColor: "#DCFCE7", color: "#16A34A" };
      case "rejected": return { backgroundColor: "#FCDCDD", color: "#D43F25" };
      default: return { backgroundColor: "#F3F4F6", color: "#6B7280" };
    }
  };

  return (
    <div className="home-container">
      <Sidebar />
      <main className="main-content">
        <div className="rescues-container">
          <Header title="Rescue Case Overview" />

          {/* KPI Cards */}
          <div className="kpi-cards">
            <div className="kpi-card">
              <div>
                <p className="kpi-label">Total Cases</p>
                <p className="kpi-value">{totalCases}</p>
              </div>
            </div>
            <div className="kpi-card">
              <div>
                <p className="kpi-label">Pending Assignments</p>
                <p className="kpi-value">{pending}</p>
              </div>
            </div>
            <div className="kpi-card">
              <div>
                <p className="kpi-label">Completed</p>
                <p className="kpi-value">{String(completed).padStart(2, "0")}</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="filter-box">
            <p className="filter-title">Filter Cases</p>
            <div className="filter-row">
              <div className="filter-field">
                <label>Date:</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
              <div className="filter-field">
                <label>Status:</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <button className="reset-btn" onClick={handleReset}>Reset Filters</button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <p>Loading rescues...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : (
            <div className="table-box">
              <table className="rescues-table">
                <thead>
                  <tr>
                    <th>RESCUE ID</th>
                    <th>ANIMAL TYPE</th>
                    <th>STATUS</th>
                    <th>REPORTER</th>
                    <th>LOCATION</th>
                    <th>DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRescues.length > 0 ? (
                    filteredRescues.map((rescue) => (
                      <tr key={rescue._id}>
                        <td style={{ fontFamily: "monospace", fontWeight: "bold" }}>
                          #{rescue.caseId || rescue._id.slice(-6).toUpperCase()}
                        </td>
                        <td>🐾 {rescue.animalType || "Unknown"}</td>
                        <td>
                          <span style={{
                            ...getStatusStyle(rescue.status),
                            padding: "4px 12px",
                            borderRadius: "9999px",
                            fontWeight: "600",
                            fontSize: "12px",
                          }}>
                            {rescue.status}
                          </span>
                        </td>
                        <td>{rescue.reporterName || "Anonymous"}</td>
                        <td style={{ fontSize: "12px", color: "#6B7280" }}>
                          {rescue.rescueLocation?.address || rescue.reporterLocation?.address || "—"}
                        </td>
                        <td>{rescue.createdAt ? new Date(rescue.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "—"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                        No rescue cases found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="pagination-row">
                <span>Showing {filteredRescues.length} of {rescues.length} cases</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

