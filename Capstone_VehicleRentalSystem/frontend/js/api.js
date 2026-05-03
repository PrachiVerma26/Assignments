const API_ROOT = "http://localhost:8080/api";
const AUTH_BASE_URL = `${API_ROOT}/auth`;

class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}


async function request(endpoint, options = {}) {
    const token = localStorage.getItem("token");
    const url = `${API_ROOT}${endpoint}`;
    
    console.log(`[API] ${options.method || 'GET'} ${url}`);

    const headers = {
        "Content-Type": "application/json",
        ...options.headers
    };
    
    // Add token for protected endpoints (customer and admin routes)
    if (token && (endpoint.startsWith('/customer') || endpoint.startsWith('/admin'))) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers
    });

    const data = response.status === 204 ? null : await parseResponseBody(response);

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

async function parseResponseBody(response) {
    const text = await response.text();
    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch (error) {
        return { message: text };
    }
}

// Auth APIs
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
    const startDateTime = toStartOfDayDateTime(startDate);
    const endDateTime = toEndOfDayDateTime(endDate);
    let url = `/vehicles/available-by-dates?startDate=${encodeURIComponent(startDateTime)}&endDate=${encodeURIComponent(endDateTime)}`;
    if (type) url += `&type=${type}`;
    if (locationId) url += `&locationId=${locationId}`;
    
    return request(url, {
        method: "GET"
    });
}

export function getFilteredVehicles(type, status, locationId) {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    if (locationId) params.append('locationId', locationId);

    const query = params.toString();
    return request(`/vehicles/filter${query ? `?${query}` : ''}`, {
        method: "GET"
    });
}

function toStartOfDayDateTime(date) {
    return date.includes('T') ? date : `${date}T00:00:00`;
}

function toEndOfDayDateTime(date) {
    return date.includes('T') ? date : `${date}T23:59:59`;
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

// Admin APIs
export function getAdminVehicles() {
    return request("/admin/vehicles", {
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

export function getAdminBookings() {
    return request("/admin/bookings", {
        method: "GET"
    });
}