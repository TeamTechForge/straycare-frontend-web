import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import LoadingState from "./LoadingState";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAuthorized(false);
      return;
    }

    api.get("/api/admins/me")
      .then(() => setAuthorized(true))
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("adminId");
        setAuthorized(false);
      });
  }, []);

  if (authorized === null) return <LoadingState label="Verifying admin access..." />;
  if (!authorized) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}
