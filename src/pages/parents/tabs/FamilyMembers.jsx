import React, { useEffect, useState } from "react";

import { getFamilyMembers } from "../../../redux/api/parent/ParentdashboardApi";

const FamilyMembers = () => {
    const [members, setMembers] = useState([]);
    const [status, setStatus] = useState("loading");
    const [errorMessage, setErrorMessage] = useState("");

    const loadMembers = async () => {
        setStatus("loading");
        setErrorMessage("");

        try {
            const data = await getFamilyMembers();
            setMembers(Array.isArray(data) ? data : data.members || []);
            setStatus("success");
        } catch (err) {
            console.log(err);
            setErrorMessage(err.message || "Something went wrong.");
            setStatus("error");
        }
    };

    useEffect(() => {
        loadMembers();
    }, []);

    return (
        <section>
            <header className="parent-dashboard-topbar">
                <div>
                    <p className="parent-dashboard-eyebrow">FAMILY</p>
                    <h1 className="parent-dashboard-title">FAMILY MEMBERS</h1>
                    <p className="parent-dashboard-subtitle">
                        View and manage connected family members.
                    </p>
                </div>
                <div className="parent-live-status">
                    <span className="parent-live-dot" />
                    SYSTEM ONLINE
                </div>
            </header>

            <div className="parent-panel">
                {status === "loading" && (
                    <div className="parent-empty-state">
                        <span>F</span>
                        <h2>Loading…</h2>
                        <p>Fetching family members.</p>
                    </div>
                )}

                {status === "error" && (
                    <div className="parent-empty-state">
                        <span>!</span>
                        <h2>Couldn't load members</h2>
                        <p>{errorMessage}</p>
                    </div>
                )}

                {status === "success" && members.length === 0 && (
                    <div className="parent-empty-state">
                        <span>F</span>
                        <h2>No family members yet</h2>
                        <p>Invite a family member to get started.</p>
                    </div>
                )}

                {status === "success" && members.length > 0 && (
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
                                <tr key={member.id || member.name}>
                                    <td>
                                        <div className="parent-member-cell">
                                            <div className="parent-member-avatar">
                                                {member.name
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")
                                                    .slice(0, 2)}
                                            </div>
                                            <span>{member.name}</span>
                                        </div>
                                    </td>
                                    <td className="parent-muted">{member.role}</td>
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
                )}
            </div>
        </section>
    );
};

export default FamilyMembers;