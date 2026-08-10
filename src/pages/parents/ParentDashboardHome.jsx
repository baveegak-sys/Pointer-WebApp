import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { useLogoutMutation } from "../../redux/features/auth/authApi";
import { logout } from "../../redux/features/auth/authSlice";

import "../../css/dashboard/parent-dashboard.css";

const NAV_ITEMS = [
    { key: "overview", label: "Overview", icon: "O" },
    { key: "members", label: "Family Members", icon: "F" },
    { key: "map", label: "Live Map", icon: "M" },
    { key: "alerts", label: "Alerts", icon: "A" },
    { key: "geofences", label: "Geofences", icon: "G" },
    { key: "settings", label: "Settings", icon: "S" },
];

const members = [
    {
        name: "Ava Chen",
        role: "Guardian",
        status: "Home",
        lastPing: "12s ago",
    },
    {
        name: "Leo Chen",
        role: "Dependent",
        status: "In transit",
        lastPing: "4s ago",
    },
    {
        name: "Maya Chen",
        role: "Dependent",
        status: "At school",
        lastPing: "1m ago",
    },
];

const alerts = [
    {
        label: 'Geofence exit — Leo left "School" zone',
        time: "8:14 AM",
        level: "info",
    },
    {
        label: "Route deviation detected — Maya",
        time: "Yesterday, 4:52 PM",
        level: "warn",
    },
    {
        label: "SOS resolved — Leo",
        time: "Mon, 6:03 PM",
        level: "danger",
    },
];

const ParentDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [logoutApi, { isLoading }] = useLogoutMutation();

    const [activeTab, setActiveTab] = useState("overview");

    const handleLogout = async () => {
        try {
            await logoutApi().unwrap();
        } catch (error) {
            console.log("Logout error:", error);
        } finally {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");

            dispatch(logout());

            navigate("/login", {
                replace: true,
            });
        }
    };

    return (
        <div className="parent-dashboard-page">

            {/* Sidebar */}

            <aside className="parent-dashboard-sidebar">

                <div className="parent-dashboard-brand">
                    <div className="parent-brand-icon">
                        P
                    </div>

                    <div>
                        <p className="parent-brand-name">
                            POINTER
                        </p>

                        <span className="parent-brand-role">
              PARENT
            </span>
                    </div>
                </div>

                <nav className="parent-dashboard-nav">

                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.key}
                            className={`parent-dashboard-nav-item ${
                                activeTab === item.key
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                setActiveTab(item.key)
                            }
                        >
              <span className="parent-dashboard-nav-icon">
                {item.icon}
              </span>

                            {item.label}
                        </button>
                    ))}

                </nav>

                <div className="parent-dashboard-sidebar-footer">

                    <button
                        className="parent-dashboard-logout"
                        onClick={handleLogout}
                        disabled={isLoading}
                    >
                        {isLoading
                            ? "LOGGING OUT..."
                            : "LOGOUT"}
                    </button>

                </div>

            </aside>

            {/* Main Content */}

            <main className="parent-dashboard-main">

                {/* OVERVIEW */}

                {activeTab === "overview" && (
                    <>
                        <header className="parent-dashboard-topbar">

                            <div>
                                <p className="parent-dashboard-eyebrow">
                                    OVERVIEW
                                </p>

                                <h1 className="parent-dashboard-title">
                                    FAMILY CIRCLE STATUS
                                </h1>

                                <p className="parent-dashboard-subtitle">
                                    Monitor your family members,
                                    alerts and device activity.
                                </p>
                            </div>

                            <div className="parent-live-status">
                                <span className="parent-live-dot" />
                                SYSTEM ONLINE
                            </div>

                        </header>

                        {/* Stats */}

                        <section className="parent-dashboard-stats">

                            <div className="parent-stat-card">
                                <p className="parent-stat-label">
                                    Active Members
                                </p>

                                <p className="parent-stat-value">
                                    3 / 3
                                </p>

                                <span className="parent-stat-hint">
                  All devices connected
                </span>
                            </div>

                            <div className="parent-stat-card">
                                <p className="parent-stat-label">
                                    Alerts Today
                                </p>

                                <p className="parent-stat-value warning">
                                    2
                                </p>

                                <span className="parent-stat-hint">
                  Requires attention
                </span>
                            </div>

                            <div className="parent-stat-card">
                                <p className="parent-stat-label">
                                    ETA Accuracy
                                </p>

                                <p className="parent-stat-value">
                                    96%
                                </p>

                                <span className="parent-stat-hint">
                  Current average
                </span>
                            </div>

                            <div className="parent-stat-card">
                                <p className="parent-stat-label">
                                    System Uptime
                                </p>

                                <p className="parent-stat-value">
                                    99.98%
                                </p>

                                <span className="parent-stat-hint">
                  Service operational
                </span>
                            </div>

                        </section>

                        {/* Dashboard Grid */}

                        <section className="parent-dashboard-grid">

                            {/* Family Members */}

                            <div className="parent-panel">

                                <div className="parent-panel-header">
                                    <div>
                                        <p className="parent-panel-eyebrow">
                                            FAMILY
                                        </p>

                                        <h2>
                                            Family Members
                                        </h2>
                                    </div>

                                    <span className="parent-panel-hint">
                    REAL-TIME STATUS
                  </span>
                                </div>

                                <div className="parent-table-wrapper">

                                    <table className="parent-dashboard-table">

                                        <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th>Last Ping</th>
                                        </tr>
                                        </thead>

                                        <tbody>

                                        {members.map((member) => (
                                            <tr key={member.name}>

                                                <td>
                                                    <div className="parent-member-cell">

                                                        <div className="parent-member-avatar">
                                                            {member.name
                                                                .split(" ")
                                                                .map((name) => name[0])
                                                                .join("")
                                                                .slice(0, 2)}
                                                        </div>

                                                        <span>
                                {member.name}
                              </span>

                                                    </div>
                                                </td>

                                                <td className="parent-muted">
                                                    {member.role}
                                                </td>

                                                <td>
                            <span className="parent-status-pill">
                              {member.status}
                            </span>
                                                </td>

                                                <td className="parent-muted parent-mono">
                                                    {member.lastPing}
                                                </td>

                                            </tr>
                                        ))}

                                        </tbody>

                                    </table>

                                </div>

                            </div>

                            {/* Alerts */}

                            <div className="parent-panel">

                                <div className="parent-panel-header">
                                    <div>
                                        <p className="parent-panel-eyebrow">
                                            ACTIVITY
                                        </p>

                                        <h2>
                                            Recent Alerts
                                        </h2>
                                    </div>

                                    <span className="parent-panel-hint">
                    LAST 24H
                  </span>
                                </div>

                                <div className="parent-alert-list">

                                    {alerts.map((alert, index) => (
                                        <div
                                            key={index}
                                            className="parent-alert-item"
                                        >

                      <span
                          className={`parent-alert-dot ${alert.level}`}
                      />

                                            <div className="parent-alert-content">

                                                <p className="parent-alert-text">
                                                    {alert.label}
                                                </p>

                                                <p className="parent-alert-time">
                                                    {alert.time}
                                                </p>

                                            </div>

                                        </div>
                                    ))}

                                </div>

                            </div>

                            {/* Map */}

                            <div className="parent-panel parent-map-panel">

                                <div className="parent-panel-header">

                                    <div>
                                        <p className="parent-panel-eyebrow">
                                            LOCATION
                                        </p>

                                        <h2>
                                            Live Map
                                        </h2>
                                    </div>

                                    <span className="parent-panel-hint">
                    3 DEVICES REPORTING
                  </span>

                                </div>

                                <div className="parent-map">

                                    <div className="parent-map-grid" />

                                    <div className="parent-map-center-line horizontal" />
                                    <div className="parent-map-center-line vertical" />

                                    <span className="parent-map-pin pin-1">
                    Ava
                  </span>

                                    <span className="parent-map-pin pin-2">
                    Leo
                  </span>

                                    <span className="parent-map-pin pin-3">
                    Maya
                  </span>

                                </div>

                            </div>

                        </section>
                    </>
                )}

                {/* FAMILY MEMBERS */}

                {activeTab === "members" && (
                    <section>

                        <PageHeader
                            eyebrow="FAMILY"
                            title="FAMILY MEMBERS"
                            subtitle="View and manage connected family members."
                        />

                        <div className="parent-panel">

                            <div className="parent-table-wrapper">

                                <table className="parent-dashboard-table">

                                    <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Last Ping</th>
                                    </tr>
                                    </thead>

                                    <tbody>

                                    {members.map((member) => (
                                        <tr key={member.name}>

                                            <td>
                                                <div className="parent-member-cell">

                                                    <div className="parent-member-avatar">
                                                        {member.name
                                                            .split(" ")
                                                            .map((name) => name[0])
                                                            .join("")
                                                            .slice(0, 2)}
                                                    </div>

                                                    {member.name}

                                                </div>
                                            </td>

                                            <td className="parent-muted">
                                                {member.role}
                                            </td>

                                            <td>
                          <span className="parent-status-pill">
                            {member.status}
                          </span>
                                            </td>

                                            <td className="parent-muted">
                                                {member.lastPing}
                                            </td>

                                        </tr>
                                    ))}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </section>
                )}

                {/* LIVE MAP */}

                {activeTab === "map" && (
                    <section>

                        <PageHeader
                            eyebrow="LOCATION"
                            title="LIVE MAP"
                            subtitle="View the latest reported location of connected devices."
                        />

                        <div className="parent-panel">

                            <div className="parent-map parent-full-map">

                                <div className="parent-map-grid" />

                                <span className="parent-map-pin pin-1">
                  Ava
                </span>

                                <span className="parent-map-pin pin-2">
                  Leo
                </span>

                                <span className="parent-map-pin pin-3">
                  Maya
                </span>

                            </div>

                        </div>

                    </section>
                )}

                {/* ALERTS */}

                {activeTab === "alerts" && (
                    <section>

                        <PageHeader
                            eyebrow="SAFETY"
                            title="ALERTS"
                            subtitle="Review recent safety alerts and notifications."
                        />

                        <div className="parent-panel">

                            <div className="parent-alert-list">

                                {alerts.map((alert, index) => (
                                    <div
                                        key={index}
                                        className="parent-alert-item"
                                    >

                    <span
                        className={`parent-alert-dot ${alert.level}`}
                    />

                                        <div className="parent-alert-content">

                                            <p className="parent-alert-text">
                                                {alert.label}
                                            </p>

                                            <p className="parent-alert-time">
                                                {alert.time}
                                            </p>

                                        </div>

                                    </div>
                                ))}

                            </div>

                        </div>

                    </section>
                )}

                {/* GEOFENCES */}

                {activeTab === "geofences" && (
                    <section>

                        <PageHeader
                            eyebrow="LOCATION SAFETY"
                            title="GEOFENCES"
                            subtitle="Manage safe zones for your family."
                        />

                        <div className="parent-empty-state">
                            <span>G</span>

                            <h2>
                                Geofence Management
                            </h2>

                            <p>
                                Your geofence settings will
                                appear here.
                            </p>
                        </div>

                    </section>
                )}

                {/* SETTINGS */}

                {activeTab === "settings" && (
                    <section>

                        <PageHeader
                            eyebrow="ACCOUNT"
                            title="SETTINGS"
                            subtitle="Manage your account and notification preferences."
                        />

                        <div className="parent-empty-state">

                            <span>S</span>

                            <h2>
                                Account Settings
                            </h2>

                            <p>
                                Parent account settings will
                                appear here.
                            </p>

                        </div>

                    </section>
                )}

            </main>

        </div>
    );
};

const PageHeader = ({
                        eyebrow,
                        title,
                        subtitle,
                    }) => {
    return (
        <header className="parent-dashboard-topbar">

            <div>
                <p className="parent-dashboard-eyebrow">
                    {eyebrow}
                </p>

                <h1 className="parent-dashboard-title">
                    {title}
                </h1>

                <p className="parent-dashboard-subtitle">
                    {subtitle}
                </p>
            </div>

            <div className="parent-live-status">
                <span className="parent-live-dot" />
                SYSTEM ONLINE
            </div>

        </header>
    );
};

export default ParentDashboard;