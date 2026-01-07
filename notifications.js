// ==================== notifications.js ====================
// Notification & Alert System untuk Dashboard

class NotificationSystem {
    constructor() {
        this.container = null;
        this.notificationCount = 0;
        this.maxNotifications = 5;
        this.alertRules = [];
        this.initialize();
    }

    initialize() {
        // Create notification container
        this.createContainer();
        
        // Load alert rules
        this.loadAlertRules();
        
        // Start monitoring
        this.startMonitoring();
        
        console.log('Notification system initialized');
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
    }

    loadAlertRules() {
        this.alertRules = [
            {
                id: 1,
                name: 'Revenue Drop',
                condition: (data) => data.revenueChange < -10,
                message: '⚠️ Revenue dropped more than 10%',
                type: 'warning',
                cooldown: 300000 // 5 minutes
            },
            {
                id: 2,
                name: 'High Performance',
                condition: (data) => data.revenueChange > 20,
                message: '🎉 Revenue increased more than 20%!',
                type: 'success',
                cooldown: 600000 // 10 minutes
            },
            {
                id: 3,
                name: 'Low Conversion',
                condition: (data) => data.conversionRate < 2.0,
                message: '📉 Conversion rate below 2%',
                type: 'warning',
                cooldown: 900000 // 15 minutes
            },
            {
                id: 4,
                name: 'Platform Warning',
                condition: (data) => data.platformStatus === 'Poor',
                message: '🚨 Platform performance is Poor',
                type: 'error',
                cooldown: 300000
            }
        ];
    }

    showNotification(message, type = 'info', duration = 5000) {
        if (this.notificationCount >= this.maxNotifications) {
            // Remove oldest notification
            const oldest = this.container.firstChild;
            if (oldest) {
                this.container.removeChild(oldest);
                this.notificationCount--;
            }
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Icons based on type
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas ${icons[type] || icons.info}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-message">${message}</div>
                <div class="notification-time">${this.getCurrentTime()}</div>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to container
        this.container.appendChild(notification);
        this.notificationCount++;

        // Animate in
        setTimeout(() => notification.classList.add('show'), 10);

        // Auto remove after duration
        const autoRemove = setTimeout(() => {
            this.removeNotification(notification);
        }, duration);

        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            clearTimeout(autoRemove);
            this.removeNotification(notification);
        });

        return notification;
    }

    removeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode === this.container) {
                this.container.removeChild(notification);
                this.notificationCount--;
            }
        }, 300);
    }

    checkAlerts(dashboardData) {
        const now = Date.now();
        
        this.alertRules.forEach(rule => {
            // Check cooldown
            const lastTriggered = localStorage.getItem(`alert_${rule.id}_last`);
            if (lastTriggered && (now - parseInt(lastTriggered)) < rule.cooldown) {
                return;
            }

            // Check condition
            if (rule.condition(dashboardData)) {
                this.showNotification(rule.message, rule.type, 10000);
                
                // Store last triggered time
                localStorage.setItem(`alert_${rule.id}_last`, now.toString());
                
                // Also log to console for debugging
                console.log(`Alert triggered: ${rule.name}`, dashboardData);
            }
        });
    }

    startMonitoring() {
        // Monitor every 60 seconds
        setInterval(() => {
            this.checkSystemStatus();
        }, 60000);
    }

    checkSystemStatus() {
        // Check if API is responding
        fetch(`${window.API_BASE || ''}/api/dashboard/overview`)
            .then(response => {
                if (!response.ok) {
                    this.showNotification('⚠️ API connection issue detected', 'warning', 10000);
                }
            })
            .catch(() => {
                this.showNotification('🚨 Cannot connect to server', 'error', 10000);
            });
    }

    getCurrentTime() {
        return new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    clearAll() {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
        this.notificationCount = 0;
    }
}

// Global instance
window.NotificationSystem = new NotificationSystem();