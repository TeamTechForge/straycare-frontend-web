import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import NavTabs from "../components/NavTabs";
import TablePagination from "../components/TablePagination";
import "./VetsNgoUsers.css";

interface User {
  _id: string;
  name?: string;
  fullName?: string;
  role: string;
  status?: "Verified" | "Rejected" | "Pending";
  createdAt?: string;
  location?: string;
  contactPerson?: string;
  regNumber?: string;
  foundedYear?: string | number;
}

export default function VetsNgoUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();
  const location = useLocation();
  const isVerificationView = location.pathname === "/users/verifications";

  const tabs = [
    { label: "Users", to: "/users/general" },
    { label: "Organizations", to: "/users/vets-ngos" },
    { label: "User Verification", to: "/users/verifications" },
  ];
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query ||
      (user.name || user.fullName || "").toLowerCase().includes(query) ||
      user._id.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query);
    const matchesStatus = !isVerificationView || statusFilter === "All" ||
      (user.status || "Pending") === statusFilter;
    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    const matchesDate = !dateFilter || (user.createdAt &&
      new Date(user.createdAt).toLocaleDateString("en-CA") === dateFilter);

    return matchesSearch && matchesStatus && matchesRole && matchesDate;
  });
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/users/vets-ngos");
      const sortedUsers = [...res.data].sort((first: User, second: User) => {
        if (isVerificationView) {
          const firstPending = (first.status || "Pending") === "Pending";
          const secondPending = (second.status || "Pending") === "Pending";
          if (firstPending !== secondPending) return firstPending ? -1 : 1;
        }
        const dateDifference =
          new Date(second.createdAt || 0).getTime() - new Date(first.createdAt || 0).getTime();
        return dateDifference;
      });

      setUsers(sortedUsers);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchUsers();
  }, [location.pathname]);

  return (
    <div className="home-container">
      <Sidebar />

      <main className="main-content">
        <div className="vets-ngo-page users-container">
          <Header title="User Management" />
          <NavTabs tabs={tabs} />

          <div className="filter-box">
            <div className="filter-row">
              <div className="filter-field search-filter-field">
                <input
                  type="search"
                  placeholder={isVerificationView
                    ? "Search verification requests by organization name, user ID or type"
                    : "Search by organization name, user ID or type"}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <button className="dashboard-search-btn" onClick={() => setSearchQuery(searchQuery.trim())}>
                Search
              </button>
              <div className="filter-field">
                <label>Date:</label>
                <input type="date" value={dateFilter} onChange={(event) => {
                  setDateFilter(event.target.value);
                  setCurrentPage(1);
                }} />
              </div>
              {!isVerificationView && (
                <div className="filter-field">
                  <label>Organization type:</label>
                  <select value={roleFilter} onChange={(event) => {
                    setRoleFilter(event.target.value);
                    setCurrentPage(1);
                  }}>
                    <option value="All">All organizations</option>
                    <option value="NGO">NGOs</option>
                    <option value="Vet">Vets</option>
                  </select>
                </div>
              )}
              {isVerificationView && (
                <div className="filter-field">
                  <label>Status:</label>
                  <select value={statusFilter} onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}>
                    <option value="All">All verifications</option>
                    <option value="Pending">Pending</option>
                    <option value="Verified">Verified</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {isVerificationView ? (
            <div className="verification-list">
              {filteredUsers.length === 0 ? (
                <div className="verification-empty">No verification requests found.</div>
              ) : paginatedUsers.map((user: User) => (
                <article className="verification-card" key={user._id}>
                  <div className="verification-card-header">
                    <div>
                      <h2>{user.name || user.fullName || "Unnamed organization"}</h2>
                      <span className={`role-badge role-${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </div>
                    <span className={`status-badge ${
                      user.status === "Verified"
                        ? "status-verified"
                        : user.status === "Rejected"
                        ? "status-rejected"
                        : "status-pending"
                    }`}>
                      {user.status || "Pending"}
                    </span>
                  </div>

                  <div className="verification-card-details">
                    <div><span>Registration / License No.</span><strong>{user.regNumber || "—"}</strong></div>
                    <div><span>Location</span><strong>{user.location || "—"}</strong></div>
                    <div><span>Contact Person</span><strong>{user.contactPerson || "—"}</strong></div>
                    <div><span>{user.role === "Vet" ? "Experience" : "Founded Year"}</span><strong>{user.foundedYear || "—"}</strong></div>
                    <div><span>Registered On</span><strong>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</strong></div>
                  </div>

                  <div className="verification-card-footer">
                    <span className="verification-id">ID: {user._id}</span>
                    <button onClick={() => navigate(`/users/${user._id}/documents`)}>
                      Review Verification
                    </button>
                  </div>
                </article>
              ))}
              <TablePagination currentPage={currentPage} totalItems={filteredUsers.length} pageSize={pageSize} onPageChange={setCurrentPage} />
            </div>
          ) : (
          <div className="table-box">
          <table className="users-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Registered</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>
                    No organizations found.
                  </td>
                </tr>
              ) : paginatedUsers.map((user: User) => (
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
                  <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <TablePagination currentPage={currentPage} totalItems={filteredUsers.length} pageSize={pageSize} onPageChange={setCurrentPage} />
          </div>
          )}
        </div>
      </main>
    </div>
  );
}
