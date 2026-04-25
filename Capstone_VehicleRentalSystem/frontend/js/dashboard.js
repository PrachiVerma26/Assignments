import {getAdminVehicles, getAdminVehicleById, createVehicle, updateVehicle, deleteVehicleById, getLocations } from "./api.js";

let vehicles = [];
let editingVehicleId = null;
let deletingVehicleId = null;

document.addEventListener("DOMContentLoaded", () => {
    setupProfileDropdown();
    setupEventListeners();
    setupSidebarNavigation();
    loadVehicles();
});

function setupEventListeners() {
    document.getElementById("addVehicleBtn").addEventListener("click", openAddModal);
    document.getElementById("vehicleForm").addEventListener("submit", saveVehicle);
    document.getElementById("cancelVehicleBtn").addEventListener("click", closeVehicleModal);
    document.getElementById("confirmDeleteBtn").addEventListener("click", confirmDeleteVehicle);
    document.getElementById("cancelDeleteBtn").addEventListener("click", closeDeleteModal);
    document.getElementById("profileUrl").addEventListener("change", updateImagePreview);
    document.getElementById("vehicleSearch").addEventListener("input", applyFilters);
    document.getElementById("typeFilter").addEventListener("change", applyFilters);
    document.getElementById("statusFilter").addEventListener("change", applyFilters);
    document.getElementById("locationFilter").addEventListener("change", applyFilters);
    document.getElementById("resetFiltersBtn").addEventListener("click", resetFilters);
    document.getElementById("logoutBtn").addEventListener("click", logout);
    document.getElementById("manageBookingsBtn").addEventListener("click", () => showSection("bookings"));
    document.querySelector(".menu-icon").addEventListener("click", toggleSidebar);
}

function setupProfileDropdown() {
    const toggle = document.getElementById("profileToggle");
    const dropdown = document.getElementById("profileDropdown");
    const email = localStorage.getItem("email");

    if (email) {
        document.getElementById("adminEmail").textContent = email;
        document.getElementById("adminName").textContent = email.split("@")[0];
        document.getElementById("adminInitial").textContent = email.charAt(0).toUpperCase();
        document.getElementById("profileAvatar").textContent = email.charAt(0).toUpperCase();
    }

    toggle.addEventListener("click", () => {
        dropdown.classList.toggle("active");
    });

    document.addEventListener("click", (event) => {
        if (!toggle.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.classList.remove("active");
        }
    });
}

function setupSidebarNavigation() {
    document.querySelectorAll(".sidebar nav a[data-section]").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            showSection(link.dataset.section);
        });
    });
}

function showSection(sectionName) {
    const isBookings = sectionName === "bookings";
    const sectionTitle = sectionName === "dashboard" ? "Dashboard" : sectionName === "bookings" ? "Bookings" : "Vehicles";

    document.getElementById("vehiclesSection").classList.toggle("active", !isBookings);
    document.getElementById("bookingsSection").classList.toggle("active", isBookings);
    document.getElementById("sectionTitle").textContent = sectionTitle;
    document.getElementById("addVehicleBtn").style.display = isBookings ? "none" : "";
    document.getElementById("manageBookingsBtn").style.display = isBookings ? "none" : "";

    document.querySelectorAll(".sidebar nav a[data-section]").forEach((link) => {
        link.classList.toggle("active", link.dataset.section === sectionName);
    });

    if (!isBookings) {
        loadVehicles();
    }

    closeSidebarOnMobile();
}

function toggleSidebar() {
    document.querySelector(".sidebar").classList.toggle("active");
}

function closeSidebarOnMobile() {
    if (window.innerWidth <= 768) {
        document.querySelector(".sidebar").classList.remove("active");
    }
}

async function loadVehicles() {
    renderLoadingState();
    try {
        vehicles = await getAdminVehicles();
        renderVehicles(vehicles);
        await loadLocations();
    } catch (error) {
        renderVehicles([]);
        showToast(error.message || "Could not load vehicles", "error");
    }
}

async function loadLocations() {
    try {
        const locations = await getLocations();
        populateLocationDropdown("locationId", locations, "Select Location");
        populateLocationDropdown("locationFilter", locations, "All Locations");
    } catch (error) {
        const locationsFromVehicles = getUniqueVehicleLocations();
        populateLocationDropdown("locationId", locationsFromVehicles, "Select Location");
        populateLocationDropdown("locationFilter", locationsFromVehicles, "All Locations");
    }
}

function renderLoadingState() {
    document.getElementById("vehicleList").innerHTML = `
        <div class="empty-state">Loading vehicles...</div>
    `;
}

function renderVehicles(vehicleList) {
    const vehicleListContainer = document.getElementById("vehicleList");
    if (!vehicleList.length) {
        vehicleListContainer.innerHTML = `
            <div class="empty-state">No vehicles found</div>
        `;
        return;
    }
    vehicleListContainer.innerHTML = vehicleList.map((vehicle) => {
        const statusClass = vehicle.status ? vehicle.status.toLowerCase() : "";
        return `
            <div class="vehicle-card" data-id="${vehicle.id}">
                ${vehicle.profileUrl ? `
                    <img src="${vehicle.profileUrl}" class="vehicle-image" alt="${escapeHtml(vehicle.brand)} ${escapeHtml(vehicle.model)}">
                ` : ""}
                <h3>${escapeHtml(vehicle.brand)} ${escapeHtml(vehicle.model)}</h3>
                <p class="vehicle-meta">Type: ${escapeHtml(vehicle.type)}</p>
                <p class="vehicle-meta">Location: ${escapeHtml(formatLocation(vehicle.location))}</p>
                <p class="vehicle-meta">&#8377;${vehicle.dailyRentalRate}/day</p>
                <p class="status ${statusClass}">${escapeHtml(vehicle.status)}</p>
                <div class="card-actions">
                    <button type="button" data-action="edit" data-id="${vehicle.id}">Edit</button>
                    <button type="button" class="danger" data-action="delete" data-id="${vehicle.id}">Delete</button>
                </div>
            </div>
        `;
    }).join("");

    vehicleListContainer.querySelectorAll("[data-action='edit']").forEach((button) => {
        button.addEventListener("click", () => openEditModal(button.dataset.id));
    });

    vehicleListContainer.querySelectorAll("[data-action='delete']").forEach((button) => {
        button.addEventListener("click", () => openDeleteModal(button.dataset.id));
    });
}

function openAddModal() {
    editingVehicleId = null;
    document.getElementById("modalTitle").textContent = "Add Vehicle";
    document.getElementById("vehicleForm").reset();
    clearImagePreview();
    document.getElementById("vehicleModal").style.display = "flex";
}

async function openEditModal(id) {
    try {
        const vehicle = await getAdminVehicleById(id);
        editingVehicleId = id;

        document.getElementById("modalTitle").textContent = "Edit Vehicle";
        document.getElementById("model").value = vehicle.model || "";
        document.getElementById("brand").value = vehicle.brand || "";
        document.getElementById("type").value = vehicle.type || "";
        document.getElementById("status").value = vehicle.status || "AVAILABLE";
        document.getElementById("dailyRentalRate").value = vehicle.dailyRentalRate || "";
        document.getElementById("profileUrl").value = vehicle.profileUrl || "";
        document.getElementById("locationId").value = vehicle.location?.id || "";

        updateImagePreview();
        document.getElementById("vehicleModal").style.display = "flex";
    } catch (error) {
        showToast(error.message || "Could not load vehicle details", "error");
    }
}

function closeVehicleModal() {
    editingVehicleId = null;
    document.getElementById("vehicleModal").style.display = "none";
}

async function saveVehicle(event) {
    event.preventDefault();
    const payload = getVehiclePayload();
    try {
        if (editingVehicleId) {
            await updateVehicle(editingVehicleId, payload);
            showToast("Vehicle updated successfully");
        } else {
            await createVehicle(payload);
            showToast("Vehicle added successfully");
        }
        closeVehicleModal();
        await loadVehicles();
    } catch (error) {
        showToast(error.message || "Could not save vehicle", "error");
    }
}

function getVehiclePayload() {
    return {
        model: document.getElementById("model").value.trim(),
        brand: document.getElementById("brand").value.trim(),
        type: document.getElementById("type").value,
        status: document.getElementById("status").value,
        dailyRentalRate: Number(document.getElementById("dailyRentalRate").value),
        profileUrl: document.getElementById("profileUrl").value,
        locationId: document.getElementById("locationId").value
    };
}

function openDeleteModal(id) {
    deletingVehicleId = id;
    document.getElementById("deleteModal").style.display = "flex";
}

function closeDeleteModal() {
    deletingVehicleId = null;
    document.getElementById("deleteModal").style.display = "none";
}

async function confirmDeleteVehicle() {
    if (!deletingVehicleId) return;

    try {
        await deleteVehicleById(deletingVehicleId);
        closeDeleteModal();
        showToast("Vehicle deleted successfully");
        await loadVehicles();
    } catch (error) {
        showToast(error.message || "Could not delete vehicle", "error");
    }
}

function applyFilters() {
    const search = document.getElementById("vehicleSearch").value.toLowerCase();
    const type = document.getElementById("typeFilter").value;
    const status = document.getElementById("statusFilter").value;
    const locationId = document.getElementById("locationFilter").value;

    const filteredVehicles = vehicles.filter((vehicle) => {
        const matchesSearch =
            (vehicle.model || "").toLowerCase().includes(search) ||
            (vehicle.brand || "").toLowerCase().includes(search) ||
            (vehicle.type || "").toLowerCase().includes(search) ||
            (vehicle.location?.city || "").toLowerCase().includes(search);

        const matchesType = !type || vehicle.type === type;
        const matchesStatus = !status || vehicle.status === status;
        const matchesLocation = !locationId || vehicle.location?.id === locationId;

        return matchesSearch && matchesType && matchesStatus && matchesLocation;
    });

    renderVehicles(filteredVehicles);
}

function resetFilters() {
    document.getElementById("vehicleSearch").value = "";
    document.getElementById("typeFilter").value = "";
    document.getElementById("statusFilter").value = "";
    document.getElementById("locationFilter").value = "";
    renderVehicles(vehicles);
}

function populateLocationDropdown(selectId, locations, defaultText) {
    const select = document.getElementById(selectId);
    select.innerHTML = `<option value="">${defaultText}</option>`;

    locations.forEach((location) => {
        const option = document.createElement("option");
        option.value = location.id;
        option.textContent = formatLocation(location, true);
        select.appendChild(option);
    });
}

function getUniqueVehicleLocations() {
    const locationMap = new Map();
    vehicles.forEach((vehicle) => {
        if (vehicle.location?.id) {
            locationMap.set(vehicle.location.id, vehicle.location);
        }
    });
    return Array.from(locationMap.values());
}

function formatLocation(location, includePincode = false) {
    if (!location) return "Not assigned";
    const cityState = [location.city, location.state].filter(Boolean).join(", ");
    if (includePincode && location.pincode) {
        return `${cityState} - ${location.pincode}`;
    }
    return cityState || location.address || "Not assigned";
}

function updateImagePreview() {
    const imageUrl = document.getElementById("profileUrl").value;
    const preview = document.getElementById("vehicleImagePreview");
    if (!imageUrl) {
        clearImagePreview();
        return;
    }
    preview.src = imageUrl;
    preview.style.display = "block";
}

function clearImagePreview() {
    const preview = document.getElementById("vehicleImagePreview");
    preview.removeAttribute("src");
    preview.style.display = "none";
}

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = type === "error" ? "toast error" : "toast";
    toast.style.display = "block";
    setTimeout(() => {
        toast.style.display = "none";
    }, 2500);
}

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    window.location.href = "./login.html";
}
