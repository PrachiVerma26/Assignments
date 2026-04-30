import {cancelBooking, createBooking, getAllPublicVehicles, getAvailableVehiclesByDateRange, getLocations, getUserBookings, getUserProfile,getVehicleById, updateUserProfile } from './api.js';

const ITEMS_PER_PAGE = 8;
const state = {
    allVehicles: [],
    filteredVehicles: [],
    currentPage: 1,
    bookings: [],
    selectedVehicleId: null,
    currentVehicle: null,
    previousSection: 'browse'
};

document.addEventListener('DOMContentLoaded', async () => {
    guardAuth();
    setupEvents();
    await Promise.all([loadProfile(), loadLocations(), loadVehicles(), loadBookings()]);
    renderDashboard();
});

function setupEvents() {
    document.querySelectorAll('.sidebar nav a[data-section]').forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            switchSection(link.dataset.section);
        });
    });

    document.querySelector('.menu-icon')?.addEventListener('click', () => {
        document.querySelector('.sidebar')?.classList.toggle('collapsed');
        document.querySelector('.main-content')?.classList.toggle('expanded');
    });

    document.getElementById('profileToggle')?.addEventListener('click', () => {
        document.getElementById('profileDropdown')?.classList.toggle('active');
    });

    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    document.getElementById('logoutLink')?.addEventListener('click', event => {
        event.preventDefault();
        logout();
    });

    document.getElementById('searchVehiclesBtn')?.addEventListener('click', searchVehicles);
    document.getElementById('applyBrowseFiltersBtn')?.addEventListener('click', applyBrowseFilters);
    document.getElementById('resetBrowseFiltersBtn')?.addEventListener('click', resetBrowseFilters);
    document.getElementById('viewAllVehiclesLink')?.addEventListener('click', event => {
        event.preventDefault();
        switchSection('browse');
    });

    document.querySelectorAll('.js-browse-link').forEach(button => {
        button.addEventListener('click', () => switchSection('browse'));
    });
    document.getElementById('editProfileBtn')?.addEventListener('click', enterEditProfile);
    document.getElementById('saveProfileBtn')?.addEventListener('click', saveProfile);
    document.getElementById('cancelEditProfileBtn')?.addEventListener('click', cancelEditProfile);
    document.getElementById('backToVehiclesBtn')?.addEventListener('click', goBackToVehicles);
    document.getElementById('vehicleDetailBookBtn')?.addEventListener('click', bookVehicleFromDetails);
    document.getElementById('confirmBookingBtn')?.addEventListener('click', confirmBooking);
    document.getElementById('cancelBookingBtn')?.addEventListener('click', closeModals);
    document.getElementById('cancelConfirmBtn')?.addEventListener('click', closeConfirmModal);
    window.addEventListener('click', event => {
        if (event.target === document.getElementById('bookingModal')) closeModals();
        if (event.target === document.getElementById('confirmModal')) closeConfirmModal();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeModals();
            closeConfirmModal();
        }
    });
}

function guardAuth() {
    if (!localStorage.getItem('token')) {
        window.location.href = 'login.html';
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    window.location.href = 'index.html';
}

function switchSection(section) {
    document.querySelectorAll('.dashboard-section').forEach(panel => panel.classList.remove('active'));
    document.getElementById(`${section}Section`)?.classList.add('active');

    document.querySelectorAll('.sidebar nav a[data-section]').forEach(link => {
        link.classList.toggle('active', link.dataset.section === section);
    });

    const titles = {
        dashboard: 'Dashboard',
        browse: 'Browse Vehicles',
        bookings: 'My Bookings',
        profile: 'Profile',
        vehicleDetails: 'Vehicle Details'
    };
    document.getElementById('sectionTitle').textContent = titles[section] || '';

    if (section === 'bookings') renderAllBookings();
    if (section === 'browse') renderBrowseGrid();

    if (section !== 'vehicleDetails') {
        state.previousSection = section;
    }
}

async function loadProfile() {
    try {
        const profile = await getUserProfile();
        const name = profile.name || 'User';
        const initial = name.charAt(0).toUpperCase();

        setText('welcomeMsg', `Welcome, ${name}`);
        setText('userInitial', initial);
        setText('dropdownAvatar', initial);
        setText('dropdownName', name);
        setText('dropdownEmail', profile.email || '');
        setText('pName', profile.name || '-');
        setText('pEmail', profile.email || '-');
        setText('pPhone', profile.phoneNumber || '-');
        setText('pLicense', profile.drivingLicenseNumber || '-');

        document.getElementById('editName').value = profile.name || '';
        document.getElementById('editPhone').value = profile.phoneNumber || '';
        document.getElementById('editAddress').value = profile.address || '';
        document.getElementById('editLicense').value = profile.drivingLicenseNumber || '';
    } catch (error) {
        console.error('Profile load failed:', error);
    }
}

function enterEditProfile() {
    document.getElementById('profileView').classList.add('hidden');
    document.getElementById('profileEdit').classList.remove('hidden');
}

function cancelEditProfile() {
    document.getElementById('profileView').classList.remove('hidden');
    document.getElementById('profileEdit').classList.add('hidden');
    document.querySelectorAll('.form-input').forEach(input => input.classList.remove('error'));
    document.querySelectorAll('.field-error').forEach(error => {
        error.textContent = '';
    });
}

async function saveProfile() {
    document.querySelectorAll('.form-input').forEach(input => input.classList.remove('error'));
    document.querySelectorAll('.field-error').forEach(error => {
        error.textContent = '';
    });

    const nameInput = document.getElementById('editName');
    const phoneInput = document.getElementById('editPhone');
    const addressInput = document.getElementById('editAddress');
    const licenseInput = document.getElementById('editLicense');

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const address = addressInput.value.trim();
    const license = licenseInput.value.trim();

    let hasErrors = false;

    if (!name || name.length < 3 || name.length > 50) {
        nameInput.classList.add('error');
        document.getElementById('nameError').textContent = 'Name must be 3-50 characters';
        hasErrors = true;
    }

    if (!phone || !/^[0-9]{10}$/.test(phone)) {
        phoneInput.classList.add('error');
        document.getElementById('phoneError').textContent = 'Phone must be exactly 10 digits';
        hasErrors = true;
    }

    if (!address) {
        addressInput.classList.add('error');
        document.getElementById('addressError').textContent = 'Address is required';
        hasErrors = true;
    }

    if (!license || !license.startsWith('DL') || license.length !== 16) {
        licenseInput.classList.add('error');
        document.getElementById('licenseError').textContent = 'License must start with "DL" and be exactly 16 characters';
        hasErrors = true;
    }

    if (hasErrors) return;

    try {
        await updateUserProfile({ name, phoneNumber: phone, address, drivingLicenseNumber: license });
        showToast('Profile updated successfully', 'success');
        await loadProfile();
        cancelEditProfile();
    } catch (error) {
        showToast(error.message || 'Update failed', 'error');
    }
}

async function loadLocations() {
    try {
        const locations = await getLocations() || [];
        populateLocationSelect('searchLocation', locations);
        populateLocationSelect('browseLocation', locations);
    } catch (error) {
        console.error('Locations load failed:', error);
    }
}

function populateLocationSelect(selectId, locations) {
    const select = document.getElementById(selectId);
    if (!select) return;

    clearElement(select);
    select.appendChild(new Option('All Locations', ''));

    locations.forEach(location => {
        select.appendChild(new Option(`${location.city}, ${location.state}`, location.id));
    });
}

async function loadVehicles() {
    try {
        state.allVehicles = await getAllPublicVehicles() || [];
        state.filteredVehicles = [...state.allVehicles];
    } catch (error) {
        console.error('Vehicles load failed:', error);
    }
}

async function loadBookings() {
    try {
        state.bookings = await getUserBookings() || [];
    } catch (error) {
        console.error('Bookings load failed:', error);
    }
}

function renderDashboard() {
    const recent = state.bookings.slice(0, 4);
    const recentWrap = document.getElementById('recentBookingsWrap');
    const emptyState = document.getElementById('emptyBookingState');
    const recentBody = document.getElementById('recentBookingsBody');
    clearElement(recentBody);
    if (recent.length) {
        recentWrap.classList.remove('hidden');
        emptyState.classList.add('hidden');
        recent.forEach(booking => recentBody.appendChild(createBookingRow(booking)));
    } else {
        recentWrap.classList.add('hidden');
        emptyState.classList.remove('hidden');
    }
    const recommendedGrid = document.getElementById('recommendedGrid');
    clearElement(recommendedGrid);
    state.allVehicles
        .filter(vehicle => vehicle.status === 'AVAILABLE')
        .slice(0, 4)
        .forEach(vehicle => recommendedGrid.appendChild(createVehicleCard(vehicle)));
}

async function searchVehicles() {
    const startDate = document.getElementById('searchStart').value;
    const endDate = document.getElementById('searchEnd').value;
    const type = document.getElementById('searchType').value;
    const locationId = document.getElementById('searchLocation').value;
    if (!startDate || !endDate) {
        showToast('Please select pickup and drop-off dates', 'error');
        return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
        showToast('Drop-off date must be after pickup date', 'error');
        return;
    }

    try {
        const searchResults = await getAvailableVehiclesByDateRange(startDate, endDate, type, locationId);
        state.filteredVehicles = searchResults || [];
        state.currentPage = 1;
        switchSection('browse');
        renderBrowseGrid();

        if (!state.filteredVehicles.length) {
            showToast('No vehicles available for selected criteria', 'info');
        } else {
            showToast(`Found ${state.filteredVehicles.length} available vehicles`, 'success');
        }
    } catch (error) {
        console.error('Search failed:', error);
        showToast(error.message || 'Search failed', 'error');
    }
}

function createVehicleCard(vehicle) {
    const card = document.createElement('article');
    card.className = 'vehicle-card';

    const header = document.createElement('div');
    header.className = 'vehicle-card-header';
    header.appendChild(createStatusBadge(vehicle.status));

    const image = document.createElement('img');
    image.src = getImageUrl(vehicle);
    image.alt = getVehicleName(vehicle);
    image.addEventListener('error', () => {
        image.src = 'assets/home_car.png';
    });

    const content = document.createElement('div');
    content.className = 'vehicle-card-content';
    content.append(
        createTextElement('h3', getVehicleName(vehicle)),
        createTextElement('div', getLocationText(vehicle.location), 'vehicle-location'),
        createTextElement('div', `Rs ${vehicle.dailyRentalRate || 0}/day`, 'vehicle-price'),
        createVehicleActions(vehicle)
    );

    card.append(header, image, content);
    return card;
}

function createVehicleActions(vehicle) {
    const actions = document.createElement('div');
    actions.className = 'vehicle-card-actions';

    const detailsButton = createTextElement('button', 'View Details', 'btn btn-secondary');
    detailsButton.type = 'button';
    detailsButton.addEventListener('click', () => viewVehicleDetails(vehicle.id));

    const available = vehicle.status === 'AVAILABLE';
    const bookButton = createTextElement('button', available ? 'Book Now' : 'Not Available', 'btn btn-primary');
    bookButton.type = 'button';
    bookButton.disabled = !available;
    bookButton.addEventListener('click', () => bookNow(vehicle.id));

    actions.append(detailsButton, bookButton);
    return actions;
}

function createBookingRow(booking) {
    const row = document.createElement('tr');
    row.append(
        createCell(getVehicleLabel(booking), true),
        createCell(formatDate(booking.startDate)),
        createCell(formatDate(booking.endDate)),
        createCell(booking.totalPrice ? `Rs ${booking.totalPrice}` : '-', true),
        createStatusCell(booking.status),
        createActionCell(booking)
    );
    return row;
}

function createCell(text, strong = false) {
    const cell = document.createElement('td');
    if (strong) {
        const value = createTextElement('strong', text);
        cell.appendChild(value);
    } else {
        cell.textContent = text;
    }
    return cell;
}

function createStatusCell(status) {
    const cell = document.createElement('td');
    cell.appendChild(createStatusBadge(status));
    return cell;
}

function createActionCell(booking) {
    const cell = document.createElement('td');
    if (booking.status === 'CONFIRMED') {
        const cancelButton = createTextElement('button', 'Cancel', 'action-btn cancel');
        cancelButton.type = 'button';
        cancelButton.addEventListener('click', () => cancelSelectedBooking(booking.id));
        cell.appendChild(cancelButton);
        return cell;
    }
    if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
        const viewButton = createTextElement('button', 'View', 'action-btn view');
        viewButton.type = 'button';
        viewButton.addEventListener('click', () => viewBookingDetails(booking.id));
        cell.appendChild(viewButton);
        return cell;
    }
    cell.textContent = '-';
    return cell;
}

async function cancelSelectedBooking(bookingId) {
    if (!confirm('Cancel this booking?')) return;
    try {
        await cancelBooking(bookingId);
        showToast('Booking cancelled successfully', 'success');
        await loadBookings();
        renderDashboard();
        renderAllBookings();
    } catch (error) {
        showToast(error.message || 'Cancel failed', 'error');
    }
}

function viewBookingDetails() {
    showToast('Booking details view - Feature coming soon', 'info');
}

function renderAllBookings() {
    const tbody = document.getElementById('allBookingsBody');
    const empty = document.getElementById('bookingsEmpty');
    clearElement(tbody);

    if (!state.bookings.length) {
        empty.classList.remove('hidden');
        return;
    }

    empty.classList.add('hidden');
    state.bookings.forEach(booking => tbody.appendChild(createBookingRow(booking)));
}

function renderBrowseGrid() {
    const browseGrid = document.getElementById('browseGrid');
    const start = (state.currentPage - 1) * ITEMS_PER_PAGE;
    const page = state.filteredVehicles.slice(start, start + ITEMS_PER_PAGE);

    clearElement(browseGrid);
    page.forEach(vehicle => browseGrid.appendChild(createVehicleCard(vehicle)));
    renderPagination();
}

function renderPagination() {
    const pagination = document.getElementById('browsePagination');
    const totalPages = Math.ceil(state.filteredVehicles.length / ITEMS_PER_PAGE);
    clearElement(pagination);
    if (totalPages <= 1) return;
    for (let page = 1; page <= totalPages; page += 1) {
        const buttonClass = page === state.currentPage ? 'btn btn-primary' : 'btn btn-secondary';
        const button = createTextElement('button', String(page), buttonClass);
        button.type = 'button';
        button.addEventListener('click', () => changePage(page));
        pagination.appendChild(button);
    }
}

function changePage(page) {
    state.currentPage = page;
    renderBrowseGrid();
}

function applyBrowseFilters() {
    const type = document.getElementById('browseType').value;
    const location = document.getElementById('browseLocation').value;
    const status = document.getElementById('browseStatus').value;
    state.filteredVehicles = state.allVehicles.filter(vehicle =>
        (!type || vehicle.type === type) &&
        (!location || String(vehicle.location?.id) === location) &&
        (!status || vehicle.status === status)
    );

    state.currentPage = 1;
    renderBrowseGrid();
}

function resetBrowseFilters() {
    document.getElementById('browseType').value = '';
    document.getElementById('browseLocation').value = '';
    document.getElementById('browseStatus').value = '';
    state.filteredVehicles = [...state.allVehicles];
    state.currentPage = 1;
    renderBrowseGrid();
}

async function viewVehicleDetails(id) {
    try {
        const vehicle = await getVehicleById(id);
        state.currentVehicle = vehicle;
        setText('vehicleDetailName', getVehicleName(vehicle));
        setText('vehicleDetailPrice', `Rs ${vehicle.dailyRentalRate}/day`);
        setText('vehicleDetailType', vehicle.type || 'N/A');
        setText('vehicleDetailLocation', getLocationText(vehicle.location));
        document.getElementById('vehicleDetailImage').src = getImageUrl(vehicle);

        const statusElement = document.getElementById('vehicleDetailStatus');
        statusElement.textContent = vehicle.status;
        statusElement.className = `status ${String(vehicle.status).toLowerCase()}`;
        updateRegistrationRow(vehicle.registrationNumber);
        updateVehicleDescription(vehicle.description);
        updateVehicleDetailBookButton(vehicle.status);
        switchSection('vehicleDetails');
    } catch (error) {
        showToast(error.message || 'Failed to load vehicle details', 'error');
    }
}

function updateRegistrationRow(registrationNumber) {
    const row = document.getElementById('vehicleRegRow');
    if (registrationNumber) {
        setText('vehicleDetailReg', registrationNumber);
        row.classList.remove('hidden');
        return;
    }
    setText('vehicleDetailReg', 'N/A');
    row.classList.add('hidden');
}

function updateVehicleDescription(description) {
    const descriptionWrap = document.getElementById('vehicleDetailDesc');
    if (description) {
        setText('vehicleDescText', description);
        descriptionWrap.classList.remove('hidden');
        return;
    }
    setText('vehicleDescText', '');
    descriptionWrap.classList.add('hidden');
}

function updateVehicleDetailBookButton(status) {
    const button = document.getElementById('vehicleDetailBookBtn');
    const available = status === 'AVAILABLE';
    button.disabled = !available;
    button.textContent = available ? 'Book Now' : 'Not Available';
}

function goBackToVehicles() {
    switchSection(state.previousSection);
}

function bookVehicleFromDetails() {
    if (state.currentVehicle) {
        bookNow(state.currentVehicle.id);
    }
}

function bookNow(vehicleId) {
    if (!localStorage.getItem('token')) {
        localStorage.setItem('pendingVehicleId', vehicleId);
        window.location.href = 'login.html';
        return;
    }

    state.selectedVehicleId = vehicleId;
    document.getElementById('bookStart').value = '';
    document.getElementById('bookEnd').value = '';
    document.getElementById('bookPayment').value = '';
    document.getElementById('bookingError').classList.add('hidden');
    document.getElementById('bookingError').textContent = '';
    document.getElementById('bookingModal').classList.add('show');
}

async function confirmBooking() {
    const startDate = document.getElementById('bookStart').value;
    const endDate = document.getElementById('bookEnd').value;
    const paymentMethod = document.getElementById('bookPayment').value;

    if (!startDate || !endDate || !paymentMethod) {
        showError('All fields are required.');
        return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
        showError('End date must be after start date.');
        return;
    }
    try {
        await createBooking({
            vehicleId: state.selectedVehicleId,
            startDate,
            endDate,
            paymentMethod
        });
        closeModals();
        showToast('Booking successful', 'success');
        setTimeout(() => showToast('Payment successful. Booking confirmed', 'success'), 1500);
        await loadBookings();
        renderDashboard();
        switchSection('bookings');
    } catch (error) {
        showError(error.message || 'Booking failed.');
    }
}

function closeModals() {
    document.getElementById('bookingModal').classList.remove('show');
}

function closeConfirmModal() {
    document.getElementById('confirmModal').classList.remove('show');
}

function showError(message) {
    const error = document.getElementById('bookingError');
    error.textContent = message;
    error.classList.remove('hidden');
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function createStatusBadge(status) {
    return createTextElement('span', status || 'N/A', `status-badge ${String(status).toLowerCase()}`);
}

function createTextElement(tagName, text, className = '') {
    const element = document.createElement(tagName);
    element.textContent = text;
    if (className) element.className = className;
    return element;
}

function clearElement(element) {
    if (!element) return;
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function setText(id, text) {
    document.getElementById(id).textContent = text;
}

function getImageUrl(vehicle) {
    return vehicle.profileUrl || 'assets/home_car.png';
}

function getVehicleName(vehicle) {
    return `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() || 'Vehicle';
}

function getVehicleLabel(booking) {
    return `${booking.vehicleBrand || ''} ${booking.vehicleModel || ''}`.trim() || 'Vehicle';
}

function getLocationText(location) {
    if (!location) return 'N/A';
    return `${location.city}, ${location.state}`;
}

function formatDate(value) {
    return value ? new Date(value).toLocaleDateString() : '-';
}

const pendingVehicleId = localStorage.getItem('pendingVehicleId');
if (pendingVehicleId) {
    localStorage.removeItem('pendingVehicleId');
    setTimeout(() => bookNow(pendingVehicleId), 1000);
}
