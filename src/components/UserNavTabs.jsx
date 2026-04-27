import { NavLink, useLocation } from "react-router-dom";
import "./UserNavTabs.css";

export default function UserNavTabs() {
  const location = useLocation();
  const isVerificationPage = location.pathname.includes("/users/") && location.pathname.includes("/documents");

  return (
    <div className="user-nav-tabs">
      <NavLink
        to="/users/general"
        className={({ isActive }) => `tab ${isActive ? "active" : ""}`}
      >
        Users
      </NavLink>
      <NavLink
        to="/users/vets-ngos"
        className={({ isActive }) => `tab ${isActive ? "active" : ""}`}
      >
        Organizations
      </NavLink>
      {isVerificationPage ? (
        <NavLink to={location.pathname} className="tab active">
          User Verification
        </NavLink>
      ) : (
        <span className="tab disabled">User Verification</span>
      )}
    </div>
  );
}

