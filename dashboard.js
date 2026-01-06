
        // Data dummy untuk dashboard
        const dashboardData = {
            website: {
                status: "active",
                visitors: 1245,
                conversion: 3.17,
                uptime: "99.8%"
            },
            googleAds: {
                status: "active",
                clicks: 890,
                impressions: 24500,
                cost: 1250000,
                conversions: 45
            },
            metaAds: {
                status: "inactive",
                reach: 0,
                engagement: 0,
                cost: 0,
                conversions: 0
            },
            overall: {
                performance: "BBR1 - 3.17%",
                revenue: 28500000,
                roi: 228
            }
        };

        // Format waktu Indonesia
        function updateWaktuIndonesia() {
            const now = new Date();
            const options = { 
                timeZone: 'Asia/Jakarta',
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            };
            const timeStr = now.toLocaleTimeString('id-ID', options);
            const liveTimeElement = document.getElementById('liveTime');
            if (liveTimeElement) {
                liveTimeElement.textContent = timeStr;
            }
        }

        // Inisialisasi Dashboard
        function initDashboard() {
            console.log("✅ Dashboard initialized");
            updateDashboardUI();
            loadServiceData();
            setupEventListeners();
            initNotifications();
        }

        // Update UI Dashboard
        function updateDashboardUI() {
            // Update status toggle
            const googleToggle = document.getElementById('toggleGoogle');
            const metaToggle = document.getElementById('toggleMeta');
            
            if (googleToggle) {
                googleToggle.classList.toggle('active', dashboardData.googleAds.status === "active");
            }
            if (metaToggle) {
                metaToggle.classList.toggle('active', dashboardData.metaAds.status === "active");
            }
            
            // Update statistik
            updateStatsDisplay();
        }

        // Load data dari API
        async function loadServiceData() {
            console.log("📡 Loading service data...");
            try {
                // Coba ambil dari API lokal
                const response = await fetch('/api/dashboard');
                if (response.ok) {
                    const data = await response.json();
                    updateDataFromResponse(data);
                } else {
                    throw new Error('API response not OK');
                }
            } catch (error) {
                console.log("⚠️ Using dummy data:", error.message);
                // Fallback ke data dummy
                useFallbackData();
            }
        }

        // Update data dari response
        function updateDataFromResponse(response) {
            if (response.data) {
                Object.assign(dashboardData.googleAds, response.data.googleAds || {});
                Object.assign(dashboardData.metaAds, response.data.metaAds || {});
                Object.assign(dashboardData.website, response.data.website || {});
                Object.assign(dashboardData.overall, response.data.overall || {});
            }
            
            updateStatsDisplay();
            
            // Update timestamp
            const tanggalElement = document.querySelector('.preview-container p');
            if (tanggalElement) {
                const now = new Date();
                const options = { 
                    timeZone: 'Asia/Jakarta',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                };
                tanggalElement.innerHTML = `Dashboard diperbarui: ${now.toLocaleDateString('id-ID', options)}`;
            }
            
            showNotification("✅ Data diperbarui", "success");
        }

        // Setup event listeners
        function setupEventListeners() {
            // Toggle Google Ads
            const googleToggle = document.getElementById('toggleGoogle');
            if (googleToggle) {
                googleToggle.addEventListener('click', function() {
                    toggleService('googleAds', this);
                });
            }
            
            // Toggle Meta Ads
            const metaToggle = document.getElementById('toggleMeta');
            if (metaToggle) {
                metaToggle.addEventListener('click', function() {
                    toggleService('metaAds', this);
                });
            }
            
            // Search functionality
            const searchInput = document.getElementById('dashboardSearch');
            if (searchInput) {
                searchInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        searchDashboard(this.value);
                    }
                });
            }
            
            // Auto-refresh setiap 30 detik
            setInterval(loadServiceData, 30000);
        }

        // Toggle service
        async function toggleService(serviceName, toggleElement) {
            const isActive = dashboardData[serviceName].status === "active";
            const newStatus = isActive ? "inactive" : "active";
            
            if (isActive) {
                if (!confirm(`Apakah Anda yakin ingin menonaktifkan ${serviceName === 'googleAds' ? 'Google Ads' : 'Meta Ads'}?`)) {
                    return;
                }
            }
            
            try {
                // Coba kirim ke API
                const response = await fetch('/api/toggle', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        service: serviceName,
                        status: newStatus
                    })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log("✅ API Response:", result);
                }
                
                // Update local data
                dashboardData[serviceName].status = newStatus;
                toggleElement.classList.toggle('active');
                
                // Reload data
                loadServiceData();
                
                const serviceNameID = serviceName === 'googleAds' ? 'Google Ads' : 'Meta Ads';
                const status = isActive ? 'dinonaktifkan' : 'diaktifkan';
                showNotification(`${serviceNameID} berhasil ${status}`, "success");
                
            } catch (error) {
                console.error("❌ Error, using local update:", error);
                
                // Fallback: update lokal saja
                dashboardData[serviceName].status = newStatus;
                toggleElement.classList.toggle('active');
                
                const serviceNameID = serviceName === 'googleAds' ? 'Google Ads' : 'Meta Ads';
                const status = isActive ? 'dinonaktifkan' : 'diaktifkan';
                showNotification(`${serviceNameID} ${status} (mode offline)`, "info");
            }
        }

        // Fungsi pencarian
        async function searchDashboard(query) {
            if (!query.trim()) return;
            
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.success && data.results.length > 0) {
                        showNotification(`🔍 Ditemukan ${data.count} hasil untuk "${query}"`, "info");
                        console.log("Hasil pencarian:", data.results);
                    } else {
                        showNotification(`❌ Tidak ditemukan hasil untuk "${query}"`, "warning");
                    }
                }
            } catch (error) {
                console.error("❌ Search error:", error);
                showNotification("🔍 Pencarian (mode offline)", "info");
            }
        }

        // System notifikasi
        function initNotifications() {
            if (!document.getElementById('notification-container')) {
                const notificationContainer = document.createElement('div');
                notificationContainer.id = 'notification-container';
                notificationContainer.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 1000;
                `;
                document.body.appendChild(notificationContainer);
            }
        }

        function showNotification(message, type = "info") {
            initNotifications();
            
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <div style="
                    background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
                    color: white;
                    padding: 12px 20px;
                    border-radius: 8px;
                    margin-bottom: 10px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    min-width: 300px;
                ">
                    <span>${message}</span>
                    <button onclick="this.parentElement.parentElement.remove()" style="
                        background: none;
                        border: none;
                        color: white;
                        cursor: pointer;
                        font-size: 18px;
                    ">×</button>
                </div>
            `;
            
            document.getElementById('notification-container').appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 5000);
        }

        // Fallback data jika API tidak tersedia
        function useFallbackData() {
            console.log("⚠️ Using fallback data");
            const mockResponse = {
                data: dashboardData,
                timestamp: new Date().toISOString()
            };
            updateDataFromResponse(mockResponse);
        }

        // Update statistik tambahan
        function updateAdditionalStats() {
            let additionalStats = document.querySelector('.additional-stats');
            if (!additionalStats) {
                additionalStats = document.createElement('div');
                additionalStats.className = 'additional-stats';
                additionalStats.style.cssText = `
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                    margin-top: 2rem;
                    padding-top: 1rem;
                    border-top: 1px solid #e5e7eb;
                `;
                
                additionalStats.innerHTML = `
                    <div class="stat-card">
                        <div class="stat-title">Total Klik</div>
                        <div class="stat-value" id="totalClicks">${dashboardData.googleAds.clicks}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-title">Impresi</div>
                        <div class="stat-value" id="totalImpressions">${dashboardData.googleAds.impressions.toLocaleString()}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-title">Biaya</div>
                        <div class="stat-value" id="totalCost">Rp ${dashboardData.googleAds.cost.toLocaleString()}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-title">ROI</div>
                        <div class="stat-value" id="roiValue">${dashboardData.overall.roi}%</div>
                    </div>
                `;
                
                const previewContainer = document.querySelector('.preview-container');
                if (previewContainer) {
                    previewContainer.appendChild(additionalStats);
                }
            }
        }

        // Update tampilan statistik
        function updateStatsDisplay() {
            updateAdditionalStats();
        }

        // Animasi untuk kartu layanan
        function initServiceCardAnimations() {
            const observerOptions = {
                threshold: 0.1
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, observerOptions);

            document.querySelectorAll('.service-card').forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'opacity 0.5s, transform 0.5s';
                observer.observe(card);
            });
        }

        // Inisialisasi saat halaman dimuat
        document.addEventListener('DOMContentLoaded', function() {
            console.log("📄 DOM loaded, initializing...");
            
            // Update waktu setiap detik
            setInterval(updateWaktuIndonesia, 1000);
            updateWaktuIndonesia();
            
            // Inisialisasi dashboard
            initDashboard();
            
            // Inisialisasi animasi kartu
            initServiceCardAnimations();
        });