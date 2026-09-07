import React from "react";

const RecentAlerts = ({ alerts = [] }) => {
    if (alerts.length === 0) {
        return (
            <div className="parent-empty-state">
                <span>A</span>
                <h2>No alerts</h2>
                <p>You're all caught up — nothing to review right now.</p>
            </div>
        );
    }

    return (
        <div className="parent-alert-list">
            {alerts.map((alert, index) => (
                <div key={alert.id || index} className="parent-alert-item">
                    <span className={`parent-alert-dot ${alert.level || "info"}`} />
                    <div className="parent-alert-content">
                        <p className="parent-alert-text">
                            {alert.label || alert.message}
                        </p>
                        <p className="parent-alert-time">{alert.time}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RecentAlerts;