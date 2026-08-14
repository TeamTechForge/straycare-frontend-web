import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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

function App() {
  return (
    <Router>
      <Routes>
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
        <Route path="/rescues" element={<Rescues />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/support-tickets" element={<SupportTickets />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
