import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import UserNavTabs from "../components/UserNavTabs";
import "./VetsNgoUsers.css";

export default function VetsNgoUsers() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/users/vets-ngos");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, []);

  // Re-fetch 
  useEffect(() => {
    fetchUsers();
  }, [location.key]);

  return (
    <div className="home-container">
      <Sidebar />
      <main className="main-content">
        <div className="users-container">
          <Header title="User Management" />
          <UserNavTabs />

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
              {users.map(user => (
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
        </div>
      </main>
    </div>
  );
}
