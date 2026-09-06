import React, { useEffect, useState } from "react";

import {
    getOverviewStats,
    savePlace,
    deletePlace,
} from "../../../redux/api/parent/ParentdashboardApi";
import AddressAutocomplete from "../../../components/Addressautocomplete";
import "../../../css/dashboard/parent-dashboard.css";


const LOCATIONIQ_API_KEY = "pk.67e08d98212da372abfe21e4dffcb7ea";

const PLACE_TYPES = [
    { key: "home", label: "Home", icon: "🏠" },
    { key: "office", label: "Office", icon: "🏢" },
    { key: "school", label: "School", icon: "🎒" },
    { key: "custom", label: "Custom", icon: "📍" },
];

const placeTypeMeta = (key) =>
    PLACE_TYPES.find((t) => t.key === key) || PLACE_TYPES[3];

const Location = () => {
    const [places, setPlaces] = useState([]); // [{ _id, type, label, address, lat, lon }]
    const [status, setStatus] = useState("loading"); // loading | success | error
    const [errorMessage, setErrorMessage] = useState("");

    // --- modal / form state ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlaceId, setEditingPlaceId] = useState(null); // null = creating new
    const [formType, setFormType] = useState("home");
    const [formLabel, setFormLabel] = useState(""); // only used when formType === "custom"
    const [formAddress, setFormAddress] = useState("");
    const [formCoords, setFormCoords] = useState(null); // { lat, lon } from a selected suggestion
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [formError, setFormError] = useState("");
    const [toast, setToast] = useState("");

    const loadPlaces = async () => {
        setStatus("loading");
        setErrorMessage("");

        try {
            const statsRes = await getOverviewStats();
            const userData = statsRes?.data || {};
            setPlaces(userData.savedPlaces || []);
            setStatus("success");
        } catch (err) {
            console.error("Locations error:", err);
            setErrorMessage(err.message || "Something went wrong.");
            setStatus("error");
        }
    };

    useEffect(() => {
        loadPlaces();
    }, []);

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(""), 3000);
        return () => clearTimeout(timer);
    }, [toast]);

    const fixedPlace = (typeKey) => places.find((p) => p.type === typeKey);
    const customPlaces = places.filter((p) => p.type === "custom");

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingPlaceId(null);
        setFormType("home");
        setFormLabel("");
        setFormAddress("");
        setFormCoords(null);
        setFormError("");
    };

    const openAddModal = (presetType) => {
        setEditingPlaceId(null);
        setFormType(presetType || "home");
        setFormLabel("");
        setFormAddress("");
        setFormCoords(null);
        setFormError("");
        setIsModalOpen(true);
    };

    const openEditModal = (place) => {
        setEditingPlaceId(place._id);
        setFormType(place.type);
        setFormLabel(place.label || "");
        setFormAddress(place.address || "");
        setFormCoords(
            place.lat != null && place.lon != null
                ? { lat: place.lat, lon: place.lon }
                : null
        );
        setFormError("");
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        const trimmedAddress = formAddress.trim();
        const trimmedLabel = formLabel.trim();

        if (!trimmedAddress) {
            setFormError("Please enter or select an address.");
            return;
        }
        if (formType === "custom" && !trimmedLabel) {
            setFormError("Please give this place a name (e.g. Grandma's House).");
            return;
        }

        setSaving(true);
        setFormError("");

        const payload = {
            id: editingPlaceId || undefined,
            type: formType,
            label: formType === "custom" ? trimmedLabel : placeTypeMeta(formType).label,
            address: trimmedAddress,
            lat: formCoords?.lat,
            lon: formCoords?.lon,
        };

        try {
            const res = await savePlace(payload);
            const savedPlace = res?.data || { ...payload, _id: payload.id || Date.now().toString() };

            setPlaces((prev) => {
                const existingIndex = prev.findIndex((p) => p._id === savedPlace._id);
                if (existingIndex >= 0) {
                    const next = [...prev];
                    next[existingIndex] = savedPlace;
                    return next;
                }
                if (savedPlace.type !== "custom") {
                    return [...prev.filter((p) => p.type !== savedPlace.type), savedPlace];
                }
                return [...prev, savedPlace];
            });

            setToast(`${savedPlace.label} saved.`);
            closeModal();
        } catch (err) {
            console.error("Save place error:", err);
            setFormError(err.message || "Couldn't save this place.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (place) => {
        setDeletingId(place._id);

        try {
            await deletePlace(place._id);
            setPlaces((prev) => prev.filter((p) => p._id !== place._id));
            setToast(`${place.label} removed.`);
        } catch (err) {
            console.error("Delete place error:", err);
            setToast(err.message || "Couldn't remove this place.");
        } finally {
            setDeletingId(null);
        }
    };

    const renderCard = (place, meta) => {
        const isSet = !!place;

        return (
            <div
                className={`location-card${isSet ? "" : " location-card--empty"}`}
                key={place?._id || meta.key}
            >
                <div className="location-card-icon">{meta.icon}</div>

                <div className="location-card-body">
                    <h3 className="location-card-title">{place?.label || meta.label}</h3>
                    <p className="location-card-address">
                        {isSet ? place.address : "No address set yet"}
                    </p>
                </div>

                <div className="location-card-actions">
                    <button
                        className="location-btn location-btn--ghost"
                        onClick={() => (isSet ? openEditModal(place) : openAddModal(meta.key))}
                    >
                        {isSet ? "Edit" : "Add"}
                    </button>

                    {isSet && (
                        <button
                            className="location-btn location-btn--danger"
                            onClick={() => handleDelete(place)}
                            disabled={deletingId === place._id}
                        >
                            {deletingId === place._id ? "Removing…" : "Remove"}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <section>
            <header className="parent-dashboard-topbar">
                <div>
                    <p className="parent-dashboard-eyebrow">LOCATIONS</p>
                    <h1 className="parent-dashboard-title">SAVED PLACES</h1>
                    <p className="parent-dashboard-subtitle">
                        Keep home, office, school and other places on hand for tracking and
                        safe-zone alerts.
                    </p>
                </div>
                <div className="parent-live-status">
                    <span className="parent-live-dot" />
                    {status === "error" ? "SYSTEM OFFLINE" : "SYSTEM ONLINE"}
                </div>
            </header>

            {status === "loading" && (
                <div className="location-grid">
                    {[1, 2, 3].map((i) => (
                        <div className="location-card location-card--skeleton" key={i} />
                    ))}
                </div>
            )}

            {status === "error" && (
                <div className="parent-empty-state">
                    <span>!</span>
                    <h2>Couldn't load your places</h2>
                    <p>{errorMessage}</p>
                    <button className="location-btn location-btn--primary" onClick={loadPlaces}>
                        Retry
                    </button>
                </div>
            )}

            {status === "success" && (
                <>
                    <div className="location-grid">
                        {["home", "office", "school"].map((typeKey) =>
                            renderCard(fixedPlace(typeKey), placeTypeMeta(typeKey))
                        )}

                        {customPlaces.map((place) => renderCard(place, placeTypeMeta("custom")))}

                        <button className="location-add-tile" onClick={() => openAddModal("custom")}>
                            <span className="location-add-tile-plus">+</span>
                            <span>Add a custom place</span>
                        </button>
                    </div>
                </>
            )}

            {toast && <div className="location-toast">{toast}</div>}

            {isModalOpen && (
                <div className="location-modal-overlay" onMouseDown={closeModal}>
                    <div
                        className="location-modal"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <div className="location-modal-header">
                            <h2>{editingPlaceId ? "Edit place" : "Add a place"}</h2>
                            <button
                                className="location-modal-close"
                                onClick={closeModal}
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        <div className="location-type-selector">
                            {PLACE_TYPES.map((t) => (
                                <button
                                    type="button"
                                    key={t.key}
                                    className={`location-type-pill${
                                        formType === t.key ? " is-selected" : ""
                                    }`}
                                    onClick={() => setFormType(t.key)}
                                    disabled={!!editingPlaceId}
                                >
                                    <span>{t.icon}</span> {t.label}
                                </button>
                            ))}
                        </div>

                        {formType === "custom" && (
                            <div className="location-field">
                                <label>Place name</label>
                                <input
                                    type="text"
                                    className="location-input"
                                    placeholder="e.g. Grandma's House"
                                    value={formLabel}
                                    onChange={(e) => setFormLabel(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="location-field">
                            <label>Address</label>
                            <AddressAutocomplete
                                value={formAddress}
                                onChange={(val) => {
                                    setFormAddress(val);
                                    setFormCoords(null);
                                }}
                                onSelect={(suggestion) => {
                                    setFormAddress(suggestion.label);
                                    setFormCoords({ lat: suggestion.lat, lon: suggestion.lon });
                                }}
                                placeholder="Start typing an Australian address…"
                                provider="locationiq"
                                apiKey={LOCATIONIQ_API_KEY}
                            />
                        </div>

                        {formError && <div className="location-form-error">{formError}</div>}

                        <div className="location-modal-actions">
                            <button
                                className="location-btn location-btn--ghost"
                                onClick={closeModal}
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                className="location-btn location-btn--primary"
                                onClick={handleSubmit}
                                disabled={saving}
                            >
                                {saving ? "Saving…" : "Save place"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Location;