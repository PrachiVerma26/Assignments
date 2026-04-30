import {getAdminVehicles, createVehicle, updateVehicle, deleteVehicleById, getAdminBookings} from './api.js';
const state = { vehicles: [], visibleVehicles: [], bookings: [], editingVehicleId: null, deletingVehicleId: null};

const vehicleList = document.getElementById('vehicleList');
const bookingsSection = document.getElementById('bookingsSection');
const recentVehiclesList = document.getElementById('recentVehiclesList');
const recentBookingsList = document.getElementById('recentBookingsList');
const vehicleModal = document.getElementById('vehicleModal');
const deleteModal = document.getElementById('deleteModal');
const vehicleForm = document.getElementById('vehicleForm');
const modalTitle = document.getElementById('modalTitle');
const toast = document.getElementById('toast');
const sectionTitle = document.getElementById('sectionTitle');
const addVehicleBtn = document.getElementById('addVehicleBtn');
const manageBookingsBtn = document.getElementById('manageBookingsBtn');
const viewAllVehiclesBtn = document.getElementById('viewAllVehiclesBtn');
const viewAllBookingsBtn = document.getElementById('viewAllBookingsBtn');
const cancelVehicleBtn = document.getElementById('cancelVehicleBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');
const searchInput = document.getElementById('vehicleSearch');
const typeFilter = document.getElementById('typeFilter');
const statusFilter = document.getElementById('statusFilter');
const locationFilter = document.getElementById('locationFilter');
const locationSelect = document.getElementById('locationId');
const profileUrlSelect = document.getElementById('profileUrl');
const imagePreview = document.getElementById('vehicleImagePreview');

document.addEventListener('DOMContentLoaded', async () => {
    hydrateAdminProfile();
    setupEvents();
    await loadAdminData();
    switchSection('dashboard');
});

function setupEvents() {
    document.querySelectorAll('.sidebar nav a[data-section]').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            switchSection(link.dataset.section);
        });
    });

    document.querySelector('.menu-icon')?.addEventListener('click', () => {
        document.querySelector('.sidebar')?.classList.toggle('active');
    });

    document.getElementById('profileToggle')?.addEventListener('click', () => {
        document.getElementById('profileDropdown')?.classList.toggle('active');
    });

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('role');
        window.location.href = 'index.html';
    });

    addVehicleBtn?.addEventListener('click', () => openVehicleModal());
    manageBookingsBtn?.addEventListener('click', () => switchSection('bookings'));
    viewAllVehiclesBtn?.addEventListener('click', () => switchSection('vehicles'));
    viewAllBookingsBtn?.addEventListener('click', () => switchSection('bookings'));
    cancelVehicleBtn?.addEventListener('click', () => closeModal(vehicleModal));
    cancelDeleteBtn?.addEventListener('click', () => closeModal(deleteModal));
    confirmDeleteBtn?.addEventListener('click', deleteSelectedVehicle);

    vehicleForm?.addEventListener('submit', saveVehicle);
    [searchInput, typeFilter, statusFilter, locationFilter].forEach(control => {
        control?.addEventListener('input', applyVehicleFilters);
        control?.addEventListener('change', applyVehicleFilters);
    });

    resetFiltersBtn?.addEventListener('click', () => {
        searchInput.value = '';
        typeFilter.value = '';
        statusFilter.value = '';
        locationFilter.value = '';
        state.visibleVehicles = state.vehicles;
        renderVehicles();
    });

    profileUrlSelect?.addEventListener('change', updateImagePreview);
    [vehicleModal, deleteModal].forEach(modal => {
        modal?.addEventListener('click', (event) => {
            if (event.target === modal) closeModal(modal);
        });
    });
}

async function loadAdminData() {
    try {
        const [vehicles, bookings] = await Promise.all([
            getAdminVehicles(),
            getAdminBookings()
        ]);

        state.vehicles = vehicles || [];
        state.visibleVehicles = state.vehicles;
        state.bookings = bookings || [];

        populateLocationOptions();
        renderDashboard();
        renderVehicles();
        renderBookings();
    } catch (error) {
        console.error('Admin data load failed:', error);
        showToast(error.message || 'Failed to fetch admin dashboard data', 'error');
    }
}

function switchSection(section) {
    document.querySelectorAll('.dashboard-section').forEach(panel => panel.classList.remove('active'));
    document.getElementById(`${section}Section`)?.classList.add('active');

    document.querySelectorAll('.sidebar nav a[data-section]').forEach(link => {
        link.classList.toggle('active', link.dataset.section === section);
    });
    sectionTitle.textContent = section === 'bookings' ? 'Bookings' : section === 'dashboard' ? 'Dashboard' : 'Vehicles';
    addVehicleBtn.classList.toggle('hidden', section !== 'vehicles');
    manageBookingsBtn.classList.toggle('hidden', section === 'bookings');
}

function hydrateAdminProfile() {
    const email = localStorage.getItem('email') || 'admin@email.com';
    const name = email.split('@')[0] || 'Admin';
    const initial = name.charAt(0).toUpperCase();
    document.getElementById('adminInitial').textContent = initial;
    document.getElementById('profileAvatar').textContent = initial;
    document.getElementById('adminName').textContent = name;
    document.getElementById('adminEmail').textContent = email;
}

function getVehicleName(vehicle) {
    return [vehicle.brand, vehicle.model].filter(Boolean).join(' ') || 'Vehicle';
}

function getLocationText(location) {
    if (!location) return 'N/A';
    return [location.city, location.state].filter(Boolean).join(', ') || 'N/A';
}

function clearElement(element) {
    if (!element) return;
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function createTextElement(tagName, text, className = '') {
    const element = document.createElement(tagName);
    element.textContent = text;
    if (className) element.className = className;
    return element;
}

function createEmptyState(message) {
    return createTextElement('div', message, 'empty-state');
}

function createStatusBadge(status) {
    const badge = createTextElement('span', status || 'N/A', `status ${String(status).toLowerCase()}`);
    return badge;
}

function createVehicleCard(vehicle) {
    const card = document.createElement('article');
    card.className = 'vehicle-card';

    const image = document.createElement('img');
    image.className = 'vehicle-image';
    image.src = vehicle.profileUrl || 'assets/home_car.png';
    image.alt = getVehicleName(vehicle);

    const title = createTextElement('h3', getVehicleName(vehicle));
    const description = createTextElement('p', vehicle.description || 'No description provided');
    const type = createTextElement('div', `Type: ${vehicle.type}`, 'vehicle-meta');
    const location = createTextElement('div', `Location: ${getLocationText(vehicle.location)}`, 'vehicle-meta');
    const registration = createTextElement('div', `Registration: ${vehicle.registrationNumber || '-'}`, 'vehicle-meta');
    const rate = createTextElement('div', `Rate: Rs ${vehicle.dailyRentalRate}/day`, 'vehicle-meta');
    const status = createStatusBadge(vehicle.status);
    const actions = document.createElement('div');
    actions.className = 'card-actions';
    const editButton = createTextElement('button', 'Edit');
    editButton.type = 'button';
    editButton.addEventListener('click', () => openVehicleModal(vehicle.id));
    const deleteButton = createTextElement('button', 'Delete', 'danger');
    deleteButton.type = 'button';
    deleteButton.addEventListener('click', () => openDeleteModal(vehicle.id));

    actions.append(editButton, deleteButton);
    card.append(image, title, description, type, location, registration, rate, status, actions);

    return card;
}

function createBookingCard(booking) {
    const card = document.createElement('article');
    card.className = 'booking-admin-card';
    const vehicleInfo = document.createElement('div');
    vehicleInfo.append(
        createTextElement('h3', [booking.vehicleBrand, booking.vehicleModel].filter(Boolean).join(' ') || 'Vehicle'),
        createTextElement('p', `Booking ID: ${booking.id}`),
        createTextElement('p', `Vehicle ID: ${booking.vehicleId}`)
    );
    const dateInfo = document.createElement('div');
    dateInfo.append(
        createTextElement('p', `Start: ${new Date(booking.startDate).toLocaleString()}`),
        createTextElement('p', `End: ${new Date(booking.endDate).toLocaleString()}`),
        createTextElement('p', `Total: Rs ${booking.totalPrice ?? 0}`)
    );
    card.append(vehicleInfo, dateInfo, createStatusBadge(booking.status));
    return card;
}

function createRecentVehicleItem(vehicle) {
    const item = document.createElement('article');
    item.className = 'recent-item';
    item.append(
        createTextElement('h3', getVehicleName(vehicle)),
        createTextElement('p', `Type: ${vehicle.type || 'N/A'}`),
        createTextElement('p', `Location: ${getLocationText(vehicle.location)}`),
        createStatusBadge(vehicle.status)
    );
    return item;
}

function createRecentBookingItem(booking) {
    const item = document.createElement('article');
    item.className = 'recent-item';
    const vehicleName = [booking.vehicleBrand, booking.vehicleModel].filter(Boolean).join(' ') || 'Vehicle';
    item.append(
        createTextElement('h3', vehicleName),
        createTextElement('p', `Start: ${new Date(booking.startDate).toLocaleDateString()}`),
        createTextElement('p', `Total: Rs ${booking.totalPrice ?? 0}`),
        createStatusBadge(booking.status)
    );
    return item;
}

function renderDashboard() {
    clearElement(recentVehiclesList);
    clearElement(recentBookingsList);
    const recentVehicles = state.vehicles.slice(0, 4);
    const recentBookings = state.bookings.slice(0, 4);
    if (!recentVehicles.length) {
        recentVehiclesList?.appendChild(createEmptyState('No vehicles found from database.'));
    } else {
        recentVehicles.forEach(vehicle => recentVehiclesList?.appendChild(createRecentVehicleItem(vehicle)));
    }
    if (!recentBookings.length) {
        recentBookingsList?.appendChild(createEmptyState('No bookings found from database.'));
    } else {
        recentBookings.forEach(booking => recentBookingsList?.appendChild(createRecentBookingItem(booking)));
    }
}

function renderVehicles() {
    if (!vehicleList) return;
    clearElement(vehicleList);
    if (!state.visibleVehicles.length) {
        vehicleList.appendChild(createEmptyState('No vehicles found from database.'));
        return;
    }
    state.visibleVehicles.forEach(vehicle => {
        vehicleList.appendChild(createVehicleCard(vehicle));
    });
}

function renderBookings() {
    if (!bookingsSection) return;
    clearElement(bookingsSection);
    if (!state.bookings.length) {
        bookingsSection.appendChild(createEmptyState('No bookings found from database.'));
        return;
    }

    const bookingList = document.createElement('div');
    bookingList.className = 'booking-admin-list';
    state.bookings.forEach(booking => bookingList.appendChild(createBookingCard(booking)));
    bookingsSection.appendChild(bookingList);
}

function populateLocationOptions() {
    const locations = new Map();
    state.vehicles.forEach(vehicle => {
        if (vehicle.location?.id) {
            locations.set(vehicle.location.id, getLocationText(vehicle.location));
        }
    });
    const sortedLocations = [...locations.entries()].sort((a, b) => a[1].localeCompare(b[1]));
    if (locationFilter) {
        replaceSelectOptions(locationFilter, 'All Locations', sortedLocations);
    }
    if (locationSelect) {
        replaceSelectOptions(locationSelect, 'Select Location', sortedLocations);
    }
}

function replaceSelectOptions(select, placeholder, options) {
    clearElement(select);
    select.appendChild(new Option(placeholder, ''));
    options.forEach(([id, label]) => {
        select.appendChild(new Option(label, id));
    });
}

function applyVehicleFilters() {
    const query = searchInput.value.trim().toLowerCase();
    const selectedType = typeFilter.value;
    const selectedStatus = statusFilter.value;
    const selectedLocation = locationFilter.value;
    state.visibleVehicles = state.vehicles.filter(vehicle => {
        const haystack = [
            vehicle.brand,
            vehicle.model,
            vehicle.type,
            vehicle.status,
            vehicle.registrationNumber,
            getLocationText(vehicle.location)
        ].join(' ').toLowerCase();

        return (!query || haystack.includes(query))
            && (!selectedType || vehicle.type === selectedType)
            && (!selectedStatus || vehicle.status === selectedStatus)
            && (!selectedLocation || vehicle.location?.id === selectedLocation);
    });
    renderVehicles();
}

function openVehicleModal(vehicleId = null) {
    state.editingVehicleId = vehicleId;
    vehicleForm.reset();
    imagePreview.classList.add('hidden');
    imagePreview.removeAttribute('src');
    if (vehicleId) {
        const vehicle = state.vehicles.find(item => item.id === vehicleId);
        if (!vehicle) return;
        modalTitle.textContent = 'Edit Vehicle';
        document.getElementById('model').value = vehicle.model || '';
        document.getElementById('brand').value = vehicle.brand || '';
        document.getElementById('type').value = vehicle.type || '';
        document.getElementById('registrationNumber').value = vehicle.registrationNumber || '';
        document.getElementById('description').value = vehicle.description || '';
        document.getElementById('status').value = vehicle.status || 'AVAILABLE';
        document.getElementById('dailyRentalRate').value = vehicle.dailyRentalRate || '';
        document.getElementById('profileUrl').value = vehicle.profileUrl || '';
        document.getElementById('locationId').value = vehicle.location?.id || '';
        updateImagePreview();
    } else {
        modalTitle.textContent = 'Add Vehicle';
        document.getElementById('status').value = 'AVAILABLE';
    }

    openModal(vehicleModal);
}

async function saveVehicle(event) {
    event.preventDefault();
    const payload = {
        model: document.getElementById('model').value.trim(),
        brand: document.getElementById('brand').value.trim(),
        type: document.getElementById('type').value,
        registrationNumber: document.getElementById('registrationNumber').value.trim(),
        description: document.getElementById('description').value.trim(),
        status: document.getElementById('status').value,
        dailyRentalRate: Number(document.getElementById('dailyRentalRate').value),
        profileUrl: document.getElementById('profileUrl').value,
        locationId: document.getElementById('locationId').value
    };

    try {
        if (state.editingVehicleId) {
            await updateVehicle(state.editingVehicleId, payload);
            showToast('Vehicle updated from database', 'success');
        } else {
            await createVehicle(payload);
            showToast('Vehicle added to database', 'success');
        }

        closeModal(vehicleModal);
        await loadAdminData();
    } catch (error) {
        console.error('Save vehicle failed:', error);
        showToast(error.message || 'Failed to save vehicle', 'error');
    }
}

function openDeleteModal(vehicleId) {
    state.deletingVehicleId = vehicleId;
    openModal(deleteModal);
}

async function deleteSelectedVehicle() {
    if (!state.deletingVehicleId) return;
    try {
        await deleteVehicleById(state.deletingVehicleId);
        closeModal(deleteModal);
        showToast('Vehicle deleted from database', 'success');
        state.deletingVehicleId = null;
        await loadAdminData();
    } catch (error) {
        console.error('Delete failed:', error);
        showToast(error.message || 'Failed to delete vehicle', 'error');
    }
}

function updateImagePreview() {
    const imageUrl = profileUrlSelect.value;
    if (!imageUrl) {
        imagePreview.classList.add('hidden');
        imagePreview.removeAttribute('src');
        return;
    }

    imagePreview.src = imageUrl;
    imagePreview.classList.remove('hidden');
}

function openModal(modal) {
    modal.classList.add('active');
}

function closeModal(modal) {
    modal.classList.remove('active');
}

function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}