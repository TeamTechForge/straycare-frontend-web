import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import api from "../api/axios";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const COLORS = ["#F5A623", "#4CAF50", "#2196F3", "#E53935"];

export default function Analytics() {
  const [donations, setDonations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [donRes, userRes] = await Promise.all([
        api.get("/api/donations/history"),
        api.get("/api/admin/users").catch(() => ({ data: [] })),
      ]);
      setDonations(donRes.data || []);
      setUsers(userRes.data || []);
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Donations by month
  const donationsByMonth = () => {
    const map = {};
    donations.forEach((d) => {
      const month = new Date(d.timestamp).toLocaleString("default", { month: "short", year: "numeric" });
      if (!map[month]) map[month] = { month, total: 0, count: 0 };
      if (d.status === "SUCCESS") {
        map[month].total += Number(d.amount || 0);
        map[month].count += 1;
      }
    });
    return Object.values(map).slice(-6);
  };

  // Donations by category
  const donationsByCategory = () => {
    const map = {};
    donations.forEach((d) => {
      if (d.status === "SUCCESS") {
        const cat = d.category || "General";
        map[cat] = (map[cat] || 0) + 1;
      }
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  };

  // Donation status breakdown
  const donationStatus = () => {
    const success = donations.filter(d => d.status === "SUCCESS").length;
    const failed = donations.filter(d => d.status === "FAILED").length;
    return [
      { name: "Success", value: success },
      { name: "Failed", value: failed },
    ];
  };

  // Total collected
  const totalCollected = donations
    .filter(d => d.status === "SUCCESS")
    .reduce((acc, d) => acc + Number(d.amount || 0), 0);

  if (loading) return <div style={{ padding: "40px" }}>Loading analytics...</div>;

  return (
    <div className="home-container">
      <Sidebar />
      <main className="main-content">
        <div style={{ padding: "24px" }}>
          <Header title="System Analytics" />

          {/* KPI Cards */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
            {[
              { label: "Total Donations", value: donations.length },
              { label: "Successful", value: donations.filter(d => d.status === "SUCCESS").length },
              { label: "Failed", value: donations.filter(d => d.status === "FAILED").length },
              { label: "Total Collected", value: `Rs. ${totalCollected.toLocaleString()}` },
            ].map((card) => (
              <div key={card.label} style={{
                background: "#fff", borderRadius: "12px", padding: "20px 28px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)", minWidth: "180px", flex: 1,
              }}>
                <p style={{ color: "#888", fontSize: "13px", marginBottom: "6px" }}>{card.label}</p>
                <p style={{ fontSize: "24px", fontWeight: "700", color: "#222" }}>{card.value}</p>
              </div>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>

            {/* Donations over time */}
            <div style={{
              background: "#fff", borderRadius: "12px", padding: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)", flex: 2, minWidth: "300px"
            }}>
              <h3 style={{ marginBottom: "16px", fontSize: "15px", color: "#333" }}>Donation Amount Over Time</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={donationsByMonth()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#F5A623" strokeWidth={2} name="Amount (Rs.)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Donation status pie */}
            <div style={{
              background: "#fff", borderRadius: "12px", padding: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)", flex: 1, minWidth: "250px"
            }}>
              <h3 style={{ marginBottom: "16px", fontSize: "15px", color: "#333" }}>Payment Status</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={donationStatus()} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {donationStatus().map((_, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>

            {/* Donations by category */}
            <div style={{
              background: "#fff", borderRadius: "12px", padding: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)", flex: 1, minWidth: "300px"
            }}>
              <h3 style={{ marginBottom: "16px", fontSize: "15px", color: "#333" }}>Donations by Category</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={donationsByCategory()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#F5A623" name="Donations" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Count per month */}
            <div style={{
              background: "#fff", borderRadius: "12px", padding: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)", flex: 1, minWidth: "300px"
            }}>
              <h3 style={{ marginBottom: "16px", fontSize: "15px", color: "#333" }}>Number of Donations Per Month</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={donationsByMonth()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#4CAF50" name="Count" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}