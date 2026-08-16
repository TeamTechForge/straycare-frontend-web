import { useEffect, useState } from "react";
import Header from "../components/Header";
import LoadingState from "../components/LoadingState";
import NavTabs from "../components/NavTabs";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import "./Reports.css";

type CommunityPost = {
  _id: string;
  title?: string;
  category?: string;
  content?: string;
  imageUrl?: string;
  authorName?: string;
  submittedAt?: string;
  createdAt?: string;
};

type PostReport = {
  _id: string;
  postId: string;
  reporterUserId: string;
  reason: string;
  status: string;
  createdAt: string;
  post?: CommunityPost;
};

const imageUrl = (path?: string) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${String(api.defaults.baseURL || "").replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
};

export default function Reports() {
  const [reports, setReports] = useState<PostReport[]>([]);
  const [selected, setSelected] = useState<PostReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    setError("");
    try {
      const response = await api.get("/api/admin/reported-posts");
      setReports(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      console.error("Failed to load reported posts:", requestError);
      setError("Reported posts could not be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const dismissReport = async (report: PostReport) => {
    setActingOn(report._id);
    try {
      await api.patch(`/api/admin/reported-posts/${report._id}/dismiss`);
      setReports((current) => current.map((item) =>
        item._id === report._id ? { ...item, status: "dismissed" } : item
      ));
      setSelected(null);
    } catch (requestError) {
      console.error("Failed to dismiss report:", requestError);
      alert("The report could not be dismissed.");
    } finally {
      setActingOn(null);
    }
  };

  const removePost = async (report: PostReport) => {
    if (!window.confirm("Remove this community post? All pending reports for it will be resolved.")) return;
    setActingOn(report._id);
    try {
      await api.delete(`/api/admin/reported-posts/${report._id}/post`);
      setReports((current) => current.map((item) =>
        item.postId === report.postId ? { ...item, status: "resolved", post: undefined } : item
      ));
      setSelected(null);
    } catch (requestError) {
      console.error("Failed to remove post:", requestError);
      alert("The post could not be removed.");
    } finally {
      setActingOn(null);
    }
  };

  return (
    <div className="home-container">
      <Sidebar />
      <main className="main-content">
        <div className="reported-posts-page reported-posts-container">
          <Header title="Reported Users & Posts" />
          <NavTabs tabs={[
            { label: "Reported Users", to: "/reports/users" },
            { label: "Reported Posts", to: "/reports/posts" },
          ]} />

          {loading ? <LoadingState label="Loading reported posts..." /> : error ? (
            <div className="reports-message error-message">{error}</div>
          ) : reports.length === 0 ? (
            <div className="reports-message">No reported posts found.</div>
          ) : (
            <div className="reported-posts-table-wrap">
              <table className="reported-posts-table">
                <thead><tr>
                  <th>Post</th><th>Reason</th><th>Reported By</th><th>Date</th><th>Status</th><th>Actions</th>
                </tr></thead>
                <tbody>{reports.map((report) => {
                  const pending = report.status?.toLowerCase() === "pending";
                  const busy = actingOn === report._id;
                  return <tr key={report._id}>
                    <td><strong>{report.post?.title || "Post unavailable"}</strong><small>{report.post?.category || report.postId}</small></td>
                    <td>{report.reason || "—"}</td>
                    <td className="mono-value">{report.reporterUserId || "—"}</td>
                    <td>{report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "—"}</td>
                    <td><span className={`post-status post-status-${report.status?.toLowerCase() || "pending"}`}>{report.status || "pending"}</span></td>
                    <td><div className="post-actions">
                      <button className="view-post-btn" onClick={() => setSelected(report)}>View Post</button>
                      {pending && <button disabled={busy} className="dismiss-post-btn" onClick={() => dismissReport(report)}>Dismiss</button>}
                    </div></td>
                  </tr>;
                })}</tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {selected && <div className="post-modal-backdrop" role="presentation" onMouseDown={() => setSelected(null)}>
        <section className="post-modal" role="dialog" aria-modal="true" aria-labelledby="reported-post-title" onMouseDown={(event) => event.stopPropagation()}>
          <button className="post-modal-close" aria-label="Close" onClick={() => setSelected(null)}>×</button>
          <p className="post-modal-eyebrow">{selected.post?.category || "Community post"}</p>
          <h2 id="reported-post-title">{selected.post?.title || "Post unavailable"}</h2>
          <div className="post-meta">By {selected.post?.authorName || "Unknown"} · Reported for {selected.reason}</div>
          {selected.post?.imageUrl && <img className="reported-post-image" src={imageUrl(selected.post.imageUrl)} alt="Reported post" />}
          <p className="reported-post-content">{selected.post?.content || "The original post is no longer available."}</p>
          {selected.status?.toLowerCase() === "pending" && <div className="post-modal-actions">
            <button disabled={actingOn === selected._id} className="dismiss-post-btn" onClick={() => dismissReport(selected)}>Dismiss Report</button>
            <button disabled={actingOn === selected._id || !selected.post} className="remove-post-btn" onClick={() => removePost(selected)}>Remove Post</button>
          </div>}
        </section>
      </div>}
    </div>
  );
}
