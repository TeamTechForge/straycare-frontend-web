import "./Home.css";
import Sidebar from "../components/Sidebar";   
import HomeBg from "../assets/Home.jpg";       

// Import images for buttons
import verifyImg from "../assets/verify.png";
import donationsImg from "../assets/donations.png";
import analyticsImg from "../assets/analytics.png";
import rescuesImg from "../assets/rescues.png";

import { NavLink } from "react-router-dom";

export default function Home() {
  return (
    <div className="home-container">
      {/* Sidebar on the left */}
      <Sidebar />

      {/* Main Content on the right */}
      <main className="main-content">
        <div
          className="background-image"
          style={{ backgroundImage: `url(${HomeBg})` }}
        ></div>

        <div className="content">
          {/* Welcome text */}
          <div className="welcome">
            <h1>Welcome back, Admin</h1>
          </div>

          {/* Action buttons grid */}
          <div className="action-grid">
            <NavLink to="/users/general" className="action-btn">
             <img src={verifyImg} alt="Verify Users" className="btn-icon" />
             <span>Verify Users</span>
           </NavLink>


            <NavLink to="/donations" className="action-btn">
              <img src={donationsImg} alt="Donations" className="btn-icon" />
              <span>Donations</span>
            </NavLink>

            <NavLink to="/analytics" className="action-btn">
              <img src={analyticsImg} alt="Analytics" className="btn-icon" />
              <span>Analytics</span>
            </NavLink>

            <NavLink to="/rescues" className="action-btn">
              <img src={rescuesImg} alt="Rescues" className="btn-icon" />
              <span>Rescues</span>
            </NavLink>
          </div>
        </div>
      </main>
    </div>
  );
}


