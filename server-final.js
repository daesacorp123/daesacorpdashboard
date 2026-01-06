// =============================================
// DaeSaCorp Demo API - Mock Real-time Data
// =============================================

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3002;

// Middleware
app.use(cors()); // Allow frontend to access API
app.use(express.json());

// Serve static files from public folder
app.use(express.static('public'));

// =============================================
// DATA SIMULATION - REALISTIC ADVERTISING METRICS
// =============================================

// Base metrics for Indonesian market (in IDR)
const baseMetrics = {
    total_spend: 12500000,      // 12.5 juta
    total_conversions: 1248,
    roas: 4.2,                  // Return on Ad Spend
    ctr: 3.8,                   // Click-through Rate
    total_impressions: 245000,
    total_clicks: 5820,
    average_cpc: 2147,         // Cost per Click in IDR
    date: new Date().toISOString().split('T')[0]
};

// Platform-specific data
const platformData = {
    facebook: {
        name: 'Facebook & Instagram',
        spend: 7500000,         // 7.5 juta
        impressions: 125000,
        clicks: 3120,
        conversions: 685,
        ctr: 2.5,
        cpc: 2403,
        color: '#1877F2'
    },
    google: {
        name: 'Google Ads',
        spend: 5000000,         // 5 juta
        impressions: 120000,
        clicks: 2700,
        conversions: 563,
        ctr: 2.25,
        cpc: 1852,
        color: '#34A853'
    },
    tiktok: {
        name: 'TikTok Ads',
        spend: 2500000,         // 2.5 juta
        impressions: 50000,
        clicks: 1250,
        conversions: 250,
        ctr: 2.5,
        cpc: 2000,
        color: '#000000'
    }
};

// Campaign performance data
const campaigns = [
    { id: 1, name: 'Ramadhan Sale 2024', spend: 3500000, conversions: 420, roas: 4.8, status: 'completed' },
    { id: 2, name: 'Back to School', spend: 2800000, conversions: 315, roas: 3.9, status: 'active' },
    { id: 3, name: 'Weekend Flash Sale', spend: 1800000, conversions: 210, roas: 4.2, status: 'active' },
    { id: 4, name: 'Product Launch: XYZ', spend: 4200000, conversions: 380, roas: 3.5, status: 'paused' }
];

// =============================================
// HELPER FUNCTIONS
// =============================================

function generateRealisticVariation(baseValue, maxVariation = 0.05) {
    // Generate small realistic variation (±maxVariation%)
    const variation = (Math.random() - 0.5) * 2 * maxVariation;
    return baseValue * (1 + variation);
}

function getTimeBasedMultiplier() {
    // Simulate higher traffic during certain hours
    const now = new Date();
    const hour = now.getHours();
    
    // Peak hours: 10AM-12PM, 7PM-10PM (WIB)
    if ((hour >= 10 && hour < 12) || (hour >= 19 && hour < 22)) {
        return 1.3; // 30% higher during peak
    }
    // Low traffic: 1AM-6AM
    if (hour >= 1 && hour < 6) {
        return 0.7; // 30% lower
    }
    return 1.0; // Normal hours
}

// =============================================
// API ENDPOINTS
// =============================================

// 1. Dashboard Overview
app.get('/api/dashboard/overview', (req, res) => {
    const timeMultiplier = getTimeBasedMultiplier();
    
    const metrics = {
        total_spend: Math.round(generateRealisticVariation(baseMetrics.total_spend)),
        total_conversions: Math.round(generateRealisticVariation(baseMetrics.total_conversions, 0.03) * timeMultiplier),
        roas: parseFloat(generateRealisticVariation(baseMetrics.roas, 0.02).toFixed(2)),
        ctr: parseFloat(generateRealisticVariation(baseMetrics.ctr, 0.01).toFixed(2)),
        total_impressions: Math.round(generateRealisticVariation(baseMetrics.total_impressions, 0.05) * timeMultiplier),
        total_clicks: Math.round(generateRealisticVariation(baseMetrics.total_clicks, 0.04) * timeMultiplier),
        average_cpc: Math.round(generateRealisticVariation(baseMetrics.average_cpc)),
        timestamp: new Date().toISOString(),
        time_period: 'Last 30 days',
        performance_trend: 'up', // 'up', 'down', 'stable'
        trend_percentage: 12.5
    };
    
    res.json({
        success: true,
        message: 'Dashboard overview metrics',
        data: metrics
    });
});

// 2. Platform Performance
app.get('/api/platforms', (req, res) => {
    const timeMultiplier = getTimeBasedMultiplier();
    
    const platforms = Object.keys(platformData).map(key => {
        const platform = platformData[key];
        return {
            id: key,
            name: platform.name,
            spend: Math.round(generateRealisticVariation(platform.spend)),
            impressions: Math.round(generateRealisticVariation(platform.impressions, 0.06) * timeMultiplier),
            clicks: Math.round(generateRealisticVariation(platform.clicks, 0.05) * timeMultiplier),
            conversions: Math.round(generateRealisticVariation(platform.conversions, 0.04) * timeMultiplier),
            ctr: parseFloat(generateRealisticVariation(platform.ctr, 0.01).toFixed(2)),
            cpc: Math.round(generateRealisticVariation(platform.cpc)),
            color: platform.color,
            performance: Math.random() > 0.3 ? 'good' : Math.random() > 0.5 ? 'warning' : 'poor',
            last_updated: new Date().toISOString()
        };
    });
    
    res.json({
        success: true,
        message: 'Platform performance data',
        data: platforms
    });
});

// 3. Campaign Performance
app.get('/api/campaigns', (req, res) => {
    const updatedCampaigns = campaigns.map(campaign => ({
        ...campaign,
        spend: Math.round(generateRealisticVariation(campaign.spend, 0.03)),
        conversions: Math.round(generateRealisticVariation(campaign.conversions, 0.05)),
        roas: parseFloat(generateRealisticVariation(campaign.roas, 0.02).toFixed(2)),
        daily_spend: Math.round(campaign.spend / 30 * (0.8 + Math.random() * 0.4)),
        ctr: parseFloat((2 + Math.random() * 2).toFixed(2))
    }));
    
    res.json({
        success: true,
        message: 'Campaign performance data',
        data: updatedCampaigns
    });
});

// 4. Real-time Updates (WebSocket simulation)
app.get('/api/realtime/updates', (req, res) => {
    // Simulate real-time event data
    const events = [
        { type: 'conversion', value: 1250, time: '2 minutes ago', platform: 'facebook' },
        { type: 'click', value: 45, time: '5 minutes ago', platform: 'google' },
        { type: 'impression', value: 1200, time: '10 minutes ago', platform: 'tiktok' },
        { type: 'spend', value: 250000, time: '15 minutes ago', platform: 'facebook' }
    ];
    
    // Randomly select 1-2 events to return
    const selectedEvents = [];
    const numEvents = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < numEvents; i++) {
        const randomIndex = Math.floor(Math.random() * events.length);
        selectedEvents.push(events[randomIndex]);
    }
    
    res.json({
        success: true,
        message: 'Real-time updates',
        data: {
            events: selectedEvents,
            timestamp: new Date().toISOString(),
            update_interval: '30 seconds'
        }
    });
});

// 5. Historical Data (for charts)
app.get('/api/historical/daily', (req, res) => {
    // Generate 30 days of historical data
    const days = 30;
    const historicalData = [];
    
    let baseSpend = 8000000;
    let baseConversions = 800;
    
    for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Add weekend effect
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const weekendMultiplier = isWeekend ? 1.4 : 1.0;
        
        // Add some trend (gradual increase)
        const trend = 1 + (i * 0.005);
        
        const spend = Math.round(baseSpend * trend * weekendMultiplier * (0.9 + Math.random() * 0.2));
        const conversions = Math.round(baseConversions * trend * weekendMultiplier * (0.85 + Math.random() * 0.3));
        
        historicalData.push({
            date: date.toISOString().split('T')[0],
            spend: spend,
            conversions: conversions,
            roas: parseFloat((spend / conversions / 10000).toFixed(2)),
            ctr: parseFloat((3 + Math.random() * 2).toFixed(2)),
            day_of_week: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][dayOfWeek]
        });
    }
    
    res.json({
        success: true,
        message: '30-day historical data',
        data: historicalData
    });
});

// =============================================
// ERROR HANDLING
// =============================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.url}`,
        available_endpoints: [
            'GET /api/dashboard/overview',
            'GET /api/platforms',
            'GET /api/campaigns',
            'GET /api/realtime/updates',
            'GET /api/historical/daily'
        ]
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('API Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// =============================================
// START SERVER
// =============================================

app.listen(PORT, () => {
    console.log(`\n🚀 DaeSaCorp Demo API is running!`);
    console.log(`📡 Local: http://localhost:${PORT}`);
    console.log(`\n📊 Available endpoints:`);
    console.log(`   GET /api/dashboard/overview    - Dashboard metrics`);
    console.log(`   GET /api/platforms            - Platform performance`);
    console.log(`   GET /api/campaigns            - Campaign data`);
    console.log(`   GET /api/realtime/updates     - Real-time events`);
    console.log(`   GET /api/historical/daily     - 30-day history`);
    console.log(`\n📁 Static files: http://localhost:${PORT}/demo.html`);
    console.log(`\n⚡ Press Ctrl+C to stop\n`);
});