// ParentdashboardApi.js

const BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

const handleResponse = async (res) => {
    let data;

    try {
        data = await res.json();
    } catch {
        data = {};
    }

    if (!res.ok) {
        if (res.status === 401) {
            throw new Error(
                "Your session has expired. Please log in again."
            );
        }

        throw new Error(
            data?.message ||
            `Request failed with status ${res.status}`
        );
    }

    return data;
};

const request = async (path, options = {}) => {
    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            ...authHeaders(),
            ...(options.headers || {}),
        },
    });

    return handleResponse(res);
};

/*
|--------------------------------------------------------------------------
| Parent Dashboard APIs
|--------------------------------------------------------------------------
*/

export const getOverviewStats = () => {
    return request("/users/me");
};

export const getLatestDeviceLocation = (deviceId) => {
    return request(`/tracker/latest/${deviceId}`);
};

export const getFamilyMembers = () => {
    return request("/family/members");
};

export const getRecentAlerts = (limit = 5) => {
    return request(`/alerts?limit=${limit}`);
};

export const getSafeZones = () => {
    return request("/geofences");
};

/*
|--------------------------------------------------------------------------
| Saved Places
|--------------------------------------------------------------------------
|
| Create payload example:
|
| {
|   name: "Home",
|   type: "home",
|   address: "10 George Street, Sydney NSW"
| }
|
| Update payload example:
|
| {
|   id: "68abc123...",
|   name: "Home",
|   type: "home",
|   address: "20 George Street, Sydney NSW"
| }
|
*/
export const savePlace = (payload) => {
    return request("/users/add-location", {
        method: "POST",
        body: JSON.stringify(payload),
    });
};
/*
|--------------------------------------------------------------------------
| Delete Saved Place
|--------------------------------------------------------------------------
*/

export const deletePlace = (placeId) => {
    if (!placeId) {
        throw new Error("Place ID is required.");
    }

    return request(`/users/location/${placeId}`, {
        method: "DELETE",
    });
};