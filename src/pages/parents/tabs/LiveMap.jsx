import React, { useEffect, useMemo, useState } from "react";

import DeviceMap from "../../../components/Devicemap";
import {
    getOverviewStats,
    getLatestDeviceLocation,
} from "../../../redux/api/parent/ParentdashboardApi";
import "../../../css/dashboard/parent-dashboard.css";
const OSRM_BASE_URL = "https://router.project-osrm.org";
const CURRENT_LOCATION_ID = "__current_location__";
const FALLBACK_AVERAGE_SPEED_KMH = 35;

const toRadians = (deg) => (deg * Math.PI) / 180;

const haversineDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const formatDuration = (minutes) => {
    if (minutes == null) return "—";
    if (minutes < 1) return "<1 min";
    if (minutes < 60) return `${Math.round(minutes)} min`;

    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);

    return mins > 0 ? `${hours} hr ${mins} min` : `${hours} hr`;
};

const getPlaceLatitude = (place) =>
    place?.lat ?? place?.latitude ?? place?.location?.lat ?? place?.location?.latitude;

const getPlaceLongitude = (place) =>
    place?.lon ??
    place?.lng ??
    place?.longitude ??
    place?.location?.lon ??
    place?.location?.lng ??
    place?.location?.longitude;

const getPlaceLabel = (place) =>
    place?.label ?? place?.name ?? place?.type ?? "Saved place";

const LiveMap = () => {
    const [devices, setDevices] = useState([]);
    const [places, setPlaces] = useState([]);

    const [status, setStatus] = useState("loading");
    const [errorMessage, setErrorMessage] = useState("");

    const [selectedDeviceId, setSelectedDeviceId] = useState("");
    const [selectedDestinationId, setSelectedDestinationId] = useState("");

    const [currentLocation, setCurrentLocation] = useState(null);
    const [currentLocationStatus, setCurrentLocationStatus] = useState("idle");
    const [currentLocationError, setCurrentLocationError] = useState("");

    const [routeInfo, setRouteInfo] = useState(null);
    const [routeStatus, setRouteStatus] = useState("idle");
    const [routeError, setRouteError] = useState("");

    const selectedDevice = useMemo(
        () => devices.find((device) => device.id === selectedDeviceId) || null,
        [devices, selectedDeviceId]
    );

    const selectedDestination = useMemo(() => {
        if (!selectedDestinationId) return null;

        if (selectedDestinationId === CURRENT_LOCATION_ID) {
            if (!currentLocation) return null;

            return {
                _id: CURRENT_LOCATION_ID,
                label: "My Current Location",
                address: currentLocation.address || "Browser current location",
                lat: currentLocation.latitude,
                lon: currentLocation.longitude,
            };
        }

        const place = places.find((item) => item._id === selectedDestinationId);

        if (!place) return null;

        return {
            ...place,
            label: getPlaceLabel(place),
            lat: getPlaceLatitude(place),
            lon: getPlaceLongitude(place),
        };
    }, [places, selectedDestinationId, currentLocation]);

    const loadDeviceLocations = async () => {
        setStatus("loading");
        setErrorMessage("");

        try {
            const profileRes = await getOverviewStats();
            const userDevices = profileRes?.data?.devices || [];
            const savedPlaces =
                profileRes?.data?.savedPlaces ||
                profileRes?.data?.places ||
                [];

            setPlaces(savedPlaces);

            const locations = await Promise.all(
                userDevices.map(async (device) => {
                    try {
                        const locRes = await getLatestDeviceLocation(
                            device.serialNumber
                        );

                        const loc = locRes?.data || {};

                        return {
                            id: device._id,
                            name: device.deviceName,
                            serialNumber: device.serialNumber,
                            status: loc.status,
                            battery: loc.battery,
                            speed: loc.speed,
                            emergency: loc.emergency,
                            latitude: loc.latitude,
                            longitude: loc.longitude,
                            gpsDate: loc.gpsDate,
                            gpsTime: loc.gpsTime,
                        };
                    } catch (err) {
                        console.log(
                            `Couldn't load location for ${device.deviceName}`,
                            err
                        );

                        return {
                            id: device._id,
                            name: device.deviceName,
                            serialNumber: device.serialNumber,
                            status: "unavailable",
                        };
                    }
                })
            );

            setDevices(locations);

            const firstDeviceWithLocation = locations.find(
                (device) =>
                    device.latitude != null &&
                    device.longitude != null
            );

            if (firstDeviceWithLocation) {
                setSelectedDeviceId((previous) =>
                    previous || firstDeviceWithLocation.id
                );
            }

            setStatus("success");
        } catch (err) {
            console.log(err);
            setErrorMessage(err.message || "Something went wrong.");
            setStatus("error");
        }
    };

    useEffect(() => {
        loadDeviceLocations();
    }, []);

    const enableCurrentLocation = () => {
        if (!navigator.geolocation) {
            setCurrentLocationError(
                "Current location is not supported by this browser."
            );
            return;
        }

        setCurrentLocationStatus("loading");
        setCurrentLocationError("");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };

                setCurrentLocation(location);
                setCurrentLocationStatus("success");
                setSelectedDestinationId(CURRENT_LOCATION_ID);
            },
            (error) => {
                let message = "Couldn't access your current location.";

                if (error.code === 1) {
                    message =
                        "Location permission was denied. Allow location access in your browser and try again.";
                } else if (error.code === 2) {
                    message = "Your current location is unavailable.";
                } else if (error.code === 3) {
                    message = "Getting your current location timed out.";
                }

                setCurrentLocationError(message);
                setCurrentLocationStatus("error");
            },
            {
                enableHighAccuracy: true,
                timeout: 12000,
                maximumAge: 30000,
            }
        );
    };

    const calculateRoute = async () => {
        setRouteError("");
        setRouteInfo(null);

        if (!selectedDevice) {
            setRouteError("Select a device first.");
            return;
        }

        if (
            selectedDevice.latitude == null ||
            selectedDevice.longitude == null
        ) {
            setRouteError("The selected device has no current GPS location.");
            return;
        }

        if (!selectedDestinationId) {
            setRouteError("Select a destination first.");
            return;
        }

        if (
            selectedDestinationId === CURRENT_LOCATION_ID &&
            !currentLocation
        ) {
            setRouteError(
                "Enable your current location before using it as a destination."
            );
            return;
        }

        if (
            !selectedDestination ||
            selectedDestination.lat == null ||
            selectedDestination.lon == null
        ) {
            setRouteError(
                "The selected destination does not have valid coordinates."
            );
            return;
        }

        setRouteStatus("loading");

        try {
            const url =
                `${OSRM_BASE_URL}/route/v1/driving/` +
                `${selectedDevice.longitude},${selectedDevice.latitude};` +
                `${selectedDestination.lon},${selectedDestination.lat}` +
                `?overview=full&geometries=geojson&steps=false`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Routing service is unavailable.");
            }

            const data = await response.json();
            const route = data?.routes?.[0];

            if (data?.code !== "Ok" || !route) {
                throw new Error("No driving route was found.");
            }

            const coordinates =
                route.geometry?.coordinates?.map(([lon, lat]) => [lat, lon]) ||
                [];

            setRouteInfo({
                distanceKm: route.distance / 1000,
                durationMin: route.duration / 60,
                coordinates,
                destination: selectedDestination,
                deviceId: selectedDevice.id,
                isEstimate: false,
            });

            setRouteStatus("success");
        } catch (err) {
            console.log("OSRM route error:", err);

            const distanceKm = haversineDistanceKm(
                selectedDevice.latitude,
                selectedDevice.longitude,
                selectedDestination.lat,
                selectedDestination.lon
            );

            const durationMin =
                (distanceKm / FALLBACK_AVERAGE_SPEED_KMH) * 60;

            setRouteInfo({
                distanceKm,
                durationMin,
                coordinates: [],
                destination: selectedDestination,
                deviceId: selectedDevice.id,
                isEstimate: true,
            });

            setRouteError(
                "Road route could not be loaded. Showing an estimated ETA instead."
            );
            setRouteStatus("success");
        }
    };

    useEffect(() => {
        setRouteInfo(null);
        setRouteError("");

        if (
            selectedDeviceId &&
            selectedDestinationId &&
            !(
                selectedDestinationId === CURRENT_LOCATION_ID &&
                !currentLocation
            )
        ) {
            calculateRoute();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDeviceId, selectedDestinationId, currentLocation]);

    const mapDestination =
        routeInfo?.destination || selectedDestination || null;

    const mapRoute =
        routeInfo?.coordinates?.length > 0
            ? routeInfo.coordinates
            : [];

    return (
        <section>
            <header className="parent-dashboard-topbar">
                <div>
                    <p className="parent-dashboard-eyebrow">LOCATION</p>
                    <h1 className="parent-dashboard-title">LIVE MAP</h1>
                    <p className="parent-dashboard-subtitle">
                        Track a device, choose a destination and view its route
                        and ETA.
                    </p>
                </div>

                <div className="parent-live-status">
                    <span className="parent-live-dot" />
                    SYSTEM ONLINE
                </div>
            </header>

            {/* =====================================
                DESTINATION & ETA
            ====================================== */}

            <div className="route-planner-panel">
                <div className="route-planner-header">
                    <div>
                        <p className="parent-panel-eyebrow">ROUTE PLANNER</p>
                        <h2>Destination & ETA</h2>
                        <p>
                            Select a tracked device and where you want it to go.
                        </p>
                    </div>

                    {routeInfo && (
                        <span className="route-planner-ready">
                            ROUTE READY
                        </span>
                    )}
                </div>

                <div className="route-planner-grid">
                    <div className="route-control">
                        <label>DEVICE</label>

                        <select
                            className="route-select"
                            value={selectedDeviceId}
                            onChange={(event) =>
                                setSelectedDeviceId(event.target.value)
                            }
                        >
                            <option value="">Select device</option>

                            {devices.map((device) => (
                                <option
                                    key={device.id}
                                    value={device.id}
                                    disabled={
                                        device.latitude == null ||
                                        device.longitude == null
                                    }
                                >
                                    {device.name}
                                    {device.latitude == null ||
                                    device.longitude == null
                                        ? " — location unavailable"
                                        : ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="route-control">
                        <label>DESTINATION</label>

                        <select
                            className="route-select"
                            value={selectedDestinationId}
                            onChange={(event) =>
                                setSelectedDestinationId(event.target.value)
                            }
                        >
                            <option value="">Select destination</option>

                            {places.map((place) => (
                                <option
                                    key={place._id}
                                    value={place._id}
                                >
                                    {getPlaceLabel(place)}
                                </option>
                            ))}

                            {currentLocation && (
                                <option value={CURRENT_LOCATION_ID}>
                                    My Current Location
                                </option>
                            )}
                        </select>
                    </div>

                    <div className="route-current-location">
                        <label>CURRENT LOCATION</label>

                        <button
                            type="button"
                            className={`route-location-button ${
                                currentLocation ? "is-enabled" : ""
                            }`}
                            onClick={enableCurrentLocation}
                            disabled={currentLocationStatus === "loading"}
                        >
                            <span className="route-location-dot" />

                            {currentLocationStatus === "loading"
                                ? "Getting location..."
                                : currentLocation
                                    ? "Current location enabled"
                                    : "Enable current location"}
                        </button>
                    </div>

                    <div className="route-action">
                        <label>&nbsp;</label>

                        <button
                            type="button"
                            className="route-calculate-button"
                            onClick={calculateRoute}
                            disabled={
                                routeStatus === "loading" ||
                                !selectedDeviceId ||
                                !selectedDestinationId
                            }
                        >
                            {routeStatus === "loading"
                                ? "CALCULATING..."
                                : "SHOW ROUTE"}
                        </button>
                    </div>
                </div>

                {currentLocationError && (
                    <div className="route-message route-message--error">
                        {currentLocationError}
                    </div>
                )}

                {routeError && (
                    <div className="route-message route-message--warning">
                        {routeError}
                    </div>
                )}

                <div className="route-summary-grid">
                    <div className="route-summary-card">
                        <span className="route-summary-label">
                            DESTINATION
                        </span>

                        <strong className="route-summary-value route-summary-value--text">
                            {selectedDestination
                                ? selectedDestination.label
                                : "Not selected"}
                        </strong>

                        <small>
                            {selectedDestination?.address ||
                                "Choose one of your saved places or your current location."}
                        </small>
                    </div>

                    <div className="route-summary-card">
                        <span className="route-summary-label">
                            ESTIMATED ARRIVAL
                        </span>

                        <strong className="route-summary-value">
                            {routeStatus === "loading"
                                ? "..."
                                : routeInfo
                                    ? formatDuration(routeInfo.durationMin)
                                    : "—"}
                        </strong>

                        <small>
                            {routeInfo
                                ? routeInfo.isEstimate
                                    ? "Estimated travel time"
                                    : "Based on driving route"
                                : "Select a destination to calculate ETA"}
                        </small>
                    </div>

                    <div className="route-summary-card">
                        <span className="route-summary-label">
                            DISTANCE
                        </span>

                        <strong className="route-summary-value">
                            {routeInfo
                                ? `${routeInfo.distanceKm.toFixed(1)} km`
                                : "—"}
                        </strong>

                        <small>
                            {selectedDevice
                                ? `From ${selectedDevice.name}`
                                : "Select a tracked device"}
                        </small>
                    </div>
                </div>
            </div>

            {/* =====================================
                MAP
            ====================================== */}

            <div className="parent-panel route-map-panel">
                {status === "error" ? (
                    <div className="parent-empty-state">
                        <span>!</span>
                        <h2>Couldn't load locations</h2>
                        <p>{errorMessage}</p>
                    </div>
                ) : status === "success" && devices.length === 0 ? (
                    <div className="parent-empty-state">
                        <span>M</span>
                        <h2>No devices to show</h2>
                        <p>Register a device to see it on the map.</p>
                    </div>
                ) : (
                    <DeviceMap
                        devices={devices}
                        selectedDeviceId={selectedDeviceId}
                        destination={mapDestination}
                        routeCoordinates={mapRoute}
                        currentLocation={currentLocation}
                    />
                )}
            </div>

            {/* =====================================
                DEVICE DETAILS
            ====================================== */}

            {status === "success" && devices.length > 0 && (
                <div className="parent-panel">
                    <div className="parent-panel-header">
                        <div>
                            <p className="parent-panel-eyebrow">DETAILS</p>
                            <h2>Device Locations</h2>
                        </div>

                        <span className="parent-panel-hint">
                            {devices.length} DEVICES
                        </span>
                    </div>

                    <div className="parent-table-wrapper">
                        <table className="parent-dashboard-table">
                            <thead>
                            <tr>
                                <th>Device</th>
                                <th>Status</th>
                                <th>Speed</th>
                                <th>Battery</th>
                                <th>Coordinates</th>
                                <th>Last Update</th>
                            </tr>
                            </thead>

                            <tbody>
                            {devices.map((device) => {
                                const hasLocation =
                                    device.latitude != null &&
                                    device.longitude != null;

                                return (
                                    <tr key={device.id}>
                                        <td>
                                            <div className="parent-member-cell">
                                                <div className="parent-member-avatar">
                                                    {device.name
                                                            ?.charAt(0)
                                                            ?.toUpperCase() ||
                                                        "D"}
                                                </div>
                                                {device.name}
                                            </div>
                                        </td>

                                        <td>
                                                <span className="parent-status-pill">
                                                    {device.status || "—"}
                                                </span>
                                        </td>

                                        <td className="parent-mono">
                                            {device.speed != null
                                                ? `${device.speed} km/h`
                                                : "—"}
                                        </td>

                                        <td className="parent-mono">
                                            {device.battery != null
                                                ? `${device.battery}%`
                                                : "—"}
                                        </td>

                                        <td className="parent-mono">
                                            {hasLocation
                                                ? `${Number(
                                                    device.latitude
                                                ).toFixed(4)}, ${Number(
                                                    device.longitude
                                                ).toFixed(4)}`
                                                : "—"}
                                        </td>

                                        <td className="parent-muted parent-mono">
                                            {device.gpsDate &&
                                            device.gpsTime
                                                ? `${device.gpsDate} ${device.gpsTime}`
                                                : "—"}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </section>
    );
};

export default LiveMap;
