const BASE_URL = "http://localhost:8080/api/auth";

class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.status = status;
        this.data = data;
        this.name = 'ApiError';
    }
}
export async function loginUser(data) {
    try {
        console.log("Sending login request:", data);      
        const response = await fetch(`${BASE_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        console.log("Response status:", response.status);
        console.log("Response headers:", response.headers);
        const result = await response.json();
        console.log("Response data:", result);
        if (!response.ok) {
            throw new ApiError(
                result.message || "Login failed",
                response.status,
                result
            );
        }
        // Store data
        if (result.token) {
            localStorage.setItem("token", result.token);
        }
        if (result.role) {
            const userRole=Array.isArray(result.role)? result.role[0]:result.role;
            localStorage.setItem("role", userRole); // Remove JSON.stringify
        }
        if (result.email) {
            localStorage.setItem("email", result.email);
        }

        return result;
    } catch (error) {
        console.error("Login error:", error);
        
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
    const response = await fetch(`${BASE_URL}/signup`, {
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