import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Login from "./auth/Login";
import Home from "./pages/Home";
import Notifications from "./pages/Notifications";
import Donations from "./pages/Donations";
import GeneralUsers from "./pages/GeneralUsers";
import VetsNgoUsers from "./pages/VetsNgoUsers";
import UserDocuments from "./pages/UserDocuments";
import Reports from "./pages/Reports";
import ReportedUsers from "./pages/ReportedUsers";
import Rescues from "./pages/Rescues";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import SupportTickets from "./pages/SupportTickets";
import Logout from "./pages/Logout";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const PUBLIC_ROUTES = ["/", "/login", "/forgot-password", "/reset-password"];
const AUTO_REFRESH_ROUTES = [
  "/home",
  "/donations",
  "/users/general",
  "/users/vets-ngos",
  "/reports/users",
  "/reports/posts",
  "/rescues",
  "/analytics",
];

function DashboardRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [preferenceVersion, setPreferenceVersion] = useState(0);
  const isDashboardRoute = !PUBLIC_ROUTES.includes(location.pathname);

  useEffect(() => {
    const applyPreferences = () => setPreferenceVersion((version) => version + 1);
    window.addEventListener("dashboard-preferences-changed", applyPreferences);
    window.addEventListener("storage", applyPreferences);
    return () => {
      window.removeEventListener("dashboard-preferences-changed", applyPreferences);
      window.removeEventListener("storage", applyPreferences);
    };
  }, []);

  useEffect(() => {
    if (!isDashboardRoute || !localStorage.getItem("token")) return;

    const minutes = Number(localStorage.getItem("dashboardSessionTimeout") || "30");
    if (minutes <= 0) return;

    let timeoutId = window.setTimeout(logOutForInactivity, minutes * 60 * 1000);

    function logOutForInactivity() {
      localStorage.removeItem("token");
      localStorage.removeItem("adminId");
      sessionStorage.setItem("dashboardSessionExpired", "true");
      navigate("/login", { replace: true });
    }

    const resetTimeout = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(logOutForInactivity, minutes * 60 * 1000);
    };

    const activityEvents: Array<keyof WindowEventMap> = [
      "pointerdown",
      "keydown",
      "scroll",
      "touchstart",
    ];
    activityEvents.forEach((eventName) =>
      window.addEventListener(eventName, resetTimeout, { passive: true })
    );

    return () => {
      window.clearTimeout(timeoutId);
      activityEvents.forEach((eventName) =>
        window.removeEventListener(eventName, resetTimeout)
      );
    };
  }, [isDashboardRoute, location.pathname, navigate, preferenceVersion]);

  useEffect(() => {
    if (!AUTO_REFRESH_ROUTES.includes(location.pathname) || !localStorage.getItem("token")) return;

    const seconds = Number(localStorage.getItem("dashboardRefreshInterval") || "0");
    if (seconds <= 0) return;

    const intervalId = window.setInterval(
      () => setRefreshKey((key) => key + 1),
      seconds * 1000
    );
    return () => window.clearInterval(intervalId);
  }, [isDashboardRoute, location.pathname, preferenceVersion]);

  return (
    <Routes key={`${location.pathname}:${refreshKey}`}>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/home" element={<Home />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/donations" element={<Donations />} />
      <Route path="/users/general" element={<GeneralUsers />} />
      <Route path="/users/vets-ngos" element={<VetsNgoUsers />} />
      <Route path="/users/:id/documents" element={<UserDocuments />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/reports/users" element={<ReportedUsers />} />
      <Route path="/reports/posts" element={<Reports />} />
      <Route path="/rescues" element={<Rescues />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/support-tickets" element={<SupportTickets />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <DashboardRoutes />
    </Router>
  );
}

export default App;
