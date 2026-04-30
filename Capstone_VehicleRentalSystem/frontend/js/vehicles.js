import {createBooking, getAllPublicVehicles, getAvailableVehiclesByDateRange, getLocations, getVehicleById } from './api.js';

const ITEMS_PER_PAGE = 12;
const state = {
    allVehicles: [],
    filteredVehicles: [],
    currentPage: 1,
    locations: [],
    currentVehicle: null,
    selectedVehicleId: null
};

const vehicleGrid = document.getElementById('vehicleGrid');
const pagination = document.getElementById('pagination');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const vehicleListView = document.getElementById('vehicleListView');
const vehicleDetailsView = document.getElementById('vehicleDetailsView');
const bookingModal = document.getElementById('bookingModal');
const bookingError = document.getElementById('bookingError');
const toast = document.getElementById('toast');

document.addEventListener('DOMContentLoaded', async () => {
    setupEventListeners();
    showLoading(true);
    await Promise.all([loadVehicles(), loadLocations()]);
    renderVehicles();
    showLoading(false);
});

function setupEventListeners() {
    document.getElementById('loginBtn')?.addEventListener('click', () => {
        window.location.href = 'login.html';
    });

    document.getElementById('signupBtn')?.addEventListener('click', () => {
        window.location.href = 'signup.html';
    });

    document.getElementById('searchVehiclesBtn')?.addEventListener('click', applyFilters);
    document.getElementById('resetFiltersBtn')?.addEventListener('click', resetFilters);
    document.getElementById('backToVehiclesBtn')?.addEventListener('click', goBackToList);
    document.getElementById('detailBookBtn')?.addEventListener('click', handleBookingFromDetails);
    document.getElementById('confirmBookingBtn')?.addEventListener('click', confirmBooking);
    document.getElementById('cancelBookingBtn')?.addEventListener('click', closeBookingModal);
    window.addEventListener('click', event => {
        if (event.target === bookingModal) closeBookingModal();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeBookingModal();
    });
}

async function loadVehicles() {
    try {
        state.allVehicles = await getAllPublicVehicles() || [];
        state.filteredVehicles = [...state.allVehicles];
    } catch (error) {
        console.error('Failed to load vehicles:', error);
        showToast('Failed to load vehicles', 'error');
    }
}

async function loadLocations() {
    try {
        state.locations = await getLocations() || [];
        populateLocationFilter();
    } catch (error) {
        console.error('Failed to load locations:', error);
    }
}

function populateLocationFilter() {
    const select = document.getElementById('filterLocation');
    if (!select) return;
    clearElement(select);
    select.appendChild(new Option('All Locations', ''));
    state.locations.forEach(location => {
        select.appendChild(new Option(`${location.city}, ${location.state}`, location.id));
    });
}

function renderVehicles() {
    const start = (state.currentPage - 1) * ITEMS_PER_PAGE;
    const pageVehicles = state.filteredVehicles.slice(start, start + ITEMS_PER_PAGE);
    clearElement(vehicleGrid);
    clearElement(pagination);
    if (!state.filteredVehicles.length) {
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');
    pageVehicles.forEach(vehicle => {
        vehicleGrid.appendChild(createVehicleCard(vehicle));
    });
    renderPagination();
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
    const title = createTextElement('h3', getVehicleName(vehicle));
    const location = createTextElement('div', getLocationText(vehicle.location), 'vehicle-location');
    const price = createTextElement('div', `Rs ${vehicle.dailyRentalRate || 0}/day`, 'vehicle-price');
    const actions = createVehicleActions(vehicle);
    content.append(title, location, price, actions);
    card.append(header, image, content);
    return card;
}

function createVehicleActions(vehicle) {
    const actions = document.createElement('div');
    actions.className = 'vehicle-card-actions';
    const detailsButton = createTextElement('button', 'View Details', 'btn btn-secondary');
    detailsButton.type = 'button';
    detailsButton.addEventListener('click', () => viewVehicleDetails(vehicle.id));
    const bookingButton = createTextElement('button', getBookingButtonText(vehicle.status), 'btn btn-primary');
    bookingButton.type = 'button';
    bookingButton.disabled = vehicle.status !== 'AVAILABLE';
    bookingButton.addEventListener('click', () => handleBooking(vehicle.id));
    actions.append(detailsButton, bookingButton);
    return actions;
}

function renderPagination() {
    const totalPages = Math.ceil(state.filteredVehicles.length / ITEMS_PER_PAGE);
    if (totalPages <= 1) return;
    for (let page = 1; page <= totalPages; page += 1) {
        const buttonClass = page === state.currentPage ? 'btn btn-primary' : 'btn btn-secondary';
        const button = createTextElement('button', String(page), buttonClass);
        button.type = 'button';
        button.addEventListener('click', () => changePage(page));
        pagination.appendChild(button);
    }
}

async function applyFilters() {
    const startDate = document.getElementById('filterStartDate').value;
    const endDate = document.getElementById('filterEndDate').value;
    const type = document.getElementById('filterType').value;
    const location = document.getElementById('filterLocation').value;
    const status = document.getElementById('filterStatus').value;

    try {
        showLoading(true);
        let vehicles = [...state.allVehicles];
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (start >= end) {
                showToast('End date must be after start date', 'error');
                return;
            }
            vehicles = await getAvailableVehiclesByDateRange(startDate, endDate, type, location) || [];
            showToast(`Found ${vehicles.length} available vehicles for selected dates`, 'success');
        }
        state.filteredVehicles = vehicles.filter(vehicle =>
            (!type || vehicle.type === type) &&
            (!location || String(vehicle.location?.id) === location) &&
            (!status || vehicle.status === status)
        );
        state.currentPage = 1;
        renderVehicles();
        if (!startDate || !endDate) {
            showToast(`Found ${state.filteredVehicles.length} vehicles`, 'info');
        }
    } catch (error) {
        console.error('Filter error:', error);
        showToast(error.message || 'Search failed', 'error');
    } finally {
        showLoading(false);
    }
}

function resetFilters() {
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    document.getElementById('filterType').value = '';
    document.getElementById('filterLocation').value = '';
    document.getElementById('filterStatus').value = '';
    state.filteredVehicles = [...state.allVehicles];
    state.currentPage = 1;
    renderVehicles();
    showToast('Filters reset', 'info');
}

function changePage(page) {
    state.currentPage = page;
    renderVehicles();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function viewVehicleDetails(vehicleId) {
    try {
        showLoading(true);
        const vehicle = await getVehicleById(vehicleId);
        state.currentVehicle = vehicle;
        showVehicleDetails(vehicle);
    } catch (error) {
        console.error('Vehicle details failed:', error);
        showToast('Failed to load vehicle details', 'error');
    } finally {
        showLoading(false);
    }
}

function showVehicleDetails(vehicle) {
    document.getElementById('detailVehicleImage').src = getImageUrl(vehicle);
    document.getElementById('detailVehicleName').textContent = getVehicleName(vehicle);
    document.getElementById('detailVehiclePrice').textContent = `Rs ${vehicle.dailyRentalRate}/day`;
    const statusElement = document.getElementById('detailVehicleStatus');
    statusElement.textContent = vehicle.status;
    statusElement.className = `status-badge ${String(vehicle.status).toLowerCase()}`;
    renderVehicleSpecs(vehicle);
    renderVehicleDescription(vehicle.description);
    updateDetailBookingButton(vehicle.status);
    vehicleListView.classList.add('hidden');
    vehicleDetailsView.classList.remove('hidden');
}

function renderVehicleSpecs(vehicle) {
    const specs = document.getElementById('detailVehicleSpecs');
    clearElement(specs);
    if (vehicle.type) {
        specs.appendChild(createSpecItem('Type:', vehicle.type));
    }
    const location = getLocationText(vehicle.location);
    if (location !== 'N/A') {
        specs.appendChild(createSpecItem('Location:', location));
    }
    if (vehicle.registrationNumber) {
        specs.appendChild(createSpecItem('Registration:', vehicle.registrationNumber));
    }
}

function createSpecItem(label, value) {
    const item = document.createElement('div');
    item.className = 'spec-item';
    const strong = createTextElement('strong', label);
    const text = createTextElement('span', value);
    item.append(strong, text);
    return item;
}

function renderVehicleDescription(description) {
    const descriptionWrap = document.getElementById('detailVehicleDesc');
    const descriptionText = document.getElementById('detailDescText');
    if (description) {
        descriptionText.textContent = description;
        descriptionWrap.classList.remove('hidden');
        return;
    }
    descriptionText.textContent = '';
    descriptionWrap.classList.add('hidden');
}

function updateDetailBookingButton(status) {
    const bookButton = document.getElementById('detailBookBtn');
    bookButton.textContent = getBookingButtonText(status);
    bookButton.disabled = status !== 'AVAILABLE';
}

function goBackToList() {
    vehicleDetailsView.classList.add('hidden');
    vehicleListView.classList.remove('hidden');
}

function handleBookingFromDetails() {
    if (state.currentVehicle) {
        handleBooking(state.currentVehicle.id);
    }
}

function handleBooking(vehicleId) {
    if (!localStorage.getItem('token')) {
        localStorage.setItem('pendingVehicleId', vehicleId);
        showToast('Please login to book a vehicle', 'info');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    state.selectedVehicleId = vehicleId;
    openBookingModal();
}

function openBookingModal() {
    document.getElementById('bookStart').value = '';
    document.getElementById('bookEnd').value = '';
    document.getElementById('bookPayment').value = '';
    bookingError.classList.add('hidden');
    bookingError.textContent = '';
    bookingModal.classList.add('show');
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
        await createBooking({ vehicleId: state.selectedVehicleId, startDate, endDate, paymentMethod});
        closeBookingModal();
        showToast('Booking successful', 'success');
        setTimeout(() => showToast('Payment successful. Booking confirmed', 'success'), 1500);
        setTimeout(() => {
            window.location.href = 'customer-dashboard.html';
        }, 3000);
    } catch (error) {
        showError(error.message || 'Booking failed.');
    }
}

function closeBookingModal() {
    bookingModal.classList.remove('show');
}

function showError(message) {
    bookingError.textContent = message;
    bookingError.classList.remove('hidden');
}

function showLoading(show) {
    loadingState.classList.toggle('hidden', !show);

    if (show) {
        vehicleGrid.classList.add('hidden');
        vehicleDetailsView.classList.add('hidden');
        return;
    }

    if (vehicleListView.classList.contains('hidden')) {
        vehicleGrid.classList.add('hidden');
    } else {
        vehicleGrid.classList.remove('hidden');
    }
}

function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
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

function createStatusBadge(status) {
    return createTextElement('span', status || 'N/A', `status-badge ${String(status).toLowerCase()}`);
}

function getVehicleName(vehicle) {
    return `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() || 'Vehicle';
}

function getLocationText(location) {
    if (!location) return 'N/A';
    return `${location.city}, ${location.state}`;
}

function getImageUrl(vehicle) {
    return vehicle.profileUrl || 'assets/home_car.png';
}

function getBookingButtonText(status) {
    if (status === 'AVAILABLE') return 'Book Now';
    if (status === 'BOOKED') return 'Booked';
    return 'Not Available';
}
