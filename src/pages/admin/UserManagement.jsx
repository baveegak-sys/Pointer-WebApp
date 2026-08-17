import React, { useEffect, useMemo, useState } from "react";

const USERS_ENDPOINT = "http://localhost:5001/api/users/getAllParents";
// Adjust these two to match your actual backend routes for editing/deleting a user
const userEndpoint = (id) => `http://localhost:5001/api/users/${id}`;

const getInitials = (name = "") =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "?";

const isUserActive = (user) => {
    if (typeof user.isActive === "boolean") return user.isActive;
    if (typeof user.active === "boolean") return user.active;
    if (typeof user.status === "string") return user.status.toLowerCase() === "active";
    return true; // default to active if the backend doesn't send a status field
};

const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [status, setStatus] = useState("loading"); // loading | success | error
    const [errorMessage, setErrorMessage] = useState("");

    const [viewingUser, setViewingUser] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });
    const [savingEdit, setSavingEdit] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const getAllParents = async () => {
        setStatus("loading");
        setErrorMessage("");

        try {
            const res = await fetch(USERS_ENDPOINT, {
                method: "GET",
                headers: authHeaders(),
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
            const allUsers = Array.isArray(data) ? data : data.users || data.data || [];
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

    const stats = useMemo(() => {
        const total = users.length;
        const active = users.filter(isUserActive).length;
        return { total, active, inactive: total - active };
    }, [users]);

    const openEdit = (user) => {
        setEditingUser(user);
        setEditForm({
            name: user.name || user.fullName || "",
            email: user.email || "",
            phone: user.phone || user.phoneNumber || "",
        });
    };

    const handleSaveEdit = async () => {
        if (!editingUser) return;
        setSavingEdit(true);

        try {
            const id = editingUser._id || editingUser.id;
            const res = await fetch(userEndpoint(id), {
                method: "PATCH",
                headers: authHeaders(),
                body: JSON.stringify(editForm),
            });

            if (!res.ok) {
                throw new Error(`Update failed with status ${res.status}`);
            }

            setUsers((prev) =>
                prev.map((u) =>
                    (u._id || u.id) === id ? { ...u, ...editForm } : u
                )
            );
            setEditingUser(null);
        } catch (err) {
            console.log(err);
            alert(err.message || "Couldn't save changes.");
        } finally {
            setSavingEdit(false);
        }
    };

    const handleDelete = async (user) => {
        const id = user._id || user.id;
        const confirmed = window.confirm(
            `Remove ${user.name || user.fullName || "this parent"}? This can't be undone.`
        );
        if (!confirmed) return;

        setDeletingId(id);

        try {
            const res = await fetch(userEndpoint(id), {
                method: "DELETE",
                headers: authHeaders(),
            });

            if (!res.ok) {
                throw new Error(`Delete failed with status ${res.status}`);
            }

            setUsers((prev) => prev.filter((u) => (u._id || u.id) !== id));
        } catch (err) {
            console.log(err);
            alert(err.message || "Couldn't delete this user.");
        } finally {
            setDeletingId(null);
        }
    };

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

            {status === "success" && (
                <div className="dashboard-stats">
                    <div className="stat-card">
                        <p className="stat-card-label">
                            <span className="stat-dot" />
                            Total Parents
                        </p>
                        <p className="stat-card-value">{stats.total}</p>
                    </div>
                    <div className="stat-card">
                        <p className="stat-card-label">
                            <span className="stat-dot success" />
                            Active
                        </p>
                        <p className="stat-card-value">{stats.active}</p>
                    </div>
                    <div className="stat-card">
                        <p className="stat-card-label">
                            <span className="stat-dot" />
                            Inactive
                        </p>
                        <p className="stat-card-value">{stats.inactive}</p>
                    </div>
                </div>
            )}

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
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user, i) => {
                            const id = user._id || user.id || i;
                            const active = isUserActive(user);
                            return (
                                <tr key={id}>
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
                                        <span
                                            className={`status-badge ${active ? "active" : "inactive"}`}
                                        >
                                            <span className="stat-dot" />
                                            {active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-cell">
                                            <button
                                                className="icon-button"
                                                title="View"
                                                onClick={() => setViewingUser(user)}
                                            >
                                                👁
                                            </button>
                                            <button
                                                className="icon-button"
                                                title="Edit"
                                                onClick={() => openEdit(user)}
                                            >
                                                ✎
                                            </button>
                                            <button
                                                className="icon-button danger"
                                                title="Delete"
                                                onClick={() => handleDelete(user)}
                                                disabled={deletingId === id}
                                            >
                                                {deletingId === id ? "…" : "🗑"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                )}
            </div>

            {viewingUser && (
                <div className="modal-overlay" onClick={() => setViewingUser(null)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">PARENT DETAILS</h2>
                            <button
                                className="modal-close"
                                onClick={() => setViewingUser(null)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="modal-row">
                            <label>Name</label>
                            <span>{viewingUser.name || viewingUser.fullName || "—"}</span>
                        </div>
                        <div className="modal-row">
                            <label>Email</label>
                            <span>{viewingUser.email || "—"}</span>
                        </div>
                        <div className="modal-row">
                            <label>Phone</label>
                            <span>{viewingUser.phone || viewingUser.phoneNumber || "—"}</span>
                        </div>
                        <div className="modal-row">
                            <label>Status</label>
                            <span>{isUserActive(viewingUser) ? "Active" : "Inactive"}</span>
                        </div>

                        <div className="modal-actions">
                            <button
                                className="modal-button secondary"
                                onClick={() => setViewingUser(null)}
                            >
                                CLOSE
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {editingUser && (
                <div className="modal-overlay" onClick={() => setEditingUser(null)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">EDIT PARENT</h2>
                            <button
                                className="modal-close"
                                onClick={() => setEditingUser(null)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="modal-row">
                            <label>Name</label>
                            <input
                                value={editForm.name}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, name: e.target.value })
                                }
                            />
                        </div>
                        <div className="modal-row">
                            <label>Email</label>
                            <input
                                value={editForm.email}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, email: e.target.value })
                                }
                            />
                        </div>
                        <div className="modal-row">
                            <label>Phone</label>
                            <input
                                value={editForm.phone}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, phone: e.target.value })
                                }
                            />
                        </div>

                        <div className="modal-actions">
                            <button
                                className="modal-button secondary"
                                onClick={() => setEditingUser(null)}
                                disabled={savingEdit}
                            >
                                CANCEL
                            </button>
                            <button
                                className="modal-button primary"
                                onClick={handleSaveEdit}
                                disabled={savingEdit}
                            >
                                {savingEdit ? "SAVING..." : "SAVE"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserManagement;