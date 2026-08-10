import React, { useEffect, useState } from "react";

const USERS_ENDPOINT = "http://localhost:5001/api/users/getAllParents";

const getInitials = (name = "") =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "?";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [status, setStatus] = useState("loading"); // loading | success | error
    const [errorMessage, setErrorMessage] = useState("");

    const getAllParents = async () => {
        setStatus("loading");
        setErrorMessage("");

        try {
            const token = localStorage.getItem("accessToken");

            const res = await fetch(USERS_ENDPOINT, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                if (res.status === 401) {
                    throw new Error("Your session has expired. Please log in again.");
                }

                if (res.status === 403) {
                    throw new Error("Admin access is required to view this page.");
                }

                throw new Error(`Request failed with status ${res.status}`);
            }

            const data = await res.json();

            const allUsers = Array.isArray(data)
                ? data
                : data.users || data.data || [];

            const parents = allUsers.filter(
                (u) => (u.role || "").toLowerCase() === "parent"
            );

            setUsers(parents);
            setStatus("success");
        } catch (err) {
            console.log(err);
            setErrorMessage(err.message || "Something went wrong.");
            setStatus("error");
        }
    };

    useEffect(() => {
        getAllParents();
    }, []);

    return (
        <>
            <div className="dashboard-topbar">
                <div>
                    <p className="dashboard-eyebrow">PARENT MANAGEMENT</p>
                    <h1 className="dashboard-title">PARENTS</h1>
                    <p className="dashboard-subtitle">
                        Parent accounts currently registered in the system.
                    </p>
                </div>

                <div className={`live-status ${status === "error" ? "error" : ""}`}>
                    <span className={`live-dot ${status === "error" ? "error" : ""}`} />
                    {status === "loading"
                        ? "SYNCING"
                        : status === "error"
                            ? "OFFLINE"
                            : `${users.length} PARENT${users.length === 1 ? "" : "S"}`}
                </div>
            </div>

            <div className="dashboard-card">
                {status === "loading" && (
                    <div className="dashboard-state">
                        <strong>Loading parents…</strong>
                        <span>Fetching the latest records from the server.</span>
                    </div>
                )}

                {status === "error" && (
                    <div className="dashboard-state">
                        <strong>Couldn't load users</strong>
                        <span>{errorMessage}</span>
                        <button className="retry-button" onClick={getAllParents}>
                            RETRY
                        </button>
                    </div>
                )}

                {status === "success" && users.length === 0 && (
                    <div className="dashboard-state">
                        <strong>No parent accounts yet</strong>
                        <span>Parents will show up here once they sign up.</span>
                    </div>
                )}

                {status === "success" && users.length > 0 && (
                    <table className="user-table">
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Role</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user, i) => (
                            <tr key={user._id || user.id || i}>
                                <td>
                                    <div className="user-name-cell">
                      <span className="user-avatar">
                        {getInitials(user.name || user.fullName)}
                      </span>
                                        {user.name || user.fullName || "—"}
                                    </div>
                                </td>
                                <td>{user.email || "—"}</td>
                                <td>{user.phone || user.phoneNumber || "—"}</td>
                                <td>
                                    <span className="role-badge">{user.role || "parent"}</span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
};

export default UserManagement;