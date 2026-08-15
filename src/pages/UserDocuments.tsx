import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import LoadingState from "../components/LoadingState";
import api from "../api/axios";
import { confirmSensitiveAction } from "../utils/dashboardPreferences";
import NavTabs from "../components/NavTabs";
import "./UserDocuments.css";

interface User {
  name: string;
  role: string;
  status?: string;
  location?: string;
  regNumber?: string;
  contactPerson?: string;
  foundedYear?: string | number;
  bio?: string;
  createdAt?: string;
}

interface Document {
  type: string;
  url: string;
}

export default function UserDocuments() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [status, setStatus] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "warning"; message: string } | null>(null);

  const tabs = [
    { label: "Users", to: "/users/general" },
    { label: "Organizations", to: "/users/vets-ngos" },
    { label: "User Verification", to: location.pathname },
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get(`/api/users/${id}/documents`);
        setUser(res.data.user);
        setDocuments(res.data.documents);
        setStatus(res.data.user.status || "Pending");
      } catch (err) {
        console.error("Failed to fetch user documents:", err);
      }
    }

    fetchData();
  }, [id]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (
      !confirmSensitiveAction(
        `Are you sure you want to mark this verification as ${newStatus.toLowerCase()}?`
      )
    ) {
      return;
    }

    try {
      setUpdating(true);
      const response = await api.patch(`/api/users/${id}/status`, {
        status: newStatus,
      });
      setStatus(newStatus);
      setFeedback({
        type: response.data.emailSent ? "success" : "warning",
        message: response.data.message,
      });
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdating(false);
    }
  };

  const isLocalPath = (url: string) => url.startsWith("file:///");

  if (!user) {
    return (
      <div className="home-container">
        <Sidebar />
        <main className="main-content">
          <div className="user-docs-container">
            <Header title="User Management" />
            <NavTabs tabs={tabs} />
            <LoadingState label="Loading organization details..." />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="home-container">
      <Sidebar />

      <main className="main-content">
        <div className="user-docs-container">
          <Header title="User Management" />
          <NavTabs tabs={tabs} />

          {feedback && (
            <div className={`verification-feedback ${feedback.type}`} role="status">
              {feedback.message}
            </div>
          )}

          <div className="details-card">
            <div className="details-header">
              <div>
                <h2>{user.name}</h2>

                <span
                  className={
                    "role-badge " +
                    (user.role === "Vet" ? "role-vet" : "role-ngo")
                  }
                >
                  {user.role}
                </span>
              </div>

              <span
                className={
                  "status-badge " +
                  (status === "Verified"
                    ? "status-verified"
                    : status === "Rejected"
                    ? "status-rejected"
                    : "status-pending")
                }
              >
                {status}
              </span>
            </div>

            <div className="details-grid">
              {user.location && (
                <div className="detail-item">
                  <span className="detail-label">Location</span>
                  <span className="detail-value">{user.location}</span>
                </div>
              )}

              {user.regNumber && (
                <div className="detail-item">
                  <span className="detail-label">
                    {user.role === "Vet"
                      ? "License Number"
                      : "Registration Number"}
                  </span>
                  <span className="detail-value">{user.regNumber}</span>
                </div>
              )}

              {user.contactPerson && (
                <div className="detail-item">
                  <span className="detail-label">Contact Person</span>
                  <span className="detail-value">{user.contactPerson}</span>
                </div>
              )}

              {user.foundedYear && (
                <div className="detail-item">
                  <span className="detail-label">
                    {user.role === "Vet" ? "Experience" : "Founded Year"}
                  </span>
                  <span className="detail-value">{user.foundedYear}</span>
                </div>
              )}

              {user.bio && (
                <div className="detail-item full-width">
                  <span className="detail-label">Bio</span>
                  <span className="detail-value">{user.bio}</span>
                </div>
              )}

              {user.createdAt && (
                <div className="detail-item">
                  <span className="detail-label">Registered On</span>
                  <span className="detail-value">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="docs-section">
            <h3>Uploaded Documents</h3>

            <div className="docs-list">
              {documents.length > 0 ? (
                documents.map((doc: Document, index: number) => (
                  <div className="doc-item" key={index}>
                    <span className="doc-type">{doc.type}</span>

                    {isLocalPath(doc.url) ? (
                      <span className="doc-unavailable">
                        Document stored on mobile device — not accessible from web
                      </span>
                    ) : (
                      
                        <a href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view-btn"
                      >
                        View Document
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <p className="no-docs">No documents uploaded.</p>
              )}
            </div>
          </div>

          <div className="action-buttons">
            <button
              className="verify-btn"
              onClick={() => handleStatusUpdate("Verified")}
              disabled={updating || status === "Verified"}
            >
              {status === "Verified" ? "Verified" : "Verify"}
            </button>

            <button
              className="reject-btn"
              onClick={() => handleStatusUpdate("Rejected")}
              disabled={updating || status === "Rejected"}
            >
              {status === "Rejected" ? "Rejected" : "Reject"}
            </button>

            <button
              className="back-btn"
              onClick={() => navigate("/users/vets-ngos")}
            >
              Back
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
