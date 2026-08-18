import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import LoadingState from "../components/LoadingState";
import api from "../api/axios";
import { useConfirmation } from "../components/ConfirmationProvider";
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
  rejectionReason?: string;
}

interface Document {
  type: string;
  url: string;
}

export default function UserDocuments() {
  const confirm = useConfirmation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [status, setStatus] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [showRejectionReasons, setShowRejectionReasons] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "warning"; message: string } | null>(null);

  const tabs = [
    { label: "Users", to: "/users/general" },
    { label: "Organizations", to: "/users/vets-ngos" },
    { label: "User Verification", to: "/users/verifications" },
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get(`/api/users/${id}/documents`);
        setUser(res.data.user);
        setDocuments(res.data.documents);
        setStatus(res.data.user.status || "Pending");
        setRejectionReason(res.data.user.rejectionReason || "");
      } catch (err) {
        console.error("Failed to fetch user documents:", err);
      }
    }

    fetchData();
  }, [id]);

  const handleStatusUpdate = async (newStatus: string) => {
    const confirmed = await confirm({
      title: `${newStatus === "Verified" ? "Verify" : "Reject"} organization?`,
      message: newStatus === "Verified"
        ? "The organization will be approved and a verification email will be attempted."
        : `The organization will be rejected for: ${rejectionReason}. This reason will be included in the email notice.`,
      confirmLabel: newStatus === "Verified" ? "Verify" : "Reject",
      tone: newStatus === "Verified" ? "warning" : "danger",
    });
    if (!confirmed) return;

    try {
      setUpdating(true);
      const response = await api.patch(`/api/users/${id}/status`, {
        status: newStatus,
        rejectionReason: newStatus === "Rejected" ? rejectionReason : undefined,
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

  const handleReject = () => {
    if (!showRejectionReasons) {
      setShowRejectionReasons(true);
      return;
    }

    if (!rejectionReason) {
      setFeedback({ type: "warning", message: "Select a rejection reason before continuing." });
      return;
    }

    handleStatusUpdate("Rejected");
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
            {showRejectionReasons && status !== "Rejected" && (
              <div className="rejection-reason-field">
                <label htmlFor="rejection-reason">Rejection reason</label>
                <select
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(event) => setRejectionReason(event.target.value)}
                  disabled={updating}
                >
                  <option value="">Select a reason</option>
                  <option value="Registration or license details could not be verified">Registration or license details could not be verified</option>
                  <option value="Submitted document is unclear, expired, or incomplete">Submitted document is unclear, expired, or incomplete</option>
                  <option value="Organization details do not match the submitted document">Organization details do not match the submitted document</option>
                  <option value="Required verification information is missing">Required verification information is missing</option>
                </select>
              </div>
            )}
            <button
              className="verify-btn"
              onClick={() => handleStatusUpdate("Verified")}
              disabled={updating || status === "Verified"}
            >
              {status === "Verified" ? "Verified" : "Verify"}
            </button>

            <button
              className="reject-btn"
              onClick={handleReject}
              disabled={updating || status === "Rejected"}
            >
              {status === "Rejected" ? "Rejected" : showRejectionReasons ? "Continue Rejection" : "Reject"}
            </button>

            <button
              className="back-btn"
              onClick={() => navigate("/users/verifications")}
            >
              Back
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
