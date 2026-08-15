import "./Home.css";
import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import api from "../api/axios";

import verifyImg from "../assets/verify.png";
import donationsImg from "../assets/donations.png";
import analyticsImg from "../assets/analytics.png";
import rescuesImg from "../assets/rescues.png";

import homeBg1 from "../assets/Home01.jpg";
import homeBg2 from "../assets/Home02.jpg";
import homeBg3 from "../assets/Home03.jpg";
import homeBg4 from "../assets/Home04.jpg";

interface ActionCard {
  to: string;
  img: string;
  alt: string;
  label: string;
  desc: string;
}

interface AdminNotification {
  _id: string;
  title: string;
  message: string;
  audience: string[] | string;
  createdAt: string;
}

const cards: ActionCard[] = [
  {
    to: "/users/general",
    img: verifyImg,
    alt: "Verify Users",
    label: "Verify Users",
    desc: "Review and approve new registrations",
  },
  {
    to: "/donations",
    img: donationsImg,
    alt: "Donations",
    label: "Donations",
    desc: "Track and manage incoming donations",
  },
  {
    to: "/analytics",
    img: analyticsImg,
    alt: "Analytics",
    label: "Analytics",
    desc: "View reports and platform insights",
  },
  {
    to: "/rescues",
    img: rescuesImg,
    alt: "Rescues",
    label: "Rescues",
    desc: "Monitor active rescue operations",
  },
];

const bannerImages: string[] = [
  homeBg1,
  homeBg2,
  homeBg3,
  homeBg4,
];

export default function Home() {
  const [currentImage, setCurrentImage] = useState<number>(0);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);
  const [bellOpen, setBellOpen] = useState<boolean>(false);
  const adminId = localStorage.getItem("adminId") || "current";
  const lastSeenKey = `adminNotificationsLastSeen:${adminId}`;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % bannerImages.length);
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchAdminNotifications();
  }, []);

  const fetchAdminNotifications = async () => {
    try {
      const res = await api.get("/api/admin-notifications");

      const forAdmins = (res.data || []).filter((n: AdminNotification) => {
        if (Array.isArray(n.audience)) {
          return n.audience.includes("admin");
        }
        return n.audience === "Admins";
      });

      const lastSeen = localStorage.getItem(lastSeenKey);
      const unread = lastSeen
        ? forAdmins.filter(
            (notification: AdminNotification) =>
              new Date(notification.createdAt).getTime() > new Date(lastSeen).getTime()
          )
        : forAdmins;

      setAdminNotifications(unread.slice(0, 10));
    } catch (err) {
      console.error("Failed to fetch admin notifications:", err);
    }
  };

  const handleBellToggle = () => {
    setBellOpen((open) => {
      const nextOpen = !open;
      if (nextOpen && adminNotifications.length > 0) {
        const newestTimestamp = adminNotifications.reduce(
          (latest, notification) =>
            Math.max(latest, new Date(notification.createdAt).getTime()),
          Date.now()
        );
        localStorage.setItem(lastSeenKey, new Date(newestTimestamp).toISOString());
      }
      return nextOpen;
    });
  };

  const dismissViewedNotifications = () => {
    setBellOpen(false);
    setAdminNotifications([]);
  };

  return (
    <div className="home-container">
      <Sidebar />

      <main className="main-content">
        <div className="content">

          <div className="banner">
            {bannerImages.map((img, i) => (
              <div
                key={i}
                className={`banner-slide ${
                  i === currentImage ? "active" : ""
                }`}
                style={{ backgroundImage: `url(${img})` }}
              />
            ))}

            <div className="admin-bell-wrap">
              <button
                className="admin-bell-btn"
                onClick={bellOpen ? dismissViewedNotifications : handleBellToggle}
                aria-label="Admin notifications"
              >
                🔔
                {adminNotifications.length > 0 && !bellOpen && (
                  <span className="admin-bell-badge">
                    {adminNotifications.length}
                  </span>
                )}
              </button>

              {bellOpen && (
                <div className="admin-bell-dropdown">
                  <p className="admin-bell-title">Admin Notifications</p>

                  {adminNotifications.length === 0 ? (
                    <p className="admin-bell-empty">No admin notifications yet.</p>
                  ) : (
                    adminNotifications.map((n) => (
                      <div className="admin-bell-item" key={n._id}>
                        <strong>{n.title}</strong>
                        <p>{n.message}</p>
                        <small>
                          {new Date(n.createdAt).toLocaleString()}
                        </small>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="banner-dots">
              {bannerImages.map((_, i) => (
                <button
                  key={i}
                  className={`banner-dot ${
                    i === currentImage ? "active" : ""
                  }`}
                  onClick={() => setCurrentImage(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <div className="banner-curve">
              <svg
                viewBox="0 0 1440 140"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,0 Q360,120 720,40 Q1080,-40 1440,70 L1440,88 Q1080,-22 720,58 Q360,138 0,18 Z"
                  fill="#ef9f27"
                />

                <path
                  d="M0,18 Q360,138 720,58 Q1080,-22 1440,88 L1440,140 L0,140 Z"
                  fill="#f7f5f0"
                />
              </svg>
            </div>
          </div>

          <div className="action-grid">
            {cards.map((card) => (
              <NavLink
                to={card.to}
                className="action-card"
                key={card.to}
              >
                <div className="card-icon-wrap">
                  <img
                    src={card.img}
                    alt={card.alt}
                    className="card-icon"
                  />
                </div>

                <div className="card-text">
                  <span className="card-label">
                    {card.label}
                  </span>

                  <span className="card-desc">
                    {card.desc}
                  </span>
                </div>

                <span className="card-arrow">›</span>
              </NavLink>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}

