// runs after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    renderAuthHeader();
    document.getElementById('browseVehiclesBtn').onclick = () => window.location.href = 'vehicles.html';
});

// render header based on authentication state
function renderAuthHeader() {
    const token = localStorage.getItem('token'), email = localStorage.getItem('email'), authSection = document.getElementById('authSection');
    if (!authSection) return;
    authSection.innerHTML = !token || !email ? `
    <a href="login.html" class="btn">Login</a>
    <a href="signup.html" class="btn">Sign Up</a>` : 
        `<div class="user-menu">
            <div class="user-info">
                <span class="user-name">${email.split('@')[0]}</span>
                <small class="user-email-inline">${email}</small>
            </div>
            <button class="logout-btn" onclick="logout()">Logout</button>
        </div>`;
}

window.logout = () => { 
    ['token', 'email', 'role', 'pendingVehicleId'].forEach(k => 
        localStorage.removeItem(k)); window.location.href = 'index.html'; 
};