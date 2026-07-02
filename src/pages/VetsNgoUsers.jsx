import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import UserNavTabs from "../components/UserNavTabs";
import "./VetsNgoUsers.css";

export default function VetsNgoUsers() {
  // Stores Vet and NGO user list fetched from backend
  const [users, setUsers] = useState([]);

  // Used to navigate to other pages (ex: documents page)
  const navigate = useNavigate();

  // Used to detect route changes and re-fetch data
  const location = useLocation();

  // Fetch Vet/NGO users from API
  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/users/vets-ngos");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  // Fetch users once when page loads
  useEffect(() => {
    fetchUsers();
  }, []);

  // Re-fetch users when navigation happens (to keep updated data)
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

          {/* Users Table */}
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

                  {/* Status badge changes color based on verification status */}
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

                  {/* Navigate to user's documents page */}
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