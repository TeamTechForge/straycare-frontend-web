import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import LoadingState from "../components/LoadingState";
import "./Rescues.css";
import api from "../api/axios";
import TablePagination from "../components/TablePagination";

interface Rescue {
  _id: string;
  caseId?: string;
  animalType?: string;
  status: string;
  reporterName?: string;
  reporterLocation?: {
    address?: string;
  };
  rescueLocation?: {
    address?: string;
  };
  createdAt?: string;
}

export default function Rescues() {
  const [rescues, setRescues] = useState<Rescue[]>([]);
  const [filteredRescues, setFilteredRescues] = useState<Rescue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const paginatedRescues = filteredRescues.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    fetchRescues();
  }, []);

  useEffect(() => {
    // Recalculate the visible table whenever a filter or source record changes.
    let filtered = rescues;

    if (statusFilter) {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter(
        (r) =>
          r.createdAt &&
          new Date(r.createdAt).toISOString().startsWith(dateFilter)
      );
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter((rescue) => {
        const address = rescue.rescueLocation?.address || rescue.reporterLocation?.address || "";
        return (
          rescue._id.toLowerCase().includes(query) ||
          rescue.caseId?.toLowerCase().includes(query) ||
          rescue.animalType?.toLowerCase().includes(query) ||
          rescue.reporterName?.toLowerCase().includes(query) ||
          address.toLowerCase().includes(query)
        );
      });
    }

    setFilteredRescues(filtered);
  }, [statusFilter, dateFilter, searchQuery, rescues]);

  async function fetchRescues() {
    try {
      const response = await api.get("/api/rescues/all");

      // Recent rescue cases are shown first for faster operational review.
      const newestFirst = [...response.data].sort(
        (a: Rescue, b: Rescue) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      setRescues(newestFirst);
      setFilteredRescues(newestFirst);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleReset = () => {
    setStatusFilter("");
    setDateFilter("");
    setSearchQuery("");
    setCurrentPage(1);
    setFilteredRescues(rescues);
  };

  const totalCases = rescues.length;

  const pending = rescues.filter((r) => r.status === "pending").length;

  const completed = rescues.filter((r) => r.status === "completed").length;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending":
        return {
          backgroundColor: "#FEF3C7",
          color: "#D97706",
        };

      case "accepted":
        return {
          backgroundColor: "#DBEAFE",
          color: "#2563EB",
        };

      case "completed":
        return {
          backgroundColor: "#DCFCE7",
          color: "#16A34A",
        };

      case "rejected":
        return {
          backgroundColor: "#FCDCDD",
          color: "#D43F25",
        };

      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        };
    }
  };

  return (
    <div className="home-container">
      <Sidebar />

      <main className="main-content">
        <div className="rescues-page rescues-container">
          <Header title="Rescue Case Overview" />

          <div className="kpi-cards">
            <div className="kpi-card">
              <p className="kpi-label">Total Cases</p>
              <p className="kpi-value">{totalCases}</p>
            </div>

            <div className="kpi-card">
              <p className="kpi-label">Pending Assignments</p>
              <p className="kpi-value">{pending}</p>
            </div>

            <div className="kpi-card">
              <p className="kpi-label">Completed</p>
              <p className="kpi-value">
                {String(completed).padStart(2, "0")}
              </p>
            </div>
          </div>

          <div className="filter-box">
            <div className="filter-row">
              <div className="filter-field search-filter-field">
                <input
                  type="search"
                  placeholder="Search by case ID, animal, reporter or location"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <button className="dashboard-search-btn" onClick={() => setSearchQuery(searchQuery.trim())}>
                Search
              </button>
              <div className="filter-field">
                <label>Date:</label>

                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="filter-field">
                <label>Status:</label>

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <button className="reset-btn" onClick={handleReset}>
                Reset Filters
              </button>
            </div>
          </div>

          {loading ? (
            <LoadingState label="Loading rescues..." />
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
                    paginatedRescues.map((rescue) => {
                      const address =
                        rescue.rescueLocation?.address ||
                        rescue.reporterLocation?.address ||
                        "—";

                      return (
                        <tr key={rescue._id}>
                          <td>
                            #{rescue.caseId || rescue._id.slice(-6).toUpperCase()}
                          </td>

                          <td>🐾 {rescue.animalType || "Unknown"}</td>

                          <td>
                            <span
                              style={{
                                ...getStatusStyle(rescue.status),
                                padding: "4px 12px",
                                borderRadius: "9999px",
                                fontWeight: "600",
                                fontSize: "12px",
                              }}
                            >
                              {rescue.status}
                            </span>
                          </td>

                          <td>{rescue.reporterName || "Anonymous"}</td>

                          <td>
                            <div className="address-scroll" title={address}>
                              {address}
                            </div>
                          </td>

                          <td>
                            {rescue.createdAt
                              ? new Date(rescue.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "2-digit",
                                    year: "numeric",
                                  }
                                )
                              : "—"}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          textAlign: "center",
                          padding: "20px",
                        }}
                      >
                        No rescue cases found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <TablePagination currentPage={currentPage} totalItems={filteredRescues.length} pageSize={pageSize} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
