// src/pages/Donations.jsx
import { useEffect, useState } from "react";
import "./Donations.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import api from "../api/axios";   

export default function Donations() {
  const [allDonations, setAllDonations] = useState([]);
  const [donations, setDonations] = useState([]);
  const [successTotal, setSuccessTotal] = useState(0);
  const [filters, setFilters] = useState({ date: "", category: "All", status: "All" });

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const res = await api.get("/api/donations/history");  
      setAllDonations(res.data);
      setDonations(res.data);

      const successSum = res.data
        .filter(d => d.status === "SUCCESS")
        .reduce((acc, d) => acc + Number(d.amount || 0), 0);
      setSuccessTotal(successSum);
    } catch (err) {
      console.error("Error fetching donations:", err);
    }
  };

  const handleReset = () => {
    setFilters({ date: "", category: "All", status: "All" });
    setDonations(allDonations);
  };

  const handleApply = () => {
    let filtered = allDonations;
    if (filters.date) {
      filtered = filtered.filter(d => {
        const donationDate = new Date(d.timestamp).toISOString().split("T")[0];
        return donationDate === filters.date;
      });
    }
    if (filters.category !== "All") {
      filtered = filtered.filter(d => d.category === filters.category);
    }
    if (filters.status !== "All") {
      filtered = filtered.filter(d => d.status === filters.status);
    }
    setDonations(filtered);
  };

  return (
    <div className="home-container">
      <Sidebar />
      <main className="main-content">
        <div className="donations-container">
          <Header title="Donation Transactions" />

          {/* KPI Cards */}
          <div className="kpi-cards">
            <div className="kpi-card">
              <div>
                <p className="kpi-label">Total Donations</p>
                <p className="kpi-value">{allDonations.length}</p>
              </div>
            </div>
            <div className="kpi-card">
              <div>
                <p className="kpi-label">Total Collected (Success)</p>
                <p className="kpi-value">Rs. {successTotal.toLocaleString()}</p>
              </div>
            </div>
            <div className="kpi-card">
              <div>
                <p className="kpi-label">Successful</p>
                <p className="kpi-value" style={{ color: "green" }}>
                  {allDonations.filter(d => d.status === "SUCCESS").length}
                </p>
              </div>
            </div>
            <div className="kpi-card">
              <div>
                <p className="kpi-label">Failed</p>
                <p className="kpi-value" style={{ color: "red" }}>
                  {allDonations.filter(d => d.status === "FAILED").length}
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="filter-box">
            <p className="filter-title">Filter Transactions</p>
            <div className="filter-row">
              <div className="filter-field">
                <label>Date:</label>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                />
              </div>
              <div className="filter-field">
                <label>Category:</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                >
                  <option>All</option>
                  <option>Support Shelter</option>
                  <option>Support Vet Clinic</option>
                </select>
              </div>
              <div className="filter-field">
                <label>Status:</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option>All</option>
                  <option>SUCCESS</option>
                  <option>FAILED</option>
                </select>
              </div>
              <button className="reset-btn" onClick={handleReset}>Reset Filters</button>
              <button className="apply-btn" onClick={handleApply}>Apply Filters</button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="table-box">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Organization</th>
                  <th>Amount (Rs.)</th>
                  <th>Category</th>
                  <th>Frequency</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {donations.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  donations.map((d) => (
                    <tr key={d._id}>
                      <td style={{ fontFamily: "monospace", fontWeight: "bold" }}>{d.orderId}</td>
                      <td>{d.organization}</td>
                      <td>{Number(d.amount).toLocaleString()}</td>
                      <td>{d.category}</td>
                      <td>{d.frequency}</td>
                      <td>{new Date(d.timestamp).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}</td>
                      <td>
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "9999px",
                          fontWeight: "600",
                          fontSize: "12px",
                          backgroundColor: d.status === "SUCCESS" ? "#DCFCE7" : "#FCDCDD",
                          color: d.status === "SUCCESS" ? "#16A34A" : "#D43F25",
                        }}>
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="pagination-row">
              <span>Showing {donations.length} of {allDonations.length} transactions</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

