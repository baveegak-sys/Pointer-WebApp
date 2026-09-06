import React from "react";

const StatCard = ({ label, value, hint, tone }) => (
    <div className="parent-stat-card">
        <p className="parent-stat-label">{label}</p>
        <p className={`parent-stat-value ${tone || ""}`.trim()}>{value}</p>
        {hint && <span className="parent-stat-hint">{hint}</span>}
    </div>
);

export default StatCard;