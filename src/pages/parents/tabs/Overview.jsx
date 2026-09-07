import React, { useEffect, useState } from "react";

import StatCard from "../../../components/Statcard";
import { getOverviewStats } from "../../../redux/api/parent/ParentdashboardApi";

const Overview = () => {
    const [profile, setProfile] = useState(null);
    const [devices, setDevices] = useState([]);
    const [status, setStatus] = useState("loading"); // loading | success | error
    const [errorMessage, setErrorMessage] = useState("");

    const loadOverview = async () => {
        setStatus("loading");
        setErrorMessage("");

        try {
            const statsRes = await getOverviewStats();

            // getOverviewStats() hits /users/me, which returns { success, message, data }
            const userData = statsRes?.data || {};

            setProfile(userData);
            setDevices(userData.devices || []);
            setStatus("success");
        } catch (err) {
            console.log(err);
            setErrorMessage(err.message || "Something went wrong.");
            setStatus("error");
        }
    };

    useEffect(() => {
        loadOverview();
    }, []);

    const activeDeviceCount = devices.filter((d) => d.isActive).length;

    return (
        <>
            <header className="parent-dashboard-topbar">
                <div>
                    <p className="parent-dashboard-eyebrow">OVERVIEW</p>
                    <h1 className="parent-dashboard-title">FAMILY CIRCLE STATUS</h1>
                    <p className="parent-dashboard-subtitle">
                        Monitor your account and device activity.
                    </p>
                </div>

                <div className="parent-live-status">
                    <span className="parent-live-dot" />
                    {status === "error" ? "SYSTEM OFFLINE" : "SYSTEM ONLINE"}
                </div>
            </header>

            {status === "error" ? (
                <div className="parent-empty-state">
                    <span>!</span>
                    <h2>Couldn't load overview</h2>
                    <p>{errorMessage}</p>
                    <button
                        className="parent-dashboard-logout"
                        style={{ width: "auto", padding: "0 20px", marginTop: "10px" }}
                        onClick={loadOverview}
                    >
                        RETRY
                    </button>
                </div>
            ) : (
                <>
                    <section className="parent-dashboard-stats">
                        <StatCard
                            label="Devices"
                            value={status === "loading" ? "—" : devices.length}
                            hint={`${activeDeviceCount} active`}
                        />
                        <StatCard
                            label="Account Status"
                            value={status === "loading" ? "—" : profile?.isActive ? "Active" : "Inactive"}
                            hint={profile?.email || ""}
                        />
                    </section>

                    <section className="parent-panel">
                        <div className="parent-panel-header">
                            <div>
                                <p className="parent-panel-eyebrow">DEVICES</p>
                                <h2>Your Devices</h2>
                            </div>
                            <span className="parent-panel-hint">
                                {devices.length} REGISTERED
                            </span>
                        </div>

                        {devices.length === 0 ? (
                            <div className="parent-empty-state">
                                <span>D</span>
                                <h2>No devices yet</h2>
                                <p>Devices you register will show up here.</p>
                            </div>
                        ) : (
                            <div className="parent-table-wrapper">
                                <table className="parent-dashboard-table">
                                    <thead>
                                    <tr>
                                        <th>Device Name</th>
                                        <th>Serial Number</th>
                                        <th>Status</th>
                                        <th>Last Seen</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {devices.map((device) => (
                                        <tr key={device._id}>
                                            <td>{device.deviceName}</td>
                                            <td className="parent-mono">
                                                {device.serialNumber}
                                            </td>
                                            <td>
                                                    <span className="parent-status-pill">
                                                        {device.isActive ? "Active" : "Inactive"}
                                                    </span>
                                            </td>
                                            <td className="parent-muted parent-mono">
                                                {device.localTime || "—"}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </>
            )}
        </>
    );
};

export default Overview;