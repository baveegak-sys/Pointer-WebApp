import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../../redux/features/auth/authApi";
import { logout } from "../../redux/features/auth/authSlice";
import UserManagement from "./UserManagement";
import "../../css/dashboard/admin-dashboard.css";

const NAV_ITEMS = [{ key: "users", label: "User Management", icon: "U" }];

const Dashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [logoutApi, { isLoading }] = useLogoutMutation();
    const [activeTab, setActiveTab] = useState("users");

    const handleLogout = async () => {
        try {
            await logoutApi().unwrap();
        } catch (error) {
            console.log(error);
        } finally {
            dispatch(logout());
            navigate("/login", { replace: true });
        }
    };

    return (
        <div className="dashboard-page">
            <aside className="dashboard-sidebar">
                <div className="dashboard-brand">
                    <div className="brand-icon">A</div>
                    <p className="brand-name">ADMIN</p>
                </div>

                <nav className="dashboard-nav">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.key}
                            className={`dashboard-nav-item ${
                                activeTab === item.key ? "active" : ""
                            }`}
                            onClick={() => setActiveTab(item.key)}
                        >
                            <span className="dashboard-nav-icon">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="dashboard-sidebar-footer">
                    <button
                        className="dashboard-logout-button"
                        onClick={handleLogout}
                        disabled={isLoading}
                    >
                        {isLoading ? "LOGGING OUT..." : "LOGOUT"}
                    </button>
                </div>
            </aside>

            <main className="dashboard-main">
                {activeTab === "users" && <UserManagement />}
            </main>
        </div>
    );
};

export default Dashboard;