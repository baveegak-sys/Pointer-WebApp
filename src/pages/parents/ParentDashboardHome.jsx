import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { useLogoutMutation } from "../../redux/features/auth/authApi";
import { logout } from "../../redux/features/auth/authSlice";

import { NAV_ITEMS } from "../../config/Navconfig ";
import Overview from "./tabs/Overview";
import FamilyMembers from "./tabs/FamilyMembers";
import LiveMap from "./tabs/LiveMap";
import Alerts from "./tabs/Alerts";
import Geofences from "./tabs/Geofences";
import Location from "./tabs/Location";

import "../../css/dashboard/parent-dashboard.css";

const TAB_COMPONENTS = {
    overview: Overview,
    members: FamilyMembers,
    map: LiveMap,
    alerts: Alerts,
    geofences: Geofences,
    location: Location,
};

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

            navigate("/login", { replace: true });
        }
    };

    const ActiveTab = TAB_COMPONENTS[activeTab] || Overview;

    return (
        <div className="parent-dashboard-page">
            <aside className="parent-dashboard-sidebar">
                <div className="parent-dashboard-brand">
                    <div className="parent-brand-icon">P</div>
                    <div>
                        <p className="parent-brand-name">POINTER</p>
                        <span className="parent-brand-role">PARENT</span>
                    </div>
                </div>

                <nav className="parent-dashboard-nav">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.key}
                            className={`parent-dashboard-nav-item ${
                                activeTab === item.key ? "active" : ""
                            }`}
                            onClick={() => setActiveTab(item.key)}
                        >
                            <span className="parent-dashboard-nav-icon">{item.icon}</span>
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
                        {isLoading ? "LOGGING OUT..." : "LOGOUT"}
                    </button>
                </div>
            </aside>

            <main className="parent-dashboard-main">
                <ActiveTab />
            </main>
        </div>
    );
};

export default ParentDashboard;