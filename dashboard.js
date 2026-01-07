// ==================== dashboard.js FINAL VERSION ====================

// ==================== USER PREFERENCES ====================
let userPreferences = {
    refreshInterval: 30000,
    theme: 'light',
    currency: 'IDR',
    alertsEnabled: true
};

// Load preferences from localStorage
function loadPreferences() {
    const saved = localStorage.getItem('daesacorp_preferences');
    if (saved) {
        userPreferences = { ...userPreferences, ...JSON.parse(saved) };
        
        // Apply preferences
        currentCurrency = userPreferences.currency;
        document.getElementById('currencySelect').value = currentCurrency;
        applyTheme(userPreferences.theme);
    }
}

// Save preferences to localStorage
function savePreferences() {
    localStorage.setItem('daesacorp_preferences', JSON.stringify(userPreferences));
}

// Apply theme
function applyTheme(theme) {
    document.body.className = theme + '-theme';
}

// ==================== UPDATE MAIN FUNCTION ====================
async function updateDashboard() {
    console.log(`Updating dashboard with ${currentCurrency} currency...`);
    
    try {
        // Update exchange rates first
        await updateCurrencyRates();
        
        // Update all components
        await Promise.all([
            updateOverviewCards(),
            updateRealtimeEvents(),
            updatePlatformStatus(),
            updateCharts()
        ]);
        
        // Update currency display
        updateCurrencyDisplay();
        
        // Check for alerts if notifications system is available
        if (window.NotificationSystem && userPreferences.alertsEnabled) {
            const dashboardData = {
                revenueChange: Math.random() * 40 - 20, // Simulate -20% to +20% change
                conversionRate: 3.2 + (Math.random() * 2 - 1),
                platformStatus: Math.random() > 0.7 ? 'Poor' : 'Good'
            };
            window.NotificationSystem.checkAlerts(dashboardData);
        }
        
        console.log('Dashboard update complete');
        
    } catch (err) {
        console.error('Dashboard update error:', err);
        if (window.NotificationSystem) {
            window.NotificationSystem.showNotification('Failed to update dashboard data', 'error');
        }
    }
}


// Enhanced Dashboard dengan Charts, Multi-Currency, dan Export Features

// Global variables
const API_BASE = window.location.origin.includes('localhost') 
    ? 'http://localhost:3002/api' 
    : '/.netlify/functions/api';

let currentCurrency = 'IDR';
let exchangeRates = { 
    IDR: 1, 
    USD: 15500,   // 1 USD = 15,500 IDR
    EUR: 16800,   // 1 EUR = 16,800 IDR
    SGD: 11500    // 1 SGD = 11,500 IDR
};

// Chart instances
let revenueChart = null;
let platformChart = null;

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format currency berdasarkan mata uang yang dipilih
 */
function formatCurrency(amount, currency = currentCurrency) {
    // Handle invalid amount
    if (typeof amount !== 'number' || isNaN(amount)) {
        amount = 0;
    }
    
    let convertedAmount = amount;
    
    // Convert jika bukan IDR
    if (currency !== 'IDR' && exchangeRates[currency]) {
        convertedAmount = amount / exchangeRates[currency];
    }
    
    // Format berdasarkan currency
    const formatter = new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: currency === 'IDR' ? 0 : 2,
        maximumFractionDigits: currency === 'IDR' ? 0 : 2
    });
    
    return formatter.format(convertedAmount);
}

/**
 * Format angka dengan separator ribuan
 */
function formatNumber(num) {
    return new Intl.NumberFormat('id-ID').format(num);
}

/**
 * Format persentase
 */
function formatPercentage(num) {
    return num.toFixed(1) + '%';
}

// ==================== CHART FUNCTIONS ====================

/**
 * Initialize Chart.js charts
 */
function initializeCharts() {
    // 1. REVENUE TREND CHART (Line Chart)
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        revenueChart = new Chart(revenueCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Revenue',
                    data: [],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#3498db',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Revenue: ${formatCurrency(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    // 2. PLATFORM COMPARISON CHART (Bar Chart)
    const platformCtx = document.getElementById('platformChart');
    if (platformCtx) {
        platformChart = new Chart(platformCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Revenue',
                    data: [],
                    backgroundColor: [
                        '#3498db',  // Facebook - Blue
                        '#2ecc71',  // Google - Green
                        '#e74c3c',  // TikTok - Red
                        '#f39c12'   // Instagram - Orange
                    ],
                    borderWidth: 0,
                    borderRadius: 5,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Revenue: ${formatCurrency(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    console.log('Charts initialized');
}

/**
 * Update charts with new data
 */
async function updateCharts() {
    try {
        // 1. Fetch and update Revenue Trend Chart
        const historicalRes = await fetch(`${API_BASE}/historical/daily`);
        if (!historicalRes.ok) throw new Error('Historical data fetch failed');
        
        const historicalData = await historicalRes.json();
        
        if (revenueChart && Array.isArray(historicalData)) {
            revenueChart.data.labels = historicalData.map(d => {
                const date = new Date(d.date);
                return date.toLocaleDateString('en-US', { weekday: 'short' });
            });
            revenueChart.data.datasets[0].data = historicalData.map(d => d.revenue);
            revenueChart.update('none'); // 'none' untuk animasi smooth
        }
        
        // 2. Fetch and update Platform Comparison Chart
        const platformRes = await fetch(`${API_BASE}/platforms/comparison`);
        if (!platformRes.ok) throw new Error('Platform data fetch failed');
        
        const platformData = await platformRes.json();
        
        if (platformChart && Array.isArray(platformData)) {
            platformChart.data.labels = platformData.map(p => p.name);
            platformChart.data.datasets[0].data = platformData.map(p => p.revenue);
            platformChart.update('none');
        }
        
    } catch (err) {
        console.error('Error updating charts:', err);
    }
}

// ==================== CURRENCY FUNCTIONS ====================

/**
 * Fetch latest exchange rates
 */
async function updateCurrencyRates() {
    try {
        const response = await fetch(`${API_BASE}/currency/rates`);
        if (response.ok) {
            const data = await response.json();
            if (data.rates) {
                exchangeRates = data.rates;
            }
        }
    } catch (err) {
        console.log('Using default exchange rates:', err.message);
    }
}

/**
 * Update UI when currency changes
 */
function updateCurrencyDisplay() {
    // Add currency class to all value elements
    const valueElements = document.querySelectorAll('.value');
    valueElements.forEach(el => {
        // Remove existing currency classes
        el.classList.remove('currency-idr', 'currency-usd', 'currency-eur', 'currency-sgd');
        // Add new currency class
        el.classList.add(`currency-${currentCurrency.toLowerCase()}`);
    });
}

// ==================== DASHBOARD DATA FUNCTIONS ====================

/**
 * Update overview cards with latest data
 */
async function updateOverviewCards() {
    try {
        const response = await fetch(`${API_BASE}/dashboard/overview`);
        if (!response.ok) throw new Error('Overview data fetch failed');
        
        const data = await response.json();
        
        // Update each card
        document.getElementById('totalRevenue').textContent = formatCurrency(data.totalRevenue);
        document.getElementById('totalOrders').textContent = formatNumber(data.totalOrders);
        document.getElementById('conversionRate').textContent = formatPercentage(data.conversionRate);
        document.getElementById('activeUsers').textContent = formatNumber(data.activeUsers);
        
        // Update platform cards
        const platformContainer = document.getElementById('platformCards');
        if (platformContainer && data.platforms) {
            platformContainer.innerHTML = '';
            
            data.platforms.forEach(platform => {
                const platformCard = document.createElement('div');
                platformCard.className = 'platform-card';
                platformCard.innerHTML = `
                    <div>
                        <div class="platform-name">${platform.name}</div>
                        <div class="platform-revenue">${formatCurrency(platform.revenue)}</div>
                    </div>
                    <div class="trend ${platform.change.includes('+') ? 'positive' : 'negative'}">
                        ${platform.change}
                    </div>
                `;
                platformContainer.appendChild(platformCard);
            });
        }
        
        // Update last update time
        const lastUpdateEl = document.getElementById('lastUpdate');
        if (lastUpdateEl) {
            lastUpdateEl.textContent = `Last updated: ${new Date().toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })}`;
        }
        
    } catch (err) {
        console.error('Error updating overview cards:', err);
        // Show error in UI
        document.getElementById('lastUpdate').textContent = 'Error loading data';
    }
}

/**
 * Update real-time events feed
 */
async function updateRealtimeEvents() {
    try {
        const response = await fetch(`${API_BASE}/realtime/updates`);
        if (!response.ok) throw new Error('Realtime data fetch failed');
        
        const data = await response.json();
        const eventsContainer = document.getElementById('realtimeEvents');
        
        if (eventsContainer && data.events) {
            eventsContainer.innerHTML = '';
            
            data.events.forEach(event => {
                const eventItem = document.createElement('div');
                eventItem.className = 'event-item';
                eventItem.innerHTML = `
                    <i class="fas fa-bell"></i> 
                    <span>${event}</span>
                    <small>${new Date().toLocaleTimeString('id-ID', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    })}</small>
                `;
                eventsContainer.appendChild(eventItem);
            });
        }
        
    } catch (err) {
        console.error('Error updating realtime events:', err);
    }
}

/**
 * Update platform status indicators
 */
async function updatePlatformStatus() {
    try {
        const response = await fetch(`${API_BASE}/platforms`);
        if (!response.ok) throw new Error('Platform status fetch failed');
        
        const platforms = await response.json();
        const platformCards = document.querySelectorAll('.platform-card');
        
        platformCards.forEach((card, index) => {
            if (platforms[index]) {
                // Remove existing status
                const existingStatus = card.querySelector('.platform-status');
                if (existingStatus) existingStatus.remove();
                
                // Add new status
                const statusSpan = document.createElement('span');
                const status = platforms[index].status.toLowerCase();
                statusSpan.className = `platform-status status-${status}`;
                statusSpan.textContent = platforms[index].status;
                card.appendChild(statusSpan);
            }
        });
        
    } catch (err) {
        console.error('Error updating platform status:', err);
    }
}

// ==================== EXPORT FUNCTIONS ====================

/**
 * Export dashboard data as JSON
 */
async function exportJsonReport() {
    try {
        const response = await fetch(`${API_BASE}/export/json`);
        if (!response.ok) throw new Error('Export failed');
        
        const data = await response.json();
        
        // Create downloadable file
        const blob = new Blob([JSON.stringify(data, null, 2)], { 
            type: 'application/json' 
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        // Set filename with current date
        const dateStr = new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = `daesacorp-dashboard-${dateStr}.json`;
        
        // Trigger download
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        
        // Show success notification
        showNotification('Report downloaded successfully!', 'success');
        
    } catch (err) {
        console.error('Export error:', err);
        showNotification('Failed to export report', 'error');
    }
}

/**
 * Generate PDF summary (simulated)
 */
function exportPdfSummary() {
    // This is a simulation - in production, use a PDF library
    showNotification('PDF export is in development', 'info');
    
    // Simulate PDF generation
    setTimeout(() => {
        const pdfUrl = '#';
        window.open(pdfUrl, '_blank');
    }, 1000);
}

// ==================== NOTIFICATION SYSTEM ====================

/**
 * Show notification message
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ==================== MAIN DASHBOARD UPDATE FUNCTION ====================

/**
 * Main function to update all dashboard components
 */
async function updateDashboard() {
    console.log(`Updating dashboard with ${currentCurrency} currency...`);
    
    try {
        // Update exchange rates first
        await updateCurrencyRates();
        
        // Update all components in parallel for better performance
        await Promise.all([
            updateOverviewCards(),
            updateRealtimeEvents(),
            updatePlatformStatus(),
            updateCharts()
        ]);
        
        // Update currency display
        updateCurrencyDisplay();
        
        console.log('Dashboard update complete');
        
    } catch (err) {
        console.error('Dashboard update error:', err);
        showNotification('Failed to update dashboard data', 'error');
    }
}

// ==================== EVENT LISTENERS ====================

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Currency switcher
    const currencySelect = document.getElementById('currencySelect');
    if (currencySelect) {
        currencySelect.addEventListener('change', function(e) {
            currentCurrency = e.target.value;
            updateDashboard();
        });
    }
    
    // Export buttons
    const exportJsonBtn = document.getElementById('exportJson');
    if (exportJsonBtn) {
        exportJsonBtn.addEventListener('click', exportJsonReport);
    }
    
    const exportPdfBtn = document.getElementById('exportSummary');
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', exportPdfSummary);
    }
    
    // Manual refresh button (optional - add in HTML if needed)
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', updateDashboard);
    }
    
    console.log('Event listeners setup complete');
}

// ==================== INITIALIZATION ====================

/**
 * Initialize the dashboard when page loads
 */
async function initializeDashboard() {
    console.log('Initializing enhanced dashboard...');
    
    try {
        // 1. Initialize Chart.js charts
        initializeCharts();
        
        // 2. Setup event listeners
        setupEventListeners();
        
        // 3. Load initial data
        await updateDashboard();
        
        // 4. Start auto-refresh (every 30 seconds)
        setInterval(updateDashboard, 30000);
        
        console.log('Dashboard initialized successfully!');
        showNotification('Dashboard loaded and auto-refresh enabled', 'success');
        
    } catch (err) {
        console.error('Dashboard initialization failed:', err);
        showNotification('Failed to initialize dashboard', 'error');
    }
}

// ==================== START THE DASHBOARD ====================

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboard);
} else {
    initializeDashboard();
}