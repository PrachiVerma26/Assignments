// Handle login form submission:validate user input, call login API and reidrect user based ont he role
import { loginUser } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        removeError();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        if (!email || !password) {
            showError("Please enter email and password");
            return;
        }
        if (!email.includes("@") || !email.includes(".")) {
            showError("Please enter a valid email");
            return;
        }
        const submitButton = form.querySelector("button[type='submit']");
        const oldText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = "Signing in...";
        try {
            const data = await loginUser({
                email: email,
                password: password
            });
            localStorage.setItem("token", data.token);
            localStorage.setItem("email", data.email);
            localStorage.setItem("role", data.role);
            const pendingVehicleId = localStorage.getItem('pendingVehicleId');

            if (data.role === "ADMIN") {
                window.location.href = "admin-dashboard.html";
            } else if (data.role === "CUSTOMER") {
                if (pendingVehicleId) {
                    window.location.href = "vehicles.html";
                } else {
                    window.location.href = "customer-dashboard.html";
                }
            } else {
                window.location.href = "index.html";
            }
        } catch (error) {
            showError(error.message || "Login failed");
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = oldText;
        }
    });
});

// display an error message at the top of the login form
function showError(message) {
    const form = document.getElementById("loginForm");
    const errorDiv = document.createElement("div");
    errorDiv.className = "form-error";
    errorDiv.textContent = message;
    form.insertBefore(errorDiv, form.firstChild);
}

// remove any existing error message from the form
function removeError() {
    const oldError = document.querySelector(".form-error");
    if (oldError) {
        oldError.remove();
    }
}