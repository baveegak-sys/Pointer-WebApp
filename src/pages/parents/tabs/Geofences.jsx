import React, { useEffect, useState } from "react";

import { getSafeZones } from "../../../redux/api/parent/ParentdashboardApi";


const Geofences = () => {
    const [zones, setZones] = useState([]);
    const [status, setStatus] = useState("loading");
    const [errorMessage, setErrorMessage] = useState("");

    const loadZones = async () => {
        setStatus("loading");
        setErrorMessage("");

        try {
            const data = await getSafeZones();
            setZones(Array.isArray(data) ? data : data.zones || []);
            setStatus("success");
        } catch (err) {
            console.log(err);
            setErrorMessage(err.message || "Something went wrong.");
            setStatus("error");
        }
    };

    useEffect(() => {
        loadZones();
    }, []);

    return (
        <section>
            <header className="parent-dashboard-topbar">
                <div>
                    <p className="parent-dashboard-eyebrow">LOCATION SAFETY</p>
                    <h1 className="parent-dashboard-title">GEOFENCES</h1>
                    <p className="parent-dashboard-subtitle">
                        Manage safe zones for your family.
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
                        <span>G</span>
                        <h2>Loading…</h2>
                        <p>Fetching your safe zones.</p>
                    </div>
                )}

                {status === "error" && (
                    <div className="parent-empty-state">
                        <span>!</span>
                        <h2>Couldn't load geofences</h2>
                        <p>{errorMessage}</p>
                    </div>
                )}

                {status === "success" && zones.length === 0 && (
                    <div className="parent-empty-state">
                        <span>G</span>
                        <h2>Geofence Management</h2>
                        <p>Your geofence settings will appear here.</p>
                    </div>
                )}

                {status === "success" && zones.length > 0 && (
                    <div className="parent-table-wrapper">
                        <table className="parent-dashboard-table">
                            <thead>
                            <tr>
                                <th>Zone Name</th>
                                <th>Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {zones.map((zone) => (
                                <tr key={zone.id || zone.name}>
                                    <td>{zone.name}</td>
                                    <td>
                                            <span className="parent-status-pill">
                                                {zone.isActive ? "Active" : "Inactive"}
                                            </span>
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

export default Geofences;