import React, { useEffect, useState } from "react";

import RecentAlerts from "../../../components/Recentalerts";
import { getRecentAlerts } from "../../../redux/api/parent/ParentdashboardApi";


const Alerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [status, setStatus] = useState("loading");
    const [errorMessage, setErrorMessage] = useState("");

    const loadAlerts = async () => {
        setStatus("loading");
        setErrorMessage("");

        try {
            const data = await getRecentAlerts(50);
            setAlerts(Array.isArray(data) ? data : data.alerts || []);
            setStatus("success");
        } catch (err) {
            console.log(err);
            setErrorMessage(err.message || "Something went wrong.");
            setStatus("error");
        }
    };

    useEffect(() => {
        loadAlerts();
    }, []);

    return (
        <section>
            <header className="parent-dashboard-topbar">
                <div>
                    <p className="parent-dashboard-eyebrow">SAFETY</p>
                    <h1 className="parent-dashboard-title">ALERTS</h1>
                    <p className="parent-dashboard-subtitle">
                        Review recent safety alerts and notifications.
                    </p>
                </div>
                <div className="parent-live-status">
                    <span className="parent-live-dot" />
                    SYSTEM ONLINE
                </div>
            </header>

            <div className="parent-panel">
                {status === "error" ? (
                    <div className="parent-empty-state">
                        <span>!</span>
                        <h2>Couldn't load alerts</h2>
                        <p>{errorMessage}</p>
                    </div>
                ) : (
                    <RecentAlerts alerts={alerts} />
                )}
            </div>
        </section>
    );
};

export default Alerts;