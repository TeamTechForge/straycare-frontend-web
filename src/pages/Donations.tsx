import { useEffect, useState } from "react";
import "./Donations.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import api from "../api/axios";

interface Donation {
  _id: string;
  orderId: string;
  organization: string;
  amount: number | string;
  category?: string;
  frequency: string;
  timestamp: string;
  status: string;
}

interface Filters {
  date: string;
  category: string;
  status: string;
}

export default function Donations() {
  const [allDonations, setAllDonations] = useState<Donation[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [successTotal, setSuccessTotal] = useState<number>(0);

  const [filters, setFilters] = useState<Filters>({
    date: "",
    category: "All",
    status: "All",
  });

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const res = await api.get("/api/donations/history");

      setAllDonations(res.data);
      setDonations(res.data);

      const successSum = res.data
        .filter((d: Donation) => d.status === "SUCCESS")
        .reduce(
          (acc: number, d: Donation) =>
            acc + Number(d.amount || 0),
          0
        );

      setSuccessTotal(successSum);
    } catch (err) {
      console.error("Error fetching donations:", err);
    }
  };

  const applyFilters = (nextFilters: Filters) => {
    let filtered = allDonations;

    if (nextFilters.date) {
      filtered = filtered.filter((d) => {
        const donationDate = new Date(d.timestamp)
          .toISOString()
          .split("T")[0];

        return donationDate === nextFilters.date;
      });
    }

    if (nextFilters.category !== "All") {
      filtered = filtered.filter((d) =>
        d.category?.includes(
          nextFilters.category === "Shelter"
            ? "Shelter"
            : "Vet"
        )
      );
    }

    if (nextFilters.status !== "All") {
      filtered = filtered.filter(
        (d) => d.status === nextFilters.status
      );
    }

    setDonations(filtered);
  };

  const handleFilterChange = (
    field: keyof Filters,
    value: string
  ) => {
    const nextFilters = {
      ...filters,
      [field]: value,
    };

    setFilters(nextFilters);
    applyFilters(nextFilters);
  };

  const handleReset = () => {
    const cleared: Filters = {
      date: "",
      category: "All",
      status: "All",
    };

    setFilters(cleared);
    setDonations(allDonations);
  };

  return (
    <div className="home-container">
      <Sidebar />

      <main className="main-content">
        <div className="donations-container">
          <Header title="Donation Transactions" />

          <div className="kpi-cards">
            <div className="kpi-card">
              <p className="kpi-label">Total Donations</p>
              <p className="kpi-value">
                {allDonations.length}
              </p>
            </div>

            <div className="kpi-card">
              <p className="kpi-label">
                Total Collected (Success)
              </p>
              <p className="kpi-value">
                Rs. {successTotal.toLocaleString()}
              </p>
            </div>

            <div className="kpi-card">
              <p className="kpi-label">Successful</p>
              <p
                className="kpi-value"
                style={{ color: "green" }}
              >
                {
                  allDonations.filter(
                    (d) => d.status === "SUCCESS"
                  ).length
                }
              </p>
            </div>

            <div className="kpi-card">
              <p className="kpi-label">Failed</p>
              <p
                className="kpi-value"
                style={{ color: "red" }}
              >
                {
                  allDonations.filter(
                    (d) => d.status === "FAILED"
                  ).length
                }
              </p>
            </div>
          </div>

          <div className="filter-box">
            <p className="filter-title">
              Filter Transactions
            </p>

            <div className="filter-row">
              <div className="filter-field">
                <label>Date:</label>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) =>
                    handleFilterChange(
                      "date",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="filter-field">
                <label>Category:</label>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterChange(
                      "category",
                      e.target.value
                    )
                  }
                >
                  <option>All</option>
                  <option>Shelter</option>
                  <option>Vet Clinic</option>
                </select>
              </div>

              <div className="filter-field">
                <label>Status:</label>

                <select
                  value={filters.status}
                  onChange={(e) =>
                    handleFilterChange(
                      "status",
                      e.target.value
                    )
                  }
                >
                  <option>All</option>
                  <option>SUCCESS</option>
                  <option>FAILED</option>
                </select>
              </div>

              <button
                className="reset-btn"
                onClick={handleReset}
              >
                Reset Filters
              </button>
            </div>
          </div>

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
                    <td
                      colSpan={7}
                      style={{
                        textAlign: "center",
                        padding: "20px",
                      }}
                    >
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  donations.map((d: Donation) => (
                    <tr key={d._id}>
                      <td>{d.orderId}</td>
                      <td>{d.organization}</td>
                      <td>
                        {Number(d.amount).toLocaleString()}
                      </td>
                      <td>{d.category}</td>
                      <td>{d.frequency}</td>
                      <td>
                        {new Date(
                          d.timestamp
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })}
                      </td>

                      <td>
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: "9999px",
                            fontWeight: "600",
                            fontSize: "12px",
                            backgroundColor:
                              d.status === "SUCCESS"
                                ? "#DCFCE7"
                                : "#FCDCDD",
                            color:
                              d.status === "SUCCESS"
                                ? "#16A34A"
                                : "#D43F25",
                          }}
                        >
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="pagination-row">
              <span>
                Showing {donations.length} of{" "}
                {allDonations.length} transactions
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
