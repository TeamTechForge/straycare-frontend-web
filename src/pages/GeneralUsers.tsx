import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import api from "../api/axios";
import NavTabs from "../components/NavTabs";
import TablePagination from "../components/TablePagination";
import "./GeneralUsers.css";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

export default function GeneralUsers() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState({ role: "All" });
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const paginatedUsers = users.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const tabs = [
    { label: "Users", to: "/users/general" },
    { label: "Organizations", to: "/users/vets-ngos" },
    { label: "User Verification", to: "/users/verifications" },
  ];

  const applyFilters = (role: string, query: string, date = dateFilter) => {
    // Search, role, and registration date filters are combined in one pass.
    const normalizedQuery = query.trim().toLowerCase();
    setUsers(
      allUsers.filter((user) => {
        const matchesRole = role === "All" || user.role === role;
        const matchesSearch =
          !normalizedQuery ||
          user.name?.toLowerCase().includes(normalizedQuery) ||
          user.email?.toLowerCase().includes(normalizedQuery) ||
          user._id.toLowerCase().includes(normalizedQuery);
        const matchesDate = !date || (user.createdAt &&
          new Date(user.createdAt).toLocaleDateString("en-CA") === date);
        return matchesRole && matchesSearch && matchesDate;
      })
    );
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/users/all");

      // Organizations have a separate tab, so this table shows only these roles.
      const generalTabUsers = res.data.filter((u: User) =>
        ["General User", "Volunteer"].includes(u.role)
      );

      const newestFirst = [...generalTabUsers].sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      setAllUsers(newestFirst);
      setUsers(newestFirst);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleReset = () => {
    setFilters({ role: "All" });
    setSearchQuery("");
    setDateFilter("");
    setCurrentPage(1);
    setUsers(allUsers);
  };

  const getRoleStyle = (role: string) => {
    switch (role) {
      case "General User":
        return { backgroundColor: "#DBEAFE", color: "#2563EB" };
      case "Volunteer":
        return { backgroundColor: "#DCFCE7", color: "#16A34A" };
      default:
        return { backgroundColor: "#F3F4F6", color: "#6B7280" };
    }
  };

  return (
    <div className="home-container">
      <Sidebar />

      <main className="main-content">
        <div className="general-users-page users-container">
          <Header title="User Management" />

          <NavTabs tabs={tabs} />

          <div className="filter-box">
            <div className="filter-row">
              <div className="filter-field search-filter-field">
                <input
                  type="search"
                  placeholder="Search by name, email or user ID"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    applyFilters(filters.role, e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <button className="dashboard-search-btn" onClick={() => applyFilters(filters.role, searchQuery)}>
                Search
              </button>
              <div className="filter-field">
                <label>Date:</label>
                <input type="date" value={dateFilter} onChange={(event) => {
                  setDateFilter(event.target.value);
                  applyFilters(filters.role, searchQuery, event.target.value);
                  setCurrentPage(1);
                }} />
              </div>
              <div className="filter-field">
                <label>Role:</label>

                <select
                  value={filters.role}
                  onChange={(e) => {
                    const role = e.target.value;

                    setFilters({ ...filters, role });

                    applyFilters(role, searchQuery);
                    setCurrentPage(1);
                  }}
                >
                  <option>All</option>
                  <option>General User</option>
                  <option>Volunteer</option>
                </select>
              </div>

              <button className="reset-btn" onClick={handleReset}>
                Reset Filters
              </button>
            </div>
          </div>

          <div className="table-box">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Registered</th>
                </tr>
              </thead>

              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>
                      No users found.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user: User) => (
                    <tr key={user._id}>
                      <td style={{ fontFamily: "monospace", fontWeight: "bold" }}>
                        {user._id}
                      </td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span
                          style={{
                            ...getRoleStyle(user.role),
                            padding: "4px 12px",
                            borderRadius: "9999px",
                            fontWeight: "600",
                            fontSize: "12px",
                          }}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <TablePagination
              currentPage={currentPage}
              totalItems={users.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
