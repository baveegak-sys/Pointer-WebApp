import React, { useEffect, useMemo } from "react";
import {
    CircleMarker,
    MapContainer,
    Marker,
    Polyline,
    Popup,
    TileLayer,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../css/dashboard/parent-dashboard.css";


const getInitials = (name = "") =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "?";

const createDeviceIcon = (device) => {
    const color = device.emergency
        ? "#cb4a4a"
        : device.status === "active"
            ? "#4acb70"
            : "#787878";

    return L.divIcon({
        className: "device-map-marker",
        html: `
            <div style="
                width: 34px;
                height: 34px;
                border-radius: 50%;
                background: ${color};
                border: 2px solid #ffffff;
                box-shadow: 0 2px 6px rgba(0,0,0,0.35);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #ffffff;
                font-family: 'Quantico', sans-serif;
                font-size: 12px;
                font-weight: 700;
            ">${getInitials(device.name)}</div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -20],
    });
};
// Other tracked devices
const deviceIcon = new L.DivIcon({
    className: "tracking-marker-wrapper",
    html: `
        <div class="tracking-marker tracking-marker--device"></div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
});

// Selected device = route start
const startLocationIcon = new L.DivIcon({
    className: "tracking-marker-wrapper",
    html: `
        <div class="tracking-marker tracking-marker--start">
            S
        </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

// Selected destination
const destinationIcon = new L.DivIcon({
    className: "tracking-marker-wrapper",
    html: `
        <div class="tracking-marker tracking-marker--destination">
            D
        </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

/* ===========================
   FIT MAP TO ROUTE
=========================== */

const FitRouteBounds = ({
                            devices,
                            selectedDeviceId,
                            destination,
                            routeCoordinates,
                            currentLocation,
                        }) => {
    const map = useMap();

    useEffect(() => {
        const points = [];


        if (routeCoordinates?.length > 1) {
            routeCoordinates.forEach((point) => {
                points.push(point);
            });
        } else {
            /*
             * Otherwise use the selected device
             * and destination coordinates.
             */
            const selectedDevice = devices.find(
                (device) => device.id === selectedDeviceId
            );

            if (
                selectedDevice?.latitude != null &&
                selectedDevice?.longitude != null
            ) {
                points.push([
                    Number(selectedDevice.latitude),
                    Number(selectedDevice.longitude),
                ]);
            }

            if (
                destination?.lat != null &&
                destination?.lon != null
            ) {
                points.push([
                    Number(destination.lat),
                    Number(destination.lon),
                ]);
            }

            if (points.length === 0) {
                devices.forEach((device) => {
                    if (
                        device.latitude != null &&
                        device.longitude != null
                    ) {
                        points.push([
                            Number(device.latitude),
                            Number(device.longitude),
                        ]);
                    }
                });

                if (
                    currentLocation?.latitude != null &&
                    currentLocation?.longitude != null
                ) {
                    points.push([
                        Number(currentLocation.latitude),
                        Number(currentLocation.longitude),
                    ]);
                }
            }
        }

        if (points.length === 1) {
            map.setView(points[0], 14);
        } else if (points.length > 1) {
            map.fitBounds(points, {
                padding: [45, 45],
                maxZoom: 15,
            });
        }
    }, [
        map,
        devices,
        selectedDeviceId,
        destination,
        routeCoordinates,
        currentLocation,
    ]);

    return null;
};

/* ===========================
   DEVICE MAP
=========================== */

const DeviceMap = ({
                       devices = [],
                       selectedDeviceId = "",
                       destination = null,
                       routeCoordinates = [],
                       currentLocation = null,
                   }) => {

    const validDevices = useMemo(
        () =>
            devices.filter(
                (device) =>
                    device.latitude != null &&
                    device.longitude != null
            ),
        [devices]
    );

    const defaultCenter = useMemo(() => {
        const selectedDevice = validDevices.find(
            (device) => device.id === selectedDeviceId
        );

        if (selectedDevice) {
            return [
                Number(selectedDevice.latitude),
                Number(selectedDevice.longitude),
            ];
        }

        if (validDevices.length > 0) {
            return [
                Number(validDevices[0].latitude),
                Number(validDevices[0].longitude),
            ];
        }

        if (
            currentLocation?.latitude != null &&
            currentLocation?.longitude != null
        ) {
            return [
                Number(currentLocation.latitude),
                Number(currentLocation.longitude),
            ];
        }

        return [-33.8688, 151.2093];
    }, [
        validDevices,
        selectedDeviceId,
        currentLocation,
    ]);

    return (
        <div className="device-map-container">
            <MapContainer
                center={defaultCenter}
                zoom={13}
                scrollWheelZoom={true}
                className="device-map-leaflet"
            >
                {/* ===========================
                    OPENSTREETMAP
                =========================== */}

                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* ===========================
                    AUTO MAP BOUNDS
                =========================== */}

                <FitRouteBounds
                    devices={validDevices}
                    selectedDeviceId={selectedDeviceId}
                    destination={destination}
                    routeCoordinates={routeCoordinates}
                    currentLocation={currentLocation}
                />


                {validDevices.map((device) => {
                    const isSelected =
                        device.id === selectedDeviceId;

                    return (
                        <Marker
                            key={device.id}
                            position={[
                                Number(device.latitude),
                                Number(device.longitude),
                            ]}
                            icon={createDeviceIcon(device)}

                        >
                            <Popup>
                                <div className="tracking-popup">
                                    <strong>
                                        {device.name || "Device"}
                                    </strong>

                                    {isSelected && (
                                        <div className="tracking-popup-start">
                                            START LOCATION
                                        </div>
                                    )}

                                    <div>
                                        Status:{" "}
                                        {device.status || "Unknown"}
                                    </div>

                                    <div>
                                        Battery:{" "}
                                        {device.battery != null
                                            ? `${device.battery}%`
                                            : "—"}
                                    </div>

                                    {device.speed != null && (
                                        <div>
                                            Speed: {device.speed} km/h
                                        </div>
                                    )}

                                    <div>
                                        {Number(
                                            device.latitude
                                        ).toFixed(5)}
                                        ,{" "}
                                        {Number(
                                            device.longitude
                                        ).toFixed(5)}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                {/* ===========================
                    CURRENT BROWSER LOCATION
                =========================== */}

                {currentLocation?.latitude != null &&
                    currentLocation?.longitude != null && (
                        <>
                            {/* Outer location accuracy effect */}
                            <CircleMarker
                                center={[
                                    Number(
                                        currentLocation.latitude
                                    ),
                                    Number(
                                        currentLocation.longitude
                                    ),
                                ]}
                                radius={15}
                                pathOptions={{
                                    color: "#4acb70",
                                    fillColor: "#4acb70",
                                    weight: 1,
                                    opacity: 0.25,
                                    fillOpacity: 0.12,
                                }}
                            />

                            {/* Actual current location */}
                            <CircleMarker
                                center={[
                                    Number(
                                        currentLocation.latitude
                                    ),
                                    Number(
                                        currentLocation.longitude
                                    ),
                                ]}
                                radius={7}
                                pathOptions={{
                                    color: "#ffffff",
                                    fillColor: "#4acb70",
                                    weight: 3,
                                    opacity: 1,
                                    fillOpacity: 1,
                                }}
                            >
                                <Popup>
                                    <strong>
                                        My Current Location
                                    </strong>

                                    <br />

                                    {Number(
                                        currentLocation.latitude
                                    ).toFixed(5)}
                                    ,{" "}
                                    {Number(
                                        currentLocation.longitude
                                    ).toFixed(5)}
                                </Popup>
                            </CircleMarker>
                        </>
                    )}

                {/* ===========================
                    DESTINATION
                =========================== */}

                {destination?.lat != null &&
                    destination?.lon != null && (
                        <Marker
                            position={[
                                Number(destination.lat),
                                Number(destination.lon),
                            ]}
                            icon={destinationIcon}
                        >
                            <Popup>
                                <div className="tracking-popup">
                                    <strong>
                                        {destination.label ||
                                            "Destination"}
                                    </strong>

                                    <div className="tracking-popup-destination">
                                        DESTINATION
                                    </div>

                                    {destination.address && (
                                        <div>
                                            {destination.address}
                                        </div>
                                    )}

                                    <div>
                                        {Number(
                                            destination.lat
                                        ).toFixed(5)}
                                        ,{" "}
                                        {Number(
                                            destination.lon
                                        ).toFixed(5)}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                {/* ===========================
                    ROUTE LINE
                =========================== */}

                {routeCoordinates?.length > 1 && (
                    <>
                        {/* Route shadow */}
                        <Polyline
                            positions={routeCoordinates}
                            pathOptions={{
                                color: "#ffffff",
                                weight: 9,
                                opacity: 0.28,
                            }}
                        />

                        {/* Main route */}
                        <Polyline
                            positions={routeCoordinates}
                            pathOptions={{
                                color: "#1a41cd",
                                weight: 5,
                                opacity: 0.95,
                            }}
                        />
                    </>
                )}
            </MapContainer>

            {/* ===========================
                MAP LEGEND
            =========================== */}

            <div className="tracking-map-legend">
                <div className="tracking-map-legend-item">
                    <span className="legend-start">
                        S
                    </span>

                    <span>
                        Start
                    </span>
                </div>

                <div className="tracking-map-legend-item">
                    <span className="legend-destination">
                        D
                    </span>

                    <span>
                        Destination
                    </span>
                </div>

                <div className="tracking-map-legend-item">
                    <span className="legend-current" />

                    <span>
                        My Location
                    </span>
                </div>

                <div className="tracking-map-legend-item">
                    <span className="legend-device" />

                    <span>
                        Other Device
                    </span>
                </div>
            </div>
        </div>
    );
};

export default DeviceMap;