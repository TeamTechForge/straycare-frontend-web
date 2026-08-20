import { useEffect } from "react";
import type { ReactNode } from "react";
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
import ProtectedRoute from "./components/ProtectedRoute";
import { ConfirmationProvider } from "./components/ConfirmationProvider";

const PUBLIC_ROUTES = ["/", "/login", "/forgot-password", "/reset-password"];

function DashboardRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboardRoute = !PUBLIC_ROUTES.includes(location.pathname);
  const protect = (page: ReactNode) => <ProtectedRoute>{page}</ProtectedRoute>;

  // End authenticated dashboard sessions after 30 minutes without activity.
  useEffect(() => {
    if (!isDashboardRoute || !localStorage.getItem("token")) return;

    const minutes = 30;

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
  }, [isDashboardRoute, location.pathname, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/home" element={protect(<Home />)} />
      <Route path="/notifications" element={protect(<Notifications />)} />
      <Route path="/donations" element={protect(<Donations />)} />
      <Route path="/users/general" element={protect(<GeneralUsers />)} />
      <Route path="/users/vets-ngos" element={protect(<VetsNgoUsers />)} />
      <Route path="/users/verifications" element={protect(<VetsNgoUsers />)} />
      <Route path="/users/:id/documents" element={protect(<UserDocuments />)} />
      <Route path="/reports" element={protect(<Reports />)} />
      <Route path="/reports/users" element={protect(<ReportedUsers />)} />
      <Route path="/reports/posts" element={protect(<Reports />)} />
      <Route path="/rescues" element={protect(<Rescues />)} />
      <Route path="/settings" element={protect(<Settings />)} />
      <Route path="/analytics" element={protect(<Analytics />)} />
      <Route path="/support-tickets" element={protect(<SupportTickets />)} />
      <Route path="/logout" element={protect(<Logout />)} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      {/* Makes the same in-app confirmation dialog available on every page. */}
      <ConfirmationProvider>
        <DashboardRoutes />
      </ConfirmationProvider>
    </Router>
  );
}

export default App;
