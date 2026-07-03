import { NavLink, useLocation } from "react-router-dom";
import "./NavTabs.css";

/**
 * Generic tab navigation.
 * tabs: array of { label, to, disabled? }
 * A tab with disabled: true renders as non-clickable text (e.g. "coming soon" features).
 */
export default function NavTabs({ tabs }) {
  const location = useLocation();

  return (
    <div className="nav-tabs">
      {tabs.map((tab) =>
        tab.disabled ? (
          <span key={tab.label} className="tab disabled">
            {tab.label}
          </span>
        ) : (
          <NavLink
            key={tab.label}
            to={tab.to}
            className={({ isActive }) =>
              `tab ${isActive || location.pathname === tab.to ? "active" : ""}`
            }
          >
            {tab.label}
          </NavLink>
        )
      )}
    </div>
  );
}