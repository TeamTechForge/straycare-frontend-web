import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import NavTabs from "../components/NavTabs";
import "./VetsNgoUsers.css";

interface User {
  _id: string;
  name?: string;
  fullName?: string;
  role: string;
  status?: "Verified" | "Rejected" | "Pending";
}

export default function VetsNgoUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  const isVerificationPage =
    location.pathname.includes("/users/") &&
    location.pathname.includes("/documents");

  const tabs = [
    { label: "Users", to: "/users/general" },
    { label: "Organizations", to: "/users/vets-ngos" },
    isVerificationPage
      ? { label: "User Verification", to: location.pathname }
      : { label: "User Verification", disabled: true },
  ];

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/users/vets-ngos");
      const statusPriority: Record<string, number> = {
        pending: 0,
        verified: 1,
        rejected: 2,
      };

      const sortedUsers = [...res.data].sort((first: User, second: User) => {
        const firstStatus = (first.status || "Pending").toLowerCase();
        const secondStatus = (second.status || "Pending").toLowerCase();
        return (statusPriority[firstStatus] ?? 3) - (statusPriority[secondStatus] ?? 3);
      });

      setUsers(sortedUsers);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [location.key]);

  return (
    <div className="home-container">
      <Sidebar />

      <main className="main-content">
        <div className="vets-ngo-page users-container">
          <Header title="User Management" />
          <NavTabs tabs={tabs} />

          <div className="table-box">
          <table className="users-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>
                    No organizations found.
                  </td>
                </tr>
              ) : users.map((user: User) => (
                <tr key={user._id}>
                  <td>{user._id}</td>
                  <td>{user.name || user.fullName}</td>
                  <td>{user.role}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        user.status === "Verified"
                          ? "status-verified"
                          : user.status === "Rejected"
                          ? "status-rejected"
                          : "status-pending"
                      }`}
                    >
                      {user.status || "Pending"}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => navigate(`/users/${user._id}/documents`)}>
                      Check Documents
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination-row">
            Showing {users.length} organizations
          </div>
          </div>
        </div>
      </main>
    </div>
  );
}
