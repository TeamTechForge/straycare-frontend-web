import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import api from "../api/axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./Analytics.css";

const COLORS = [
  "#F5A623",
  "#4CAF50",
  "#2196F3",
  "#E53935",
  "#9C27B0",
  "#00BCD4",
];

interface Donation {
  timestamp: string;
  status: string;
  amount?: number | string;
  category?: string;
}

interface User {
  role?: string;
}

interface Rescue {
  status?: string;
}

interface ChartData {
  name: string;
  value: number;
}

interface MonthDonation {
  month: string;
  total: number;
  count: number;
}

export default function Analytics() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [rescues, setRescues] = useState<Rescue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [donRes, userRes, rescueRes] = await Promise.all([
        api.get("/api/donations/history"),
        api.get("/api/users/all").catch(() => ({ data: [] })),
        api.get("/api/rescue-cases").catch(() => ({ data: [] })),
      ]);

      setDonations(donRes.data || []);
      setUsers(userRes.data || []);
      setRescues(rescueRes.data || []);
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const donationsByMonth = (): MonthDonation[] => {
    const map: Record<string, MonthDonation> = {};

    donations.forEach((d) => {
      const month = new Date(d.timestamp).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });

      if (!map[month]) {
        map[month] = {
          month,
          total: 0,
          count: 0,
        };
      }

      if (d.status === "SUCCESS") {
        map[month].total += Number(d.amount || 0);
        map[month].count += 1;
      }
    });

    return Object.values(map).slice(-6);
  };

  const donationsByCategory = (): ChartData[] => {
    const map: Record<string, number> = {};

    donations.forEach((d) => {
      if (d.status === "SUCCESS") {
        const category = d.category || "General";
        map[category] = (map[category] || 0) + 1;
      }
    });

    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const donationStatus = (): ChartData[] => {
    return [
      {
        name: "Success",
        value: donations.filter((d) => d.status === "SUCCESS").length,
      },
      {
        name: "Failed",
        value: donations.filter((d) => d.status === "FAILED").length,
      },
    ];
  };

  const usersByRole = (): ChartData[] => {
    const map: Record<string, number> = {};

    users.forEach((u) => {
      const role = u.role || "Unknown";
      map[role] = (map[role] || 0) + 1;
    });

    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const rescuesByStatus = (): ChartData[] => {
    const map: Record<string, number> = {};

    rescues.forEach((r) => {
      const status = r.status || "Unknown";
      map[status] = (map[status] || 0) + 1;
    });

    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const totalCollected = donations
    .filter((d) => d.status === "SUCCESS")
    .reduce((acc, d) => acc + Number(d.amount || 0), 0);

  if (loading) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  return (
    <div className="home-container">
      <Sidebar />

      <main className="main-content">
        <div className="analytics-container">
          <Header title="System Analytics" />

          <div className="kpi-row">
            {[
              { label: "Total Users", value: users.length },
              { label: "Total Rescue Cases", value: rescues.length },
              { label: "Total Donations", value: donations.length },
              {
                label: "Total Collected",
                value: `Rs. ${totalCollected.toLocaleString()}`,
              },
            ].map((card) => (
              <div key={card.label} className="kpi-card">
                <p className="kpi-label">{card.label}</p>
                <p className="kpi-value">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="charts-row">
            <div className="chart-card wide">
              <h3 className="chart-title">Donation Amount Over Time</h3>

              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={donationsByMonth()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#F5A623"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card narrow">
              <h3 className="chart-title">Payment Status</h3>

              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={donationStatus()}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    label
                  >
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

          <div className="charts-row">
            <div className="chart-card">
              <h3 className="chart-title">Donations by Category</h3>

              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={donationsByCategory()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />

                  <Bar dataKey="value" name="Donations" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">Number of Donations Per Month</h3>

              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={donationsByMonth()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />

                  <Bar dataKey="count" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="charts-row">
            <div className="chart-card">
              <h3 className="chart-title">Users by Role</h3>

              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={usersByRole()}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    label
                  >
                    {usersByRole().map((_, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">Rescue Cases by Status</h3>

              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={rescuesByStatus()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />

                  <Bar dataKey="value" name="Cases" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}