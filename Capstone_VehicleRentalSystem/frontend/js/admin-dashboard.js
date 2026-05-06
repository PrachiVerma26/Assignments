import { getAdminVehicles, createVehicle, updateVehicle, deleteVehicleById, getAdminBookings } from './api.js';
let currentVehicleId, vehicles = [], bookings = [];

// Verify if the user is an admin and load the admin dashboard
document.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem('token') || localStorage.getItem('role') !== 'ADMIN') {
    window.location.href = 'login.html';
    return;
  }
  setupEvents();
  loadDashboard();
});

function setupEvents() {
  // Navigation
  document.querySelectorAll('.sidebar nav a[data-section]').forEach(link => {
    link.onclick = e => { e.preventDefault(); switchSection(link.dataset.section); };
  });

  // Profile dropdown
  document.getElementById('profileToggle').onclick = () => {
    document.getElementById('profileDropdown').classList.toggle('show');
  };

  // Event bindings - simplified
  const events = [
    ['logoutBtn', logout], ['addVehicleBtn', () => openVehicleModal()],
    ['vehicleForm', handleVehicleSubmit], ['cancelVehicleBtn', closeVehicleModal],
    ['resetFiltersBtn', resetFilters], ['vehicleSearch', filterVehicles],
    ['typeFilter', filterVehicles], ['statusFilter', filterVehicles], ['locationFilter', filterVehicles],
    ['viewAllVehiclesBtn', () => switchSection('vehicles')], ['viewAllBookingsBtn', () => switchSection('bookings')]
  ];
  
  events.forEach(([id, handler]) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(el.tagName === 'FORM' ? 'submit' : 'click', handler);
  });

  // Close dropdown on outside click
  document.onclick = e => {
    if (!document.getElementById('profileToggle')?.contains(e.target)) {
      document.getElementById('profileDropdown')?.classList.remove('show');
    }
  };

  // Modal close
  document.getElementById('vehicleModal').onclick = e => {
    if (e.target.id === 'vehicleModal') closeVehicleModal();
  };
}

function switchSection(section) {
  document.querySelectorAll('.dashboard-section').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar nav a[data-section]').forEach(l => {
    l.classList.toggle('active', l.dataset.section === section);
  });
  
  document.getElementById(`${section}Section`)?.classList.add('active');
  setText('sectionTitle', { dashboard: 'Dashboard', vehicles: 'Vehicles', bookings: 'Bookings' }[section]);

  if (section === 'vehicles') loadVehicles();
  else if (section === 'bookings') loadBookings();
}

function loadDashboard() {
  const email = localStorage.getItem('email') || 'admin@rapidrental.com';
  ['adminInitial', 'profileAvatar'].forEach(id => setText(id, 'A'));
  setText('adminName', 'Admin');
  setText('adminEmail', email);
  loadRecentContent();
}

async function loadRecentContent() {
  try {
    vehicles = await getAdminVehicles() || [];
    bookings = (await getAdminBookings() || []).sort((a, b) => new Date(b.createdAt || b.startDate || 0) - new Date(a.createdAt || a.startDate || 0));
    
    populateLocationFilter();
    renderRecentVehicles(vehicles.slice(0, 3));
    renderRecentBookings(bookings.slice(0, 3));
    setText('totalVehicles', vehicles.length);
    setText('totalBookings', bookings.length);
  } catch (error) {
    showToast('Error loading dashboard content', 'error');
  }
}

//load recent vehicles 
function renderRecentVehicles(list) {
  const container = document.getElementById('recentVehiclesList');
  container.innerHTML = list.length ? list.map(v => `
    <div class="recent-item">
      <div class="recent-info">
        <h4>${v.brand} ${v.model}</h4>
        <p>${v.type} - ${getLocationText(v.location)}</p>
      </div>
      <span class="status-badge ${v.status.toLowerCase()}">${v.status}</span>
    </div>
  `).join('') : '<div class="empty-state">No vehicles found</div>';
}

//rencent booking
function renderRecentBookings(list) {
  const container = document.getElementById('recentBookingsList');
  container.innerHTML = list.length ? list.map(b => `
    <div class="recent-item">
      <div class="recent-info">
        <h4>${b.vehicleBrand} ${b.vehicleModel}</h4>
        <p>${formatDate(b.startDate)} - ${formatDate(b.endDate)}</p>
      </div>
      <span class="status-badge ${b.status.toLowerCase()}">₹${b.totalPrice}</span>
    </div>
  `).join('') : '<div class="empty-state">No bookings found</div>';
}

//fetch vehicles
async function loadVehicles() {
  try {
    vehicles = await getAdminVehicles();
    populateLocationFilter();
    renderVehicles(vehicles);
  } catch (error) {
    showToast('Error loading vehicles', 'error');
  }
}

function populateLocationFilter() {
  const locations = [...new Map(vehicles.map(v => v.location?.id ? [v.location.id, v.location] : null).filter(Boolean)).values()];
  const options = locations.map(l => `<option value="${l.id}">${getLocationText(l)}</option>`).join('');
  
  ['locationFilter', 'locationId'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = (id === 'locationFilter' ? '<option value="">All Locations</option>' : '<option value="">Select Location</option>') + options;
  });
}

//load vehicles 
function renderVehicles(list) {
  const container = document.getElementById('vehicleList');
  container.innerHTML = list.length ? list.map(v => `
    <div class="vehicle-card">
      <div class="vehicle-card-header">
        <span class="status-badge ${v.status.toLowerCase()}">${v.status}</span>
      </div>
      <img src="${v.profileUrl}" alt="${v.brand} ${v.model}" onerror="this.src='assets/home_car.png'">
      <div class="vehicle-card-content">
        <h3>${v.brand} ${v.model}</h3>
        <div class="vehicle-location">${v.type} - ${getLocationText(v.location)}</div>
        <div class="vehicle-price">Rs ${v.dailyRentalRate}/day</div>
        <div class="vehicle-card-actions">
          <button class="btn btn-secondary" onclick="editVehicle('${v.id}')">Edit</button>
          <button class="btn btn-danger" onclick="deleteVehicle('${v.id}')">Delete</button>
        </div>
      </div>
    </div>
  `).join('') : '<div class="empty-state">No vehicles found</div>';
}

function filterVehicles() {
  const search = val('vehicleSearch').toLowerCase();
  const type = val('typeFilter');
  const status = val('statusFilter');
  const location = val('locationFilter');

  const filtered = vehicles.filter(v => {
    const matchesSearch = !search || [v.brand, v.model, v.type, getLocationText(v.location)].some(field => 
      field.toLowerCase().includes(search)
    );
    return matchesSearch && (!type || v.type === type) && (!status || v.status === status) && (!location || v.location?.id === location);
  });

  renderVehicles(filtered);
}

// reset function 
function resetFilters() {
  ['vehicleSearch', 'typeFilter', 'statusFilter', 'locationFilter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  renderVehicles(vehicles);
}

//add new vehicle form function
function openVehicleModal(vehicle = null) {
  currentVehicleId = vehicle?.id;
  const modal = document.getElementById('vehicleModal');
  const form = document.getElementById('vehicleForm');
  setText('modalTitle', vehicle ? 'Edit Vehicle' : 'Add Vehicle');
  if (vehicle) {
    ['brand', 'model', 'type', 'registrationNumber', 'description', 'status', 'dailyRentalRate', 'profileUrl'].forEach(field => {
      const el = document.getElementById(field);
      if (el) el.value = vehicle[field] || '';
    });
    document.getElementById('locationId').value = vehicle.location?.id || '';
  } else {
    form.reset();
  }
  modal.classList.add('show');
}

function closeVehicleModal() {
  document.getElementById('vehicleModal').classList.remove('show');
  currentVehicleId = null;
}

async function handleVehicleSubmit(e) {
  e.preventDefault();
  const formData = {
    brand: val('brand'), model: val('model'), type: val('type'),
    registrationNumber: val('registrationNumber'), description: val('description'),
    status: val('status'), dailyRentalRate: parseFloat(val('dailyRentalRate')),
    profileUrl: val('profileUrl'), locationId: val('locationId')
  };
  try {
    if (currentVehicleId) {
      await updateVehicle(currentVehicleId, formData);
      showToast('Vehicle updated successfully', 'success');
    } else {
      await createVehicle(formData);
      showToast('Vehicle created successfully', 'success');
    }
    closeVehicleModal();
    loadVehicles();
  } catch (error) {
    showToast(error.message || 'Error saving vehicle', 'error');
  }
}

window.editVehicle = id => {
  const vehicle = vehicles.find(v => v.id === id);
  if (vehicle) openVehicleModal(vehicle);
};

window.deleteVehicle = id => {
  if (confirm('Are you sure you want to delete this vehicle?')) {
    deleteVehicleById(id).then(() => {
      showToast('Vehicle deleted successfully', 'success');
      loadVehicles();
    }).catch(error => showToast(error.message || 'Error deleting vehicle', 'error'));
  }
};

//load all the existing vehicle bookings
async function loadBookings() {
  try {
    bookings = await getAdminBookings();
    renderBookings(bookings);
  } catch (error) {
    showToast('Error loading bookings', 'error');
  }
}

function renderBookings(list) {
  const container = document.getElementById('bookingsSection');
  container.innerHTML = list.length ? `
    <div class="bookings-list">
      ${list.map(b => `
        <div class="booking-card">
          <div class="booking-info">
            <h3>${b.vehicleBrand} ${b.vehicleModel}</h3>
            <p><strong>Dates:</strong> ${formatDate(b.startDate)} - ${formatDate(b.endDate)}</p>
            <p><strong>Location:</strong> ${getLocationText(b.location)}</p>
            <p><strong>Payment:</strong> ${b.paymentMethod}</p>
          </div>
          <div class="booking-meta">
            <div class="booking-price">Rs ${b.totalPrice}</div>
            <span class="status-badge ${b.status.toLowerCase()}">${b.status}</span>
          </div>
        </div>
      `).join('')}
    </div>
  ` : '<div class="empty-state">No bookings found</div>';
}

// Utilities - consolidated to avoid duplication
function formatDate(d) { 
  return new Date(d).toLocaleDateString('en-IN'); 
}
function getLocationText(l) { 
  return !l ? 'N/A' : typeof l === 'string' ? l : `${l.city || ''}, ${l.state || ''}`.replace(/^,\s*|,\s*$/g, '') || 'N/A'; }
function logout() {
   ['token', 'email', 'role'].forEach(k => localStorage.removeItem(k));
    window.location.href = 'index.html'; 
  }
function showToast(msg, type = 'info') {
   const t = document.getElementById('toast'); 
   if (t) { t.textContent = msg; t.className = `toast ${type} show`;
    setTimeout(() => t.classList.remove('show'), 3000); } }
function setText(id, text) { 
  const el = document.getElementById(id); if (el) el.textContent = text;
 }
function val(id) { 
  const el = document.getElementById(id); return el ? el.value : ''; 
}