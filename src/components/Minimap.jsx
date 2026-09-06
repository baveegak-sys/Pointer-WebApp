import React from "react";

// Decorative map panel — plots pins using each member's normalized
// coordinates if provided (x/y as 0-1 fractions), otherwise spreads
// them out evenly so the layout still works with any member count.
const MiniMap = ({ members = [], className = "" }) => {
    return (
        <div className={`parent-map ${className}`.trim()}>
            <div className="parent-map-grid" />
            <div className="parent-map-center-line horizontal" />
            <div className="parent-map-center-line vertical" />

            {members.map((member, i) => {
                const left =
                    member.x != null
                        ? `${member.x * 100}%`
                        : `${15 + (i * 70) / Math.max(members.length - 1, 1)}%`;
                const top =
                    member.y != null ? `${member.y * 100}%` : `${25 + (i % 3) * 25}%`;

                return (
                    <span
                        key={member.id || member.name}
                        className="parent-map-pin"
                        style={{ left, top }}
                        title={member.status || ""}
                    >
                        {member.name?.split(" ")[0] || "?"}
                    </span>
                );
            })}
        </div>
    );
};

export default MiniMap;