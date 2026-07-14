import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import api from "../api/axios";
import UserNavTabs from "../components/UserNavTabs";
import "./GeneralUsers.css";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function GeneralUsers() {
  // Stores full list of filtered users from API (base dataset)
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Stores users currently displayed in the table (after filtering)
  const [users, setUsers] = useState<User[]>([]);

  // Stores filter state (currently only role filter)
  const [filters, setFilters] = useState({ role: "All" });

  // Fetch users from backend API
  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/users/all");

      // Keep only relevant roles for this tab
      const generalTabUsers = res.data.filter(
        (u: User) =>
          ["General User", "Rescuer", "Volunteer"].includes(u.role)
      );

      // Save original dataset
      setAllUsers(generalTabUsers);

      // Initialize displayed dataset
      setUsers(generalTabUsers);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  // Runs once when component mounts (page load)
  useEffect(() => {
    fetchUsers();
  }, []);

  // Reset filters and restore full dataset
  const handleReset = () => {
    setFilters({ role: "All" });
    setUsers(allUsers);
  };

  // Badge colors per role
  const getRoleStyle = (role: string) => {
    switch (role) {
      case "General User":
        return { backgroundColor: "#DBEAFE", color: "#2563EB" };
      case "Rescuer":
        return { backgroundColor: "#FEF3C7", color: "#D97706" };
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
        <div className="users-container">
          <Header title="User Management" />

          <UserNavTabs />

          <div className="filter-box">
            <p className="filter-title">Filter Users</p>

            <div className="filter-row">
              <div className="filter-field">
                <label>Role:</label>

                <select
                  value={filters.role}
                  onChange={(e) => {
                    const role = e.target.value;

                    setFilters({ ...filters, role });

                    setUsers(
                      role === "All"
                        ? allUsers
                        : allUsers.filter((u) => u.role === role)
                    );
                  }}
                >
                  <option>All</option>
                  <option>General User</option>
                  <option>Rescuer</option>
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
                </tr>
              </thead>

              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user: User) => (
                    <tr key={user._id}>
                      <td
                        style={{
                          fontFamily: "monospace",
                          fontWeight: "bold",
                        }}
                      >
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="pagination-row">
              <span>
                Showing {users.length} of {allUsers.length} users
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
