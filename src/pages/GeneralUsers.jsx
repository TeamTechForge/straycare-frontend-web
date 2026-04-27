import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import api from "../api/axios";
import UserNavTabs from "../components/UserNavTabs";
import "./GeneralUsers.css";

export default function GeneralUsers() {
  const [allUsers, setAllUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ role: "All" });

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/users/all");
      const generalTabUsers = res.data.filter(
        u => ["General User", "Rescuer", "Volunteer"].includes(u.role)
      );
      setAllUsers(generalTabUsers);
      setUsers(generalTabUsers);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleReset = () => {
    setFilters({ role: "All" });
    setUsers(allUsers);
  };

  const handleApply = () => {
    let filtered = allUsers;
    if (filters.role !== "All") {
      filtered = filtered.filter(u => u.role === filters.role);
    }
    setUsers(filtered);
  };

  return (
    <div className="home-container">
      <Sidebar />
      <main className="main-content">
        <div className="users-container">
          <Header title="User Management" />
          <UserNavTabs />

          {/* Filter Box */}
          <div className="filter-box">
            <p className="filter-title">Filter Users</p>
            <div className="filter-row">
              <div className="filter-field">
                <label>Role:</label>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                >
                  <option>All</option>
                  <option>General User</option>
                  <option>Rescuer</option>
                  <option>Volunteer</option>
                </select>
              </div>
              <button className="reset-btn" onClick={handleReset}>Reset Filters</button>
              <button className="apply-btn" onClick={handleApply}>Apply Filters</button>
            </div>
          </div>

          {/* Table */}
          <div className="table-box">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user._id}>
                      <td style={{ fontFamily: "monospace", fontWeight: "bold" }}>{user._id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="pagination-row">
              <span>Showing {users.length} of {allUsers.length} users</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
