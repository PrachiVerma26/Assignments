import { signupUser } from "./api.js";

// storage
function saveToken(token) {
    localStorage.setItem("token", token);
}

function saveUser(data) {
    localStorage.setItem("email", data.email);
    localStorage.setItem("role", data.role);
}

document.addEventListener("DOMContentLoaded", () => {

     console.log("[SIGNUP] Page loaded"); 
    const form = document.getElementById("signupForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        console.log("[SIGNUP] Form submitted");
        const firstName = document.getElementById("firstName").value;
        const lastName = document.getElementById("lastName").value;
        const phoneInput=document.getElementById("phone");
        const phone = phoneInput ? phoneInput.value.trim() : "";
        const email = document.getElementById("email").value.trim();

        if (!firstName || !lastName || !email || !password) {
            alert("All fields are required");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        console.log("Email value:", email);
        if (!emailRegex.test(email)) {
            alert("Invalid email format");
            return;
        }
        if (password.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }
        const phoneRegex=/^\d{10}$/;
        if(!phoneRegex.test(phone)){
            alert("Invalid phone number format");
        }
        const payload = {
            name: firstName + " " + lastName,
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
            phoneNumber:phone || null
        };

        try {
            const response = await signupUser(payload);
            console.log("[SIGNUP] API success:", response);
            // If your backend returns token on signup
            if (response.token) {
                saveToken(response.token);
                saveUser(response);
                window.location.href = "./home.html";
            } else {
                alert("Signup successful. Please login.");
                window.location.href = "login.html";
            }

        } catch (error) {
            alert(error.message);
        }
    });

});