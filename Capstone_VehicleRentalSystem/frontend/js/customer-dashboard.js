import { cancelBooking, getAllPublicVehicles, getUserBookings, getUserProfile, updateUserProfile } from './api.js';

const state = { bookings: [], profile: null, vehicles: [] };

document.addEventListener('DOMContentLoaded', async () => {
  if (!localStorage.getItem('token')) { window.location.href = 'login.html'; return; }
  setupEvents();
  await loadInitialData();
  renderDashboardContent();
});

function setupEvents() {
  document.querySelectorAll('.sidebar nav a[data-section]').forEach(link => {
    link.onclick = e => { e.preventDefault(); switchSection(link.dataset.section); };
  });

  document.getElementById('profileToggle')?.addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('profileDropdown')?.classList.toggle('show');
  });

  document.onclick = () => document.getElementById('profileDropdown')?.classList.remove('show');
  
  ['logoutBtn', 'logoutLink'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', e => { e.preventDefault(); logout(); });
  });
}

function switchSection(section) {
  document.querySelectorAll('.sidebar nav a[data-section]').forEach(link => {
    link.classList.toggle('active', link.dataset.section === section);
  });

  setText('sectionTitle', { dashboard: 'Dashboard', bookings: 'My Bookings', profile: 'Profile' }[section] || 'Dashboard');

  if (section === 'bookings') renderBookingsContent();
  else if (section === 'profile') renderProfileContent();
  else renderDashboardContent();
}

async function loadInitialData() {
  try {
    const [profile, bookings, vehicles] = await Promise.all([getUserProfile(), getUserBookings(), getAllPublicVehicles()]);
    state.profile = profile;
    state.bookings = (bookings || []).sort((a, b) => new Date(b.createdAt || b.startDate || 0) - new Date(a.createdAt || a.startDate || 0));
    state.vehicles = vehicles || [];
    populateProfileData(profile);
  } catch (error) {
    showToast('Failed to load dashboard data', 'error');
  }
}

function populateProfileData(profile) {
  const name = profile.name || 'User', initial = name.charAt(0).toUpperCase();
  setText('welcomeMsg', `Welcome, ${name}`);
  ['userInitial', 'dropdownAvatar'].forEach(id => setText(id, initial));
  setText('dropdownName', name);
  setText('dropdownEmail', profile.email || '');
}

function renderDashboardContent() {
  const contentArea = document.getElementById('content-area');
  const isFirstTimeUser = state.bookings.length === 0;

  contentArea.innerHTML = `
    <div class="dashboard-overview">
      ${isFirstTimeUser ? `
        <div class="search-section">
          <h2>Find Your Perfect Ride</h2>
          <p>Browse our collection of vehicles for your next adventure</p>
          <button class="btn btn-primary js-browse-link">Browse Vehicles</button>
        </div>` : ''}

      <div class="bookings-section">
        <div class="section-heading">
          <h3>Recent Bookings</h3>
          <button class="btn btn-secondary" id="viewAllBookingsBtn">View All</button>
        </div>
        <div id="recentBookingsContainer"></div>
      </div>

      <div class="vehicles-section">
        <div class="section-heading">
          <h3>Available Vehicles</h3>
          <button class="btn btn-secondary js-browse-link">View All Vehicles</button>
        </div>
        <div class="mini-vehicle-grid" id="dashboardVehicles"></div>
      </div>
    </div>
  `;

  renderRecentBookings();
  renderDashboardVehicles();
  bindDashboardActions();
}

function bindDashboardActions() {
  document.querySelectorAll('.js-browse-link').forEach(btn => btn.onclick = () => window.location.href = 'vehicles.html');
  document.getElementById('viewAllBookingsBtn')?.addEventListener('click', () => switchSection('bookings'));
}

function renderRecentBookings() {
  const container = document.getElementById('recentBookingsContainer');
  if (!container) return;

  const recentBookings = state.bookings.slice(0, 4);
  container.innerHTML = recentBookings.length ? createBookingTable(recentBookings) : '<div class="empty-state">No bookings yet. Start exploring!</div>';
  
  if (recentBookings.length > 0) bindCancelButtons();
}

function renderDashboardVehicles() {
  const grid = document.getElementById('dashboardVehicles');
  if (!grid) return;

  const vehicles = state.vehicles.filter(v => v.status === 'AVAILABLE').slice(0, 3);
  
  grid.innerHTML = vehicles.length ? vehicles.map(v => `
    <article class="mini-vehicle-card">
      <img src="${v.profileUrl || 'assets/home_car.png'}" alt="${getVehicleName(v)}" onerror="this.src='assets/home_car.png'">
      <div>
        <h4>${getVehicleName(v)}</h4>
        <p>${getLocationText(v.location)}</p>
        <strong>Rs ${v.dailyRentalRate || 0}/day</strong>
      </div>
    </article>
  `).join('') : '<div class="empty-state">No available vehicles found.</div>';
}

function renderBookingsContent() {
  const contentArea = document.getElementById('content-area');
  contentArea.innerHTML = state.bookings.length ? createBookingTable(state.bookings) : '<div class="empty-state">No bookings found.</div>';
  bindCancelButtons();
}

function createBookingTable(bookings) {
  return `
    <div class="table-wrap">
      <table class="booking-table">
        <thead>
          <tr><th>Vehicle</th><th>Start</th><th>End</th><th>Amount</th><th>Status</th><th>Action</th></tr>
        </thead>
        <tbody>
          ${bookings.map(b => {
            const canCancel = b.status === 'CONFIRMED' || b.status === 'PENDING';
            const vehicleName = `${b.vehicleBrand || ''} ${b.vehicleModel || ''}`.trim() || 'Vehicle';
            
            return `
              <tr>
                <td><strong>${vehicleName}</strong></td>
                <td>${formatDate(b.startDate)}</td>
                <td>${formatDate(b.endDate)}</td>
                <td><strong>Rs ${b.totalPrice || 0}</strong></td>
                <td><span class="status-badge ${(b.status || '').toLowerCase()}">${b.status}</span></td>
                <td>
                  ${canCancel ? `<button class="action-btn cancel" data-booking-id="${b.id}">Cancel</button>` : 
                    `<button class="action-btn view" data-booking-id="${b.id}" data-vehicle-id="${b.vehicleId}">View</button>`}
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function bindCancelButtons() {
  document.querySelectorAll('[data-booking-id]').forEach(btn => {
    const bookingId = btn.dataset.bookingId;
    btn.onclick = e => {
      e.preventDefault();
      if (btn.classList.contains('cancel')) {
        cancelSelectedBooking(bookingId);
      } else if (btn.classList.contains('view')) {
        const vehicleId = btn.dataset.vehicleId;
        if (vehicleId) window.location.href = `vehicles.html#vehicle-${vehicleId}`;
      }
    };
  });
}

function renderProfileContent() {
  const contentArea = document.getElementById('content-area');
  const profile = state.profile || {};

  contentArea.innerHTML = `
    <div class="profile-card profile-full-width">
      <div id="profileView">
        <div class="profile-grid">
          ${['Name', 'Email', 'Phone', 'Address', 'Driving License'].map(label => 
            `<div class="profile-item"><label>${label}</label><span>${profile[label === 'Phone' ? 'phoneNumber' : label === 'Driving License' ? 'drivingLicenseNumber' : label.toLowerCase()] || '-'}</span></div>`
          ).join('')}
        </div>
      </div>
      <div id="profileEdit" class="hidden">
        <div class="form-grid">
          ${[['Name', 'editName', profile.name], ['Phone', 'editPhone', profile.phoneNumber], ['Address', 'editAddress', profile.address], ['Driving License', 'editLicense', profile.drivingLicenseNumber]].map(([label, id, value]) => 
            `<div class="form-group"><label>${label}</label><input type="text" id="${id}" class="form-input" value="${value || ''}"></div>`
          ).join('')}
        </div>
        <div class="profile-actions">
          <button class="btn btn-primary" id="saveProfileBtn">Save</button>
          <button class="btn btn-secondary" id="cancelEditProfileBtn">Cancel</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('saveProfileBtn')?.addEventListener('click', saveProfile);
  document.getElementById('cancelEditProfileBtn')?.addEventListener('click', () => {
    document.getElementById('profileView')?.classList.remove('hidden');
    document.getElementById('profileEdit')?.classList.add('hidden');
  });
}

async function saveProfile() {
  const formData = {
    name: val('editName').trim(),
    phoneNumber: val('editPhone').trim(),
    address: val('editAddress').trim(),
    drivingLicenseNumber: val('editLicense').trim()
  };

  if (!formData.name || !formData.phoneNumber || !formData.address || !formData.drivingLicenseNumber) {
    showToast('Please fill all fields', 'error');
    return;
  }

  try {
    await updateUserProfile(formData);
    showToast('Profile updated successfully', 'success');
    await loadInitialData();
    renderProfileContent();
  } catch (error) {
    showToast(error.message || 'Profile update failed', 'error');
  }
}

async function cancelSelectedBooking(bookingId) {
  if (!bookingId || !confirm('Are you sure you want to cancel this booking?')) return;

  try {
    await cancelBooking(bookingId);
    showToast('Booking cancelled successfully', 'success');
    await loadInitialData();
    const activeSection = document.querySelector('.sidebar nav a.active')?.dataset.section || 'dashboard';
    if (activeSection === 'bookings') renderBookingsContent();
    else renderDashboardContent();
  } catch (error) {
    showToast(error.message || 'Failed to cancel booking', 'error');
  }
}

// Utilities - consolidated
function getVehicleName(v) { return `${v.brand || ''} ${v.model || ''}`.trim() || 'Vehicle'; }
function getLocationText(l) { return !l ? 'N/A' : typeof l === 'string' ? l : `${l.city || ''}, ${l.state || ''}`.replace(/^,\s*|,\s*$/g, '') || 'N/A'; }
function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-IN') : '-'; }
function showToast(msg, type = 'info') { const t = document.getElementById('toast'); if (t) { t.textContent = msg; t.className = `toast ${type} show`; setTimeout(() => t.classList.remove('show'), 3000); } }
function setText(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }
function val(id) { const el = document.getElementById(id); return el ? el.value : ''; }
function logout() { ['token', 'email', 'role', 'pendingVehicleId'].forEach(k => localStorage.removeItem(k)); window.location.href = 'index.html'; }