const API_ROOT = "http://localhost:8080/api";
const AUTH_BASE_URL = `${API_ROOT}/auth`;

export class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.status = status;
        this.data = data;
        this.name = 'ApiError';
    }
}

async function request(endpoint, options = {}) {
    const token = localStorage.getItem("token");
    const url = `${API_ROOT}${endpoint}`;
    
    console.log(`[API] ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers
        }
    });

    const data = response.status === 204 ? null : await response.json();

    if (!response.ok) {
        console.error(`[API] Error: ${response.status}`, data);
        throw new ApiError(
            data?.message || "Request failed",
            response.status,
            data
        );
    }

    return data;
}

export async function loginUser(credentials) {
    try {
        console.log("[API] Sending login request");      
        const response = await fetch(`${AUTH_BASE_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(credentials)
        });
        
        const result = await response.json();
        console.log("[API] Login response received:", result);
        
        if (!response.ok) {
            throw new ApiError(
                result.message || "Login failed",
                response.status,
                result
            );
        }

        return result;
    } catch (error) {
        console.error("[API] Login error:", error);
        
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(
            "Network error. Please check your connection.",
            0,
            null
        );
    }
}

export async function signupUser(data) {
    const response = await fetch(`${AUTH_BASE_URL}/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || "Signup failed");
    }
    return result;
}

export function getAdminVehicles() {
    return request("/admin/vehicles", {
        method: "GET"
    });
}

export function getAdminVehicleById(id) {
    return request(`/admin/vehicles/${id}`, {
        method: "GET"
    });
}

export function createVehicle(vehicleData) {
    return request("/admin/vehicles", {
        method: "POST",
        body: JSON.stringify(vehicleData)
    });
}

export function updateVehicle(id, vehicleData) {
    return request(`/admin/vehicles/${id}`, {
        method: "PUT",
        body: JSON.stringify(vehicleData)
    });
}

export function deleteVehicleById(id) {
    return request(`/admin/vehicles/${id}`, {
        method: "DELETE"
    });
}

export function getAdminBookings(status) {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    return request(`/admin/bookings${query}`, {
        method: "GET"
    });
}

export function getAdminBookingById(id) {
    return request(`/admin/bookings/${id}`, {
        method: "GET"
    });
}

export function getLocations() {
    return request("/locations", {
        method: "GET"
    });
}

// User Profile APIs
export function getUserProfile() {
    return request("/customer/profile", {
        method: "GET"
    });
}

export function updateUserProfile(profileData) {
    return request("/customer/profile", {
        method: "PUT",
        body: JSON.stringify(profileData)
    });
}

// Public Vehicles APIs
export function getAllPublicVehicles() {
    return request("/vehicles", {
        method: "GET"
    });
}

export function getVehicleById(id) {
    return request(`/vehicles/${id}`, {
        method: "GET"
    });
}

export function getAvailableVehiclesByDateRange(startDate, endDate, type, locationId) {
    let url = `/vehicles/available-by-dates?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
    if (type) url += `&type=${type}`;
    if (locationId) url += `&locationId=${locationId}`;
    
    return request(url, {
        method: "GET"
    });
}

export function getAvailableVehicles(type, locationId) {
    let url = `/vehicles/available?type=${type}`;
    if (locationId) url += `&locationId=${locationId}`;
    
    return request(url, {
        method: "GET"
    });
}

export function getVehiclesByType(type) {
    return request(`/vehicles/type/${type}`, {
        method: "GET"
    });
}

export function getVehiclesByLocation(locationId) {
    return request(`/vehicles/location/${locationId}`, {
        method: "GET"
    });
}

// Booking APIs
export function createBooking(bookingData) {
    return request("/customer/bookings", {
        method: "POST",
        body: JSON.stringify(bookingData)
    });
}

export function getUserBookings() {
    return request("/customer/bookings", {
        method: "GET"
    });
}

export function getBookingById(id) {
    return request(`/customer/bookings/${id}`, {
        method: "GET"
    });
}

export function cancelBooking(id) {
    return request(`/customer/bookings/${id}/cancel`, {
        method: "PATCH"
    });
}
