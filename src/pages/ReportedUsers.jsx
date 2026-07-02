import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import api from "../api/axios";

export default function ReportedUsers() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="home-container">
      <Sidebar />
      <main className="main-content">
        <div style={{ padding: "24px" }}>
          <Header title="Reported Users & Posts" />

          {loading ? (
            <p>Loading...</p>
          ) : reports.length === 0 ? (
            <div style={{
              background: "#fff", borderRadius: "12px", padding: "40px",
              textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginTop: "24px"
            }}>
              <p style={{ color: "#888", fontSize: "16px" }}>No reported users or posts found.</p>
            </div>
          ) : (
            <div style={{
              background: "#fff", borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginTop: "24px", overflow: "hidden"
            }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "#FFF9E6" }}>
                  <tr>
                    {["Reported User", "Reason", "Reported By", "Date", "Status", "Action"].map(h => (
                      <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#555" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r._id} style={{ borderTop: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "14px 16px" }}>{r.reportedUser || "N/A"}</td>
                      <td style={{ padding: "14px 16px" }}>{r.reason || "N/A"}</td>
                      <td style={{ padding: "14px 16px" }}>{r.reportedBy || "N/A"}</td>
                      <td style={{ padding: "14px 16px" }}>
                        {new Date(r.timestamp).toLocaleDateString("en-US", {
                          month: "short", day: "2-digit", year: "numeric"
                        })}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          padding: "4px 12px", borderRadius: "9999px",
                          fontSize: "12px", fontWeight: "600",
                          background: r.status === "Resolved" ? "#DCFCE7" : "#FEF9C3",
                          color: r.status === "Resolved" ? "#16A34A" : "#854D0E",
                        }}>
                          {r.status || "Pending"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <button style={{
                          padding: "6px 14px", borderRadius: "6px", border: "none",
                          background: "#F5A623", color: "#fff", fontWeight: "600",
                          cursor: "pointer", fontSize: "12px"
                        }}>
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
