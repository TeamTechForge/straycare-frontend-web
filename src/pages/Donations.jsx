// src/pages/Donations.jsx

import { useEffect, useState } from "react";
import "./Donations.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import api from "../api/axios";   

export default function Donations() {

  // Stores all donations fetched from backend (original dataset)
  const [allDonations, setAllDonations] = useState([]);

  // Stores currently displayed donations (after filtering)
  const [donations, setDonations] = useState([]);

  // Stores total amount of successful donations
  const [successTotal, setSuccessTotal] = useState(0);

  // Stores filter values for date, category, and status
  const [filters, setFilters] = useState({ date: "", category: "All", status: "All" });

  // Runs once when page loads to fetch donation data
  useEffect(() => {
    fetchDonations();
  }, []);

  // Fetch donation history from backend API
  const fetchDonations = async () => {
    try {
      const res = await api.get("/api/donations/history");  

      // Store full dataset
      setAllDonations(res.data);
      setDonations(res.data);

      // Calculate total amount from successful donations only
      const successSum = res.data
        .filter(d => d.status === "SUCCESS")
        .reduce((acc, d) => acc + Number(d.amount || 0), 0);

      setSuccessTotal(successSum);

    } catch (err) {
      console.error("Error fetching donations:", err);
    }
  };

  // Reset filters and restore full dataset
  const handleReset = () => {
    setFilters({ date: "", category: "All", status: "All" });
    setDonations(allDonations);
  };

  // Apply filters to donation list
  const handleApply = () => {
    let filtered = allDonations;

    // Filter by selected date (convert timestamp to YYYY-MM-DD format)
    if (filters.date) {
      filtered = filtered.filter(d => {
        const donationDate = new Date(d.timestamp).toISOString().split("T")[0];
        return donationDate === filters.date;
      });
    }

    // Filter by category if not "All"
    if (filters.category !== "All") {
      filtered = filtered.filter(d => d.category === filters.category);
    }

    // Filter by status if not "All"
    if (filters.status !== "All") {
      filtered = filtered.filter(d => d.status === filters.status);
    }

    // Update table data
    setDonations(filtered);
  };

  return (
    <div className="home-container">

      {/* Sidebar navigation */}
      <Sidebar />

      <main className="main-content">
        <div className="donations-container">

          {/* Page header */}
          <Header title="Donation Transactions" />

          {/* KPI summary cards */}
          <div className="kpi-cards">

            {/* Total donations count */}
            <div className="kpi-card">
              <div>
                <p className="kpi-label">Total Donations</p>
                <p className="kpi-value">{allDonations.length}</p>
              </div>
            </div>

            {/* Total successful donation amount */}
            <div className="kpi-card">
              <div>
                <p className="kpi-label">Total Collected (Success)</p>
                <p className="kpi-value">Rs. {successTotal.toLocaleString()}</p>
              </div>
            </div>

            {/* Count of successful transactions */}
            <div className="kpi-card">
              <div>
                <p className="kpi-label">Successful</p>
                <p className="kpi-value" style={{ color: "green" }}>
                  {allDonations.filter(d => d.status === "SUCCESS").length}
                </p>
              </div>
            </div>

            {/* Count of failed transactions */}
            <div className="kpi-card">
              <div>
                <p className="kpi-label">Failed</p>
                <p className="kpi-value" style={{ color: "red" }}>
                  {allDonations.filter(d => d.status === "FAILED").length}
                </p>
              </div>
            </div>
          </div>

          {/* Filter section */}
          <div className="filter-box">
            <p className="filter-title">Filter Transactions</p>

            <div className="filter-row">

              {/* Date filter */}
              <div className="filter-field">
                <label>Date:</label>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                />
              </div>

              {/* Category filter */}
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

              {/* Status filter */}
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

              {/* Filter action buttons */}
              <button className="reset-btn" onClick={handleReset}>
                Reset Filters
              </button>

              <button className="apply-btn" onClick={handleApply}>
                Apply Filters
              </button>
            </div>
          </div>

          {/* Transactions table */}
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
                {/* Show message if no data */}
                {donations.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  // Render each donation row
                  donations.map((d) => (
                    <tr key={d._id}>

                      {/* Order ID */}
                      <td style={{ fontFamily: "monospace", fontWeight: "bold" }}>
                        {d.orderId}
                      </td>

                      {/* Organization name */}
                      <td>{d.organization}</td>

                      {/* Amount formatted with commas */}
                      <td>{Number(d.amount).toLocaleString()}</td>

                      {/* Category */}
                      <td>{d.category}</td>

                      {/* Donation frequency */}
                      <td>{d.frequency}</td>

                      {/* Formatted date */}
                      <td>
                        {new Date(d.timestamp).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric"
                        })}
                      </td>

                      {/* Status badge with conditional styling */}
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

            {/* Table footer showing filtered vs total */}
            <div className="pagination-row">
              <span>
                Showing {donations.length} of {allDonations.length} transactions
              </span>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

