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

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route goes to Login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Login route */}
        <Route path="/login" element={<Login />} />

        {/* Home route */}
        <Route path="/home" element={<Home />} />

        {/* Notifications route */}
        <Route path="/notifications" element={<Notifications />} />

        {/* Donations route */}
        <Route path="/donations" element={<Donations />} />

        {/* User Management routes */}
        <Route path="/users/general" element={<GeneralUsers />} />   
        <Route path="/users/vets-ngos" element={<VetsNgoUsers />} /> 
        <Route path="/users/:id/documents" element={<UserDocuments />} /> 

        {/* Reports route */}
        <Route path="/reports" element={<Reports />} />

        {/* Reported Users route */}
        <Route path="/reports/users" element={<ReportedUsers />} />

        {/* Rescues route */}
        <Route path="/rescues" element={<Rescues />} />   

        {/* Settings route */}
        <Route path="/settings" element={<Settings />} /> 

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;

