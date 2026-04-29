import {
    getUserProfile, updateUserProfile,
    getUserBookings, cancelBooking,
    getAllPublicVehicles, getLocations,
    createBooking, getVehicleById,
    getAvailableVehiclesByDateRange
} from './api.js';

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

/* init */
document.addEventListener('DOMContentLoaded', async () => {
    guardAuth();
    setupNav();
    await Promise.all([loadProfile(), loadLocations(), loadVehicles(), loadBookings()]);
    renderDashboard();
});

function guardAuth() {
    if (!localStorage.getItem('token')) {
        window.location.href = 'login.html';
    }
}

/*login */
function setupNav() {
    document.querySelectorAll('.sidebar nav a[data-section]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            switchSection(link.dataset.section);
        });
    });

    document.querySelector('.menu-icon')?.addEventListener('click', () => {
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    });

    document.getElementById('profileToggle')?.addEventListener('click', () => {
        document.getElementById('profileDropdown')?.classList.toggle('active');
    });

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('role');
        window.location.href = 'index.html';
    };
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    document.getElementById('logoutLink')?.addEventListener('click', e => { e.preventDefault(); logout(); });

    // Modal close handlers
    window.addEventListener('click', e => {
        const modal = document.getElementById('bookingModal');
        if (e.target === modal) closeModals();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModals();
    });
}

window.switchSection = function(section) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
    // Show target section
    document.getElementById(`${section}Section`)?.classList.add('active');
    // Update sidebar active state
    document.querySelectorAll('.sidebar nav a[data-section]').forEach(link => {
        link.classList.toggle('active', link.dataset.section === section);
    });

    // Update title
    const titles = { 
        dashboard: 'Dashboard', 
        browse: 'Browse Vehicles', 
        bookings: 'My Bookings', 
        profile: 'Profile',
        vehicleDetails: 'Vehicle Details'
    };
    document.getElementById('sectionTitle').textContent = titles[section] || '';

    // Load section-specific data
    if (section === 'bookings') renderAllBookings();
    if (section === 'browse') renderBrowseGrid();
    
    // Store previous section for back navigation
    if (section !== 'vehicleDetails') {
        state.previousSection = section;
    }
};

/*profile*/
async function loadProfile() {
    try {
        const p = await getUserProfile();
        const name = p.name || 'User';
        const initial = name.charAt(0).toUpperCase();
        document.getElementById('welcomeMsg').textContent = `Welcome, ${name}`;
        document.getElementById('userInitial').textContent = initial;
        document.getElementById('dropdownAvatar').textContent = initial;
        document.getElementById('dropdownName').textContent = name;
        document.getElementById('dropdownEmail').textContent = p.email || '';
        document.getElementById('pName').textContent = p.name || '—';
        document.getElementById('pEmail').textContent = p.email || '—';
        document.getElementById('pPhone').textContent = p.phoneNumber || '—';
        document.getElementById('pLicense').textContent = p.drivingLicenseNumber || '—';
        document.getElementById('editName').value = p.name || '';
        document.getElementById('editPhone').value = p.phoneNumber || '';
        document.getElementById('editAddress').value = p.address || '';
        document.getElementById('editLicense').value = p.drivingLicenseNumber || '';
    } catch (err) {
        console.error('Profile load failed:', err);
    }
}

window.enterEditProfile = () => {
    document.getElementById('profileView').style.display = 'none';
    document.getElementById('profileEdit').style.display = 'block';
};

window.cancelEditProfile = () => {
    document.getElementById('profileView').style.display = 'block';
    document.getElementById('profileEdit').style.display = 'none';
    clearFieldErrors();
};

window.saveProfile = async () => {
    clearFieldErrors();
    
    const name = document.getElementById('editName').value.trim();
    const phone = document.getElementById('editPhone').value.trim();
    const address = document.getElementById('editAddress').value.trim();
    const license = document.getElementById('editLicense').value.trim();
    
    let hasErrors = false;

    // Validation
    if (!name || name.length < 3 || name.length > 50) {
        showFieldError('editName', 'nameError', 'Name must be 3-50 characters');
        hasErrors = true;
    }
    if (!phone || !/^[0-9]{10}$/.test(phone)) {
        showFieldError('editPhone', 'phoneError', 'Phone must be exactly 10 digits');
        hasErrors = true;
    }
    if (!address) {
        showFieldError('editAddress', 'addressError', 'Address is required');
        hasErrors = true;
    }
    if (!license || !license.startsWith('DL') || license.length !== 16) {
        showFieldError('editLicense', 'licenseError', 'License must start with "DL" and be exactly 16 characters');
        hasErrors = true;
    }
    if (hasErrors) return;
    try {
        await updateUserProfile({ name, phoneNumber: phone, address, drivingLicenseNumber: license });
        showToast('Profile updated successfully', 'success');
        await loadProfile();
        cancelEditProfile();
    } catch (err) {
        showToast(err.message || 'Update failed', 'error');
    }
};

/*locations*/
async function loadLocations() {
    try {
        const locations = await getLocations();
        const opts = locations.map(l => `<option value="${l.id}">${l.city}, ${l.state}</option>`).join('');
        document.getElementById('searchLocation').innerHTML += opts;
        document.getElementById('browseLocation').innerHTML += opts;
    } catch (err) {
        console.error('Locations load failed:', err);
    }
}

/* vehicles */
async function loadVehicles() {
    try {
        state.allVehicles = await getAllPublicVehicles() || [];
        state.filteredVehicles = [...state.allVehicles];
    } catch (err) {
        console.error('Vehicles load failed:', err);
    }
}

function getImageUrl(v) {
    return v.profileUrl || 'assets/home_car.png';
}

function vehicleCardHtml(v, compact = false) {
    const name = `${v.brand || ''} ${v.model || ''}`.trim();
    const available = v.status === 'AVAILABLE';
    const buttonText = available ? 'Book Now' : 'Not Available';
    const location = v.location ? `${v.location.city}, ${v.location.state}` : 'N/A';
    
    return `
        <div class="vehicle-card">
            <div class="vehicle-card-header">
                <span class="status-badge ${v.status?.toLowerCase()}">${v.status}</span>
            </div>
            <img src="${getImageUrl(v)}" onerror="this.src='assets/home_car.png'" alt="${name}">
            <div class="vehicle-card-content">
                <h3>${name}</h3>
                <div class="vehicle-location">${location}</div>
                <div class="vehicle-price">₹${v.dailyRentalRate || 0}/day</div>
                <div class="vehicle-card-actions">
                    <button class="btn btn-secondary" onclick="viewVehicleDetails('${v.id}')">View Details</button>
                    <button class="btn btn-primary" ${!available ? 'disabled' : ''} onclick="bookNow('${v.id}')">${buttonText}</button>
                </div>
            </div>
        </div>`;
}

/*dashboard badge*/
function renderDashboard() {
    const recent = state.bookings.slice(0, 4);

    if (recent.length > 0) {
        document.getElementById('recentBookingsWrap').style.display = 'block';
        document.getElementById('emptyBookingState').style.display = 'none';
        document.getElementById('recentBookingsBody').innerHTML = recent.map(bookingRowHtml).join('');
        attachCancelListeners('recentBookingsBody');
    } else {
        document.getElementById('recentBookingsWrap').style.display = 'none';
        document.getElementById('emptyBookingState').style.display = 'block';
    }
    const recommended = state.allVehicles.filter(v => v.status === 'AVAILABLE').slice(0, 4);
    document.getElementById('recommendedGrid').innerHTML = recommended.map(v => vehicleCardHtml(v, true)).join('');
}

/* search functionality */
window.searchVehicles = async () => {
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
        switchSection('browse');
        state.filteredVehicles = searchResults || [];
        state.currentPage = 1;
        renderBrowseGrid();
        
        if (state.filteredVehicles.length === 0) {
            showToast('No vehicles available for selected criteria', 'info');
        } else {
            showToast(`Found ${state.filteredVehicles.length} available vehicles`, 'success');
        }
    } catch (err) {
        console.error('Search failed:', err);
        showToast(err.message || 'Search failed', 'error');
    }
};

/*booking */
async function loadBookings() {
    try {
        state.bookings = await getUserBookings() || [];
    } catch (err) {
        console.error('Bookings load failed:', err);
    }
}

function bookingRowHtml(b) {
    const vehicle = `${b.vehicleBrand || ''} ${b.vehicleModel || ''}`.trim() || 'Vehicle';
    const start = b.startDate ? new Date(b.startDate).toLocaleDateString() : '—';
    const end = b.endDate ? new Date(b.endDate).toLocaleDateString() : '—';
    const amount = b.totalPrice ? `₹${b.totalPrice}` : '—';
    
    let actionHtml = '—';
    if (b.status === 'CONFIRMED') {
        actionHtml = `<button class="action-btn cancel" data-id="${b.id}">Cancel</button>`;
    } else if (b.status === 'COMPLETED' || b.status === 'CANCELLED') {
        actionHtml = `<button class="action-btn view" onclick="viewBookingDetails('${b.id}')">View</button>`;
    }
    
    return `
        <tr>
            <td><strong>${vehicle}</strong></td>
            <td>${start}</td>
            <td>${end}</td>
            <td><strong>${amount}</strong></td>
            <td><span class="status-badge ${b.status?.toLowerCase()}">${b.status}</span></td>
            <td>${actionHtml}</td>
        </tr>`;
}

function renderAllBookings() {
    const tbody = document.getElementById('allBookingsBody');
    const empty = document.getElementById('bookingsEmpty');
    if (!state.bookings.length) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';
    tbody.innerHTML = state.bookings.map(bookingRowHtml).join('');
    attachCancelListeners('allBookingsBody');
}

function attachCancelListeners(tbodyId) {
    document.getElementById(tbodyId)?.querySelectorAll('.action-btn.cancel').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm('Cancel this booking?')) return;
            try {
                await cancelBooking(btn.dataset.id);
                showToast('Booking cancelled successfully', 'success');
                await loadBookings();
                renderDashboard();
                if (tbodyId === 'allBookingsBody') renderAllBookings();
            } catch (err) {
                showToast(err.message || 'Cancel failed', 'error');
            }
        });
    });
}

// Add view booking details function
window.viewBookingDetails = (bookingId) => {
    // For now, just show a toast - can be expanded later
    showToast('Booking details view - Feature coming soon', 'info');
};

/*browse*/
function renderBrowseGrid() {
    const start = (state.currentPage - 1) * ITEMS_PER_PAGE;
    const page = state.filteredVehicles.slice(start, start + ITEMS_PER_PAGE);
    document.getElementById('browseGrid').innerHTML = page.map(v => vehicleCardHtml(v)).join('');
    renderPagination();
}

function renderPagination() {
    const total = Math.ceil(state.filteredVehicles.length / ITEMS_PER_PAGE);
    document.getElementById('browsePagination').innerHTML = Array.from({ length: total }, (_, i) =>
        `<button class="btn ${i + 1 === state.currentPage ? 'btn-primary' : 'btn-secondary'}" onclick="changePage(${i + 1})">${i + 1}</button>`
    ).join('');
}

window.changePage = (page) => {
    state.currentPage = page;
    renderBrowseGrid();
};

window.applyBrowseFilters = () => {
    const type = document.getElementById('browseType').value;
    const loc = document.getElementById('browseLocation').value;
    const status = document.getElementById('browseStatus').value;

    state.filteredVehicles = state.allVehicles.filter(v =>
        (!type || v.type === type) &&
        (!loc || v.location?.id === loc) &&
        (!status || v.status === status)
    );
    state.currentPage = 1;
    renderBrowseGrid();
};

window.resetBrowseFilters = () => {
    document.getElementById('browseType').value = '';
    document.getElementById('browseLocation').value = '';
    document.getElementById('browseStatus').value = '';
    state.filteredVehicles = [...state.allVehicles];
    state.currentPage = 1;
    renderBrowseGrid();
};

/*vehicle detaisl */
window.viewVehicleDetails = async (id) => {
    try {
        const vehicle = await getVehicleById(id);
        state.currentVehicle = vehicle;
        
        // Populate vehicle details
        const name = `${vehicle.brand} ${vehicle.model}`;
        document.getElementById('vehicleDetailImage').src = getImageUrl(vehicle);
    document.getElementById('vehicleDetailName').textContent = name;
        document.getElementById('vehicleDetailPrice').textContent = `₹${vehicle.dailyRentalRate}/day`;
        
        const statusEl = document.getElementById('vehicleDetailStatus');
        statusEl.textContent = vehicle.status;
        statusEl.className = `status ${vehicle.status?.toLowerCase()}`;
        
        document.getElementById('vehicleDetailType').textContent = vehicle.type || 'N/A';
        document.getElementById('vehicleDetailLocation').textContent = 
            vehicle.location ? `${vehicle.location.city}, ${vehicle.location.state}` : 'N/A';
        
        // Registration (optional)
        const regRow = document.getElementById('vehicleRegRow');
        if (vehicle.registrationNumber) {
            document.getElementById('vehicleDetailReg').textContent = vehicle.registrationNumber;
            regRow.style.display = 'block';
        } else {
            regRow.style.display = 'none';
        }
        
        // Description (optional)
        const descEl = document.getElementById('vehicleDetailDesc');
        if (vehicle.description) {
            document.getElementById('vehicleDescText').textContent = vehicle.description;
            descEl.style.display = 'block';
        } else {
            descEl.style.display = 'none';
        }
        
        // Book button state
        const bookBtn = document.getElementById('vehicleDetailBookBtn');
        const available = vehicle.status === 'AVAILABLE';
        bookBtn.disabled = !available;
        bookBtn.textContent = available ? 'Book Now' : 'Not Available';
        
        switchSection('vehicleDetails');
    } catch (err) {
        showToast(err.message || 'Failed to load vehicle details', 'error');
    }
};

window.goBackToVehicles = () => {
    switchSection(state.previousSection);
};

window.bookVehicleFromDetails = () => {
    if (state.currentVehicle) {
        bookNow(state.currentVehicle.id);
    }
};

/* ── BOOKING MODAL ── */
window.bookNow = (vehicleId) => {
    if (!localStorage.getItem('token')) {
        localStorage.setItem('pendingVehicleId', vehicleId);
        window.location.href = 'login.html';
        return;
    }
    state.selectedVehicleId = vehicleId;
    document.getElementById('bookStart').value = '';
    document.getElementById('bookEnd').value = '';
    document.getElementById('bookPayment').value = '';
    document.getElementById('bookingError').style.display = 'none';
    document.getElementById('bookingModal').classList.add('show');
};

window.confirmBooking = async () => {
    const startDate = document.getElementById('bookStart').value;
    const endDate = document.getElementById('bookEnd').value;
    const paymentMethod = document.getElementById('bookPayment').value;
    const errEl = document.getElementById('bookingError');

    if (!startDate || !endDate || !paymentMethod) {
        showError(errEl, 'All fields are required.');
        return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
        showError(errEl, 'End date must be after start date.');
        return;
    }

    try {
        await createBooking({
            vehicleId: state.selectedVehicleId,
            startDate: startDate,
            endDate: endDate,
            paymentMethod: paymentMethod
        });
        
        closeModals();
        showToast('Booking Successful 🎉', 'success');
        setTimeout(() => showToast('Payment Successful. Booking Confirmed', 'success'), 1500);
        
        await loadBookings();
        renderDashboard();
        switchSection('bookings');
    } catch (err) {
        showError(errEl, err.message || 'Booking failed.');
    }
};

window.closeModals = () => {
    document.getElementById('bookingModal').classList.remove('show');
};

/* utility functions */
function showFieldError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    input.classList.add('error');
    error.textContent = message;
}

function clearFieldErrors() {
    document.querySelectorAll('.form-input').forEach(input => {
        input.classList.remove('error');
    });
    document.querySelectorAll('.field-error').forEach(error => {
        error.textContent = '';
    });
}

function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Handle pending vehicle booking after login
if (localStorage.getItem('pendingVehicleId')) {
    const vehicleId = localStorage.getItem('pendingVehicleId');
    localStorage.removeItem('pendingVehicleId');
    setTimeout(() => bookNow(vehicleId), 1000);
}