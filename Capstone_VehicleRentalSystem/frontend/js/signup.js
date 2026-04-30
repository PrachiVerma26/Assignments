import { signupUser } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("signupForm");
    const firstNameInput = document.getElementById("firstName");
    const lastNameInput = document.getElementById("lastName");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phoneNumber");
    const licenseInput = document.getElementById("drivingLicense");
    const addressInput = document.getElementById("address");
    const passwordInput = document.getElementById("password");
    const submitButton = form.querySelector("button[type='submit']");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const oldMessage = document.querySelector(".error-message, .success-message");
        if (oldMessage) {
            oldMessage.remove();
        }

        const firstName = firstNameInput.value.trim();
        const lastName = lastNameInput.value.trim();
        const email = emailInput.value.trim();
        const phoneNumber = phoneInput.value.trim();
        const drivingLicense = licenseInput.value.trim();
        const address = addressInput.value.trim();
        const password = passwordInput.value.trim();

        let message = "";

        if (!firstName || !lastName || !email || !phoneNumber || !drivingLicense || !address || !password) {
            message = "Please fill all fields";
        } else if (!email.includes("@") || !email.includes(".")) {
            message = "Please enter a valid email";
        } else if (password.length < 6) {
            message = "Password must be at least 6 characters";
        }

        if (message) {
            const errorDiv = document.createElement("div");
            errorDiv.className = "error-message";
            errorDiv.textContent = message;
            form.insertBefore(errorDiv, form.firstChild);
            return;
        }

        const oldButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = "Creating account...";

        try {
            const userData = {
                name: firstName + " " + lastName,
                email: email,
                password: password,
                phoneNumber: phoneNumber,
                drivingLicenseNumber: drivingLicense,
                address: address
            };

            await signupUser(userData);

            const successDiv = document.createElement("div");
            successDiv.className = "success-message";
            successDiv.textContent = "Account created successfully! Redirecting to login...";
            form.insertBefore(successDiv, form.firstChild);

            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);
        } catch (error) {
            const errorDiv = document.createElement("div");
            errorDiv.className = "error-message";
            errorDiv.textContent = error.message || "Signup failed. Please try again.";
            form.insertBefore(errorDiv, form.firstChild);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = oldButtonText;
        }
    });
});
