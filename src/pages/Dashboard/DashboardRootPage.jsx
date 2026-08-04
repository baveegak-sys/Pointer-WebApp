import React from "react";
import { Link, useNavigate } from "react-router-dom";

import "../../css/Dashboard.css";

const members = [
    { name: "Ava Chen", role: "Guardian", status: "Home", lastPing: "12s ago" },
    { name: "Leo Chen", role: "Dependent", status: "In transit", lastPing: "4s ago" },
    { name: "Maya Chen", role: "Dependent", status: "At school", lastPing: "1m ago" },
];

const alerts = [
    { label: "Geofence exit — Leo left \"School\" zone", time: "8:14 AM", level: "info" },
    { label: "Route deviation detected — Maya", time: "Yesterday, 4:52 PM", level: "warn" },
    { label: "SOS resolved — Leo", time: "Mon, 6:03 PM", level: "danger" },
];

const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate("/login");
    };

    return (
        <div className="dash-shell">
            <aside className="dash-sidebar">
                <div className="dash-brand">
                    <div className="brand-icon">P</div>
                    <p className="brand-name">POINTER</p>
                </div>

                <nav className="dash-nav">
                    <Link className="dash-nav-item active" to="/dashboard">Overview</Link>
                    <Link className="dash-nav-item" to="/dashboard/members">Family members</Link>
                    <Link className="dash-nav-item" to="/dashboard/map">Live map</Link>
                    <Link className="dash-nav-item" to="/dashboard/alerts">Alerts</Link>
                    <Link className="dash-nav-item" to="/dashboard/geofences">Geofences</Link>
                    <Link className="dash-nav-item" to="/dashboard/settings">Settings</Link>
                </nav>

                <button className="dash-logout" onClick={handleLogout}>
                    Log out
                </button>
            </aside>

            <div className="dash-main">
                <header className="dash-topbar">
                    <div>
                        <p className="dash-eyebrow">OVERVIEW</p>
                        <h1 className="dash-title">Family circle status</h1>
                    </div>
                    <div className="live-status">
                        <span className="live-dot" />
                        SYSTEM ONLINE
                    </div>
                </header>

                <section className="dash-stats">
                    <div className="stat-card">
                        <p className="stat-label">Active members</p>
                        <p className="stat-value">3 / 3</p>
                    </div>
                    <div className="stat-card">
                        <p className="stat-label">Alerts today</p>
                        <p className="stat-value stat-warn">2</p>
                    </div>
                    <div className="stat-card">
                        <p className="stat-label">Avg. ETA accuracy</p>
                        <p className="stat-value">96%</p>
                    </div>
                    <div className="stat-card">
                        <p className="stat-label">System uptime</p>
                        <p className="stat-value">99.98%</p>
                    </div>
                </section>

                <section className="dash-grid">
                    <div className="panel">
                        <div className="panel-header">
                            <h2>Family members</h2>
                            <span className="panel-hint">Real-time status</span>
                        </div>

                        <table className="dash-table">
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Last ping</th>
                            </tr>
                            </thead>
                            <tbody>
                            {members.map((m) => (
                                <tr key={m.name}>
                                    <td>{m.name}</td>
                                    <td className="muted">{m.role}</td>
                                    <td>
                                        <span className="pill pill-live">{m.status}</span>
                                    </td>
                                    <td className="mono muted">{m.lastPing}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="panel">
                        <div className="panel-header">
                            <h2>Recent alerts</h2>
                            <span className="panel-hint">Last 24h</span>
                        </div>

                        <ul className="alert-list">
                            {alerts.map((a, i) => (
                                <li key={i} className={`alert-item alert-${a.level}`}>
                                    <span className="alert-dot" />
                                    <div>
                                        <p className="alert-text">{a.label}</p>
                                        <p className="alert-time mono">{a.time}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="panel panel-map">
                        <div className="panel-header">
                            <h2>Live map</h2>
                            <span className="panel-hint">3 devices reporting</span>
                        </div>
                        <div className="map-placeholder">
                            <span className="map-grid" />
                            <span className="map-pin map-pin-1">Ava</span>
                            <span className="map-pin map-pin-2">Leo</span>
                            <span className="map-pin map-pin-3">Maya</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;