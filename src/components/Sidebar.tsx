import "./Sidebar.css";
import { NavLink, useLocation } from "react-router-dom";
import logo from '../assets/LogoNew.png';

export default function Sidebar() {
  const location = useLocation();
  const isUsersSection = location.pathname.startsWith("/users");
  const isReportsSection = location.pathname.startsWith("/reports");

  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li>
            <NavLink to="/home" className="nav-link">
              Home
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/users/general"
              className={`nav-link ${isUsersSection ? "active" : ""}`}
            >
              Verify Users
            </NavLink>
          </li>

          <li>
            <NavLink to="/donations" className="nav-link">
              Donations
            </NavLink>
          </li>

          <li>
            <NavLink to="/analytics" className="nav-link">
              System Analytics
            </NavLink>
          </li>

          <li>
            <NavLink to="/rescues" className="nav-link">
              Rescues
            </NavLink>
          </li>

          <li>
            <NavLink to="/notifications" className="nav-link">
              Notifications
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/reports/users"
              className={`nav-link ${isReportsSection ? "active" : ""}`}
            >
              Reports
            </NavLink>
          </li>

          <li>
            <NavLink to="/support-tickets" className="nav-link">
              Support
            </NavLink>
          </li>

          <li>
            <NavLink to="/settings" className="nav-link">
              Settings
            </NavLink>
          </li>

          <li>
            <NavLink to="/logout" className="nav-link">
              Logout
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="sidebar-logo">
        <img src={logo} alt="StrayCare Logo" />
      </div>
    </aside>
  );
}

