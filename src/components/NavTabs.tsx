import { NavLink, useLocation } from "react-router-dom";
import "./NavTabs.css";

interface Tab {
  label: string;
  to?: string;
  disabled?: boolean;
}

interface NavTabsProps {
  tabs: Tab[];
}

export default function NavTabs({ tabs }: NavTabsProps) {
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
            to={tab.to || "/"}
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