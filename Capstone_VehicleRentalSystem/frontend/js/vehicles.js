import { createBooking, getAllPublicVehicles, getAvailableVehiclesByDateRange, getFilteredVehicles, getVehicleById } from './api.js';

let vehicles = [], filteredVehicles = [], currentPage = 1, selectedVehicle = null;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  renderAuthHeader();
  bindEvents();
  vehicles = await getAllPublicVehicles() || [];
  filteredVehicles = [...vehicles];
  populateLocationDropdown();
  renderVehicleGrid();
  handlePendingBooking();
  if (location.hash.startsWith('#vehicle-')) showVehicleDetails(location.hash.replace('#vehicle-', ''));
}

function renderAuthHeader() {
  const token = localStorage.getItem('token'), email = localStorage.getItem('email');
  const authSection = document.getElementById('authSection');
  if (!authSection) return;
  authSection.innerHTML = !token ? `<a href="login.html" class="btn">Login</a><a href="signup.html" class="btn">Sign Up</a>` : 
    `<div class="user-menu"><div class="user-info"><span class="user-name">${email.split('@')[0]}</span><small class="user-email-inline">${email}</small></div><button class="logout-btn" onclick="logout()">Logout</button></div>`;
}

function bindEvents() {
  document.getElementById('searchVehiclesBtn').onclick = applyFilters;
  document.getElementById('resetFiltersBtn').onclick = resetFilters;
  document.getElementById('backToVehiclesBtn').onclick = () => showView('vehicleListView');
  document.getElementById('detailBookBtn').onclick = () => openBookingModal(selectedVehicle?.id);
  document.getElementById('confirmBookingBtn').onclick = confirmBooking;
  document.getElementById('cancelBookingBtn').onclick = closeBookingModal;
  document.getElementById('bookStart').onchange = updateBookingPrice;
  document.getElementById('bookEnd').onchange = updateBookingPrice;
  document.getElementById('closeBookedModalBtn').onclick = closeBookedModal;
  
  window.onclick = e => {
    if (e.target.id === 'bookingModal') closeBookingModal();
    if (e.target.id === 'vehicleBookedModal') closeBookedModal();
  };
  document.onkeydown = e => { if (e.key === 'Escape') { closeBookingModal(); closeBookedModal(); } };
}

function populateLocationDropdown() {
  const locations = [...new Map(vehicles.filter(v => v.location?.id).map(v => [v.location.id, v.location])).values()];
  const options = locations.map(l => `<option value="${l.id}">${l.city || l.id}</option>`).join('');
  document.getElementById('filterLocation').innerHTML = '<option value="">All Locations</option>' + options;
  document.getElementById('bookPickupLocation').innerHTML = '<option value="">Select Location</option>' + options;
}

function renderVehicleGrid() {
  const grid = document.getElementById('vehicleGrid');
  const start = (currentPage - 1) * 10;
  const items = filteredVehicles.slice(start, start + 10);
  
  if (!items.length) {
    document.getElementById('emptyState')?.classList.remove('hidden');
    grid.innerHTML = '';
    return;
  }
  
  document.getElementById('emptyState')?.classList.add('hidden');
  grid.innerHTML = items.map(v => {
    const available = v.status === 'AVAILABLE';
    return `
      <article class="vehicle-card">
        <div class="vehicle-card-header">
          <span class="status-badge ${v.status?.toLowerCase() || ''}">${v.status || 'N/A'}</span>
        </div>
        <img src="${v.profileUrl || 'assets/home_car.png'}" alt="${v.brand} ${v.model}" onerror="this.src='assets/home_car.png'">
        <div class="vehicle-card-content">
          <h3>${v.brand} ${v.model}</h3>
          <div class="vehicle-location">${v.type} - ${v.location?.city || 'N/A'}</div>
          <div class="vehicle-price">Rs ${v.dailyRentalRate || 0}/day</div>
          <div class="vehicle-card-actions">
            <button class="btn btn-secondary" onclick="showVehicleDetails('${v.id}')">View Details</button>
            <button class="btn btn-primary ${!available ? 'disabled' : ''}" ${!available ? 'disabled' : ''} 
                    onclick="${available ? `openBookingModal('${v.id}')` : ''}">
              ${available ? 'Book Now' : 'Not Available'}
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
  
  renderPagination();
}

function renderPagination() {
  const container = document.getElementById('pagination');
  const totalPages = Math.ceil(filteredVehicles.length / 10);
  if (totalPages <= 1) { container.innerHTML = ''; return; }
  
  container.innerHTML = Array.from({length: totalPages}, (_, i) => i + 1).map(i => 
    `<button class="btn ${i === currentPage ? 'btn-primary' : 'btn-secondary'}" onclick="goToPage(${i})">${i}</button>`
  ).join('');
}

async function showVehicleDetails(vehicleId) {
  try {
    selectedVehicle = await getVehicleById(vehicleId);
    const v = selectedVehicle;
    
    document.getElementById('detailVehicleName').textContent = `${v.brand} ${v.model}`;
    document.getElementById('detailVehiclePrice').textContent = `₹${v.dailyRentalRate || 0}/day`;
    document.getElementById('detailVehicleImage').src = v.profileUrl || 'assets/home_car.png';
    document.getElementById('detailVehicleStatus').className = `status-badge ${v.status?.toLowerCase() || ''}`;
    document.getElementById('detailVehicleStatus').textContent = v.status || 'N/A';
    
    document.getElementById('detailVehicleSpecs').innerHTML = [
      ['Type', v.type], ['Location', v.location?.city || 'N/A'], ['Registration', v.registrationNumber]
    ].map(([label, value]) => `<div class="spec-item"><strong>${label}</strong><span>${value || 'N/A'}</span></div>`).join('');
    
    const descContainer = document.getElementById('detailVehicleDesc');
    if (v.description) {
      document.getElementById('detailDescText').textContent = v.description;
      descContainer.classList.remove('hidden');
    } else {
      descContainer.classList.add('hidden');
    }
    
    const bookBtn = document.getElementById('detailBookBtn');
    bookBtn.disabled = v.status !== 'AVAILABLE';
    bookBtn.textContent = v.status === 'AVAILABLE' ? 'Book Now' : 'Not Available';
    
    showView('vehicleDetailsView');
  } catch (error) {
    showToast('Failed to load vehicle details', 'error');
  }
}

async function applyFilters() {
  const startDate = document.getElementById('filterStartDate').value;
  const endDate = document.getElementById('filterEndDate').value;
  const type = document.getElementById('filterType').value;
  const location = document.getElementById('filterLocation').value;
  
  try {
    if (startDate && endDate) {
      if (new Date(startDate) >= new Date(endDate)) {
        showToast('End date must be after start date', 'error');
        return;
      }
      filteredVehicles = await getAvailableVehiclesByDateRange(startDate, endDate, type, location) || [];
    } else {
      filteredVehicles = await getFilteredVehicles(type, '', location) || [];
    }
    currentPage = 1;
    renderVehicleGrid();
    showToast(`Found ${filteredVehicles.length} vehicle${filteredVehicles.length !== 1 ? 's' : ''}`, 'success');
  } catch (error) {
    showToast('Filter failed', 'error');
  }
}

function resetFilters() {
  ['filterStartDate', 'filterEndDate', 'filterType', 'filterLocation'].forEach(id => 
    document.getElementById(id).value = ''
  );
  filteredVehicles = [...vehicles];
  currentPage = 1;
  renderVehicleGrid();
  showToast('Filters cleared', 'info');
}

async function openBookingModal(vehicleId) {
  if (!localStorage.getItem('token')) {
    localStorage.setItem('pendingVehicleId', vehicleId);
    showToast('Please login to book a vehicle', 'info');
    setTimeout(() => location.href = 'login.html', 1500);
    return;
  }
  
  try {
    const vehicle = await getVehicleById(vehicleId);
    if (vehicle.status !== 'AVAILABLE') {
      showVehicleBookedModal(vehicle);
      return;
    }
    selectedVehicle = vehicle;
    clearBookingForm();
    document.getElementById('bookingModal').classList.add('show');
  } catch (error) {
    showToast('Failed to load vehicle details', 'error');
  }
}

function updateBookingPrice() {
  const startDate = document.getElementById('bookStart').value;
  const endDate = document.getElementById('bookEnd').value;
  
  if (startDate && endDate && selectedVehicle) {
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000);
    if (days > 0) {
      const total = days * (selectedVehicle.dailyRentalRate || 0);
      document.getElementById('pricePerDay').textContent = `₹${selectedVehicle.dailyRentalRate || 0}`;
      document.getElementById('totalDays').textContent = days;
      document.getElementById('totalAmount').textContent = `₹${total}`;
    }
  }
}

function clearBookingForm() {
  ['bookStart', 'bookEnd', 'bookPickupLocation', 'bookPayment'].forEach(id => 
    document.getElementById(id).value = ''
  );
  document.getElementById('pricePerDay').textContent = '₹0';
  document.getElementById('totalDays').textContent = '0';
  document.getElementById('totalAmount').textContent = '₹0';
  document.getElementById('bookingError').classList.add('hidden');
}

async function confirmBooking() {
  const data = ['bookStart', 'bookEnd', 'bookPickupLocation', 'bookPayment'].map(id => 
    document.getElementById(id).value
  );
  
  if (data.some(v => !v)) {
    showBookingError('All fields are required');
    return;
  }
  
  if (new Date(data[0]) >= new Date(data[1])) {
    showBookingError('End date must be after start date');
    return;
  }
  
  if (new Date(data[0]) < new Date()) {
    showBookingError('Start date cannot be in the past');
    return;
  }
  
  try {
    await createBooking({ 
      vehicleId: selectedVehicle.id, 
      startDate: data[0], 
      endDate: data[1], 
      paymentMethod: data[3] 
    });
    closeBookingModal();
    showToast('Booking successful! Redirecting to dashboard...', 'success');
    setTimeout(() => location.href = 'customer-dashboard.html', 2000);
  } catch (error) {
    showBookingError(error.message || 'Booking failed. Please try again.');
  }
}

function showVehicleBookedModal(vehicle) {
  document.getElementById('bookedVehicleName').textContent = `${vehicle.brand} ${vehicle.model}`;
  
  const available = vehicles.filter(v => v.id !== vehicle.id && v.status === 'AVAILABLE');
  const recommendations = [
    ...available.filter(v => v.type === vehicle.type),
    ...available.filter(v => Math.abs((v.dailyRentalRate || 0) - (vehicle.dailyRentalRate || 0)) <= 500)
  ].slice(0, 3);
  
  document.getElementById('recommendedVehicles').innerHTML = recommendations.length ? 
    recommendations.map(v => `
      <div class="recommendation-card">
        <img src="${v.profileUrl || 'assets/home_car.png'}" alt="${v.brand} ${v.model}" class="rec-image">
        <div class="rec-info">
          <h4>${v.brand} ${v.model}</h4>
          <p>${v.type} - ${v.location?.city || 'N/A'}</p>
          <p class="rec-price">Rs ${v.dailyRentalRate}/day</p>
          <button class="btn btn-primary btn-sm" onclick="bookRecommended('${v.id}')">Book This</button>
        </div>
      </div>
    `).join('') : '<div class="no-recommendations"><p>No similar vehicles available.</p></div>';
  
  document.getElementById('vehicleBookedModal').classList.add('show');
}

function closeBookingModal() {
  document.getElementById('bookingModal').classList.remove('show');
  clearBookingForm();
}

function closeBookedModal() {
  document.getElementById('vehicleBookedModal').classList.remove('show');
}

function showBookingError(message) {
  const errorElement = document.getElementById('bookingError');
  errorElement.textContent = message;
  errorElement.classList.remove('hidden');
}

function handlePendingBooking() {
  const pendingVehicleId = localStorage.getItem('pendingVehicleId');
  if (pendingVehicleId && localStorage.getItem('token')) {
    localStorage.removeItem('pendingVehicleId');
    showToast('Resuming your booking...', 'info');
    setTimeout(() => openBookingModal(pendingVehicleId), 1000);
  }
}

// Global functions
window.showVehicleDetails = showVehicleDetails;
window.openBookingModal = openBookingModal;
window.goToPage = (page) => { currentPage = page; renderVehicleGrid(); };
window.bookRecommended = (vehicleId) => { closeBookedModal(); openBookingModal(vehicleId); };
window.logout = () => { 
  ['token', 'email', 'role', 'pendingVehicleId'].forEach(k => localStorage.removeItem(k)); 
  location.href = 'index.html'; 
};

// Utilities
function showView(viewId) { 
  ['vehicleListView', 'vehicleDetailsView'].forEach(id => 
    document.getElementById(id)?.classList.toggle('hidden', id !== viewId)
  ); 
}

function showToast(msg, type = 'info') { 
  const t = document.getElementById('toast'); 
  if (t) { 
    t.textContent = msg; 
    t.className = `toast ${type} show`; 
    setTimeout(() => t.classList.remove('show'), 3000); 
  } 
}