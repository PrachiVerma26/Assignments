console.log("[LOGIN] JS loaded");
import { loginUser } from "./api.js";

// storage functions
function saveToken(token) {
    localStorage.setItem("token", token);
}

class TokenManager {
    constructor() {
        this.token = null;
        this.expiryTimer = null;
    }
    
    setToken(token, expiresIn = 3600000) { // 1 hour default
        this.token = token;
        this.clearExpiryTimer();
        this.expiryTimer = setTimeout(() => {
            this.clearToken();
        }, expiresIn);
    }
    
    getToken() {
        return this.token;
    }
    
    clearToken() {
        this.token = null;
        this.clearExpiryTimer();
    }
    
    clearExpiryTimer() {
        if (this.expiryTimer) {
            clearTimeout(this.expiryTimer);
            this.expiryTimer = null;
        }
    }
}

const tokenManager = new TokenManager();

function saveUser(data) {
    const userRole=Array.isArray(data.role)
    ? data.role[0]
    :data.role;
    localStorage.setItem("email", data.email);
    localStorage.setItem("role", userRole);
}

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("loginForm");
    if(!form) {
        console.error("Form not found");
        return;
    }
    console.log("Form found:", form)
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email= document.getElementById("email").value;
        const password = document.getElementById("password").value;

        console.log("[LOGIN] Form submitted"); 
        const payload = { email, password };

        try {
            const response = await loginUser(payload);

            // Save JWT
            saveToken(response.token);
            saveUser(response);
            

            // Redirect based on role
            const userRole=Array.isArray(response.role)? response.role[0]:response.role;
            console.log("[LOGIN] Processed role:", userRole);
            alert("Login successful. Welcome " + response.email);
            if (userRole === "ADMIN") {
                console.log("Redirecting to admin dashboard");
                window.location.href = "./admin-dashboard.html";
            } else {
                window.location.href = "./index.html";
            }

        } catch (error) {
            alert(error.message);
        }
    });

});