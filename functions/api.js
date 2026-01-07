// functions/api.js - COMPLETE VERSION
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Helper: generate realistic data
const generateData = (base, variation = 0.05) => {
  const change = base * variation * (Math.random() > 0.5 ? 1 : -1);
  return Math.round(base + change);
};

// Helper: format currency IDR
const formatIDR = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

// ============ API ENDPOINTS ============

// 1. DASHBOARD OVERVIEW
app.get('/dashboard/overview', (req, res) => {
  const now = new Date();
  const data = {
    timestamp: now.toISOString(),
    total_spend: generateData(12500000),
    total_conversions: generateData(1248),
    roas: (Math.random() * 2 + 3).toFixed(1),
    ctr: (Math.random() * 1 + 3).toFixed(1) + '%',
    performance_trend: Math.random() > 0.3 ? 'up' : 'down',
    trend_percentage: (Math.random() * 10 + 5).toFixed(1),
    active_campaigns: Math.floor(Math.random() * 10) + 5,
    total_revenue: generateData(50000000),
    average_order_value: generateData(42000)
  };
  res.json(data);
});

// 2. PLATFORMS DATA
app.get('/platforms', (req, res) => {
  const platforms = [
    {
      id: 'fb',
      name: 'Facebook',
      spend: generateData(7500000),
      conversions: generateData(685),
      ctr: (Math.random() * 0.5 + 2).toFixed(2) + '%',
      cpc: generateData(2400),
      roas: (Math.random() * 2 + 3).toFixed(1),
      performance: Math.random() > 0.7 ? 'good' : Math.random() > 0.4 ? 'warning' : 'poor',
      color: '#1877f2',
      budget: 10000000,
      spent_percentage: Math.floor(Math.random() * 30) + 50
    },
    {
      id: 'google',
      name: 'Google',
      spend: generateData(5000000),
      conversions: generateData(563),
      ctr: (Math.random() * 0.5 + 2).toFixed(2) + '%',
      cpc: generateData(1850),
      roas: (Math.random() * 1.5 + 3.5).toFixed(1),
      performance: Math.random() > 0.8 ? 'good' : Math.random() > 0.5 ? 'warning' : 'poor',
      color: '#34a853',
      budget: 8000000,
      spent_percentage: Math.floor(Math.random() * 40) + 40
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      spend: generateData(2500000),
      conversions: generateData(250),
      ctr: (Math.random() * 0.8 + 2).toFixed(2) + '%',
      cpc: generateData(2000),
      roas: (Math.random() * 3 + 2).toFixed(1),
      performance: Math.random() > 0.6 ? 'good' : Math.random() > 0.3 ? 'warning' : 'poor',
      color: '#000000',
      budget: 5000000,
      spent_percentage: Math.floor(Math.random() * 50) + 30
    }
  ];
  res.json(platforms);
});

// 3. REAL-TIME UPDATES
app.get('/realtime/updates', (req, res) => {
  const platforms = ['Facebook', 'Google', 'TikTok', 'Instagram'];
  const eventTypes = ['conversion', 'click', 'impression', 'spend'];
  const adjectives = ['new', 'high-value', 'quick', 'targeted', 'optimized'];
  
  const generateEvent = () => {
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    
    let value, label;
    switch(type) {
      case 'conversion':
        value = Math.floor(Math.random() * 5) + 1;
        label = `${adjective} conversion`;
        break;
      case 'click':
        value = Math.floor(Math.random() * 200) + 50;
        label = `${adjective} click`;
        break;
      case 'impression':
        value = Math.floor(Math.random() * 5000) + 1000;
        label = `${adjective} impression`;
        break;
      case 'spend':
        value = Math.floor(Math.random() * 500000) + 100000;
        label = `${adjective} spend`;
        break;
    }
    
    const minutesAgo = Math.floor(Math.random() * 15) + 1;
    
    return {
      type,
      value,
      platform,
      label,
      time: `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`
    };
  };
  
  const events = Array(Math.floor(Math.random() * 3) + 2)
    .fill()
    .map(() => generateEvent());
  
  res.json({ 
    timestamp: new Date().toISOString(),
    events 
  });
});

// 4. HISTORICAL DATA FOR CHARTS
app.get('/historical/daily', (req, res) => {
  const days = 7;
  const historicalData = [];
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    historicalData.push({
      date: date.toISOString().split('T')[0],
      revenue: generateData(15000000),
      spend: generateData(5000000),
      conversions: generateData(300),
      clicks: generateData(5000),
      impressions: generateData(100000)
    });
  }
  
  res.json(historicalData);
});

// 5. CURRENCY RATES
app.get('/currency/rates', (req, res) => {
  res.json({
    rates: {
      IDR: 1,
      USD: 15500,
      EUR: 16800,
      SGD: 11500
    },
    updated: new Date().toISOString()
  });
});

// 6. EXPORT JSON REPORT
app.get('/export/json', (req, res) => {
  const report = {
    metadata: {
      reportId: `DASH-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      period: 'Last 7 Days',
      currency: 'IDR'
    },
    summary: {
      totalSpend: generateData(12500000),
      totalConversions: generateData(1248),
      totalRevenue: generateData(50000000),
      averageROAS: (Math.random() * 2 + 3).toFixed(1),
      topPerformingPlatform: 'Facebook'
    },
    platforms: [
      { name: 'Facebook', spend: generateData(7500000), conversions: generateData(685), roas: '4.2' },
      { name: 'Google', spend: generateData(5000000), conversions: generateData(563), roas: '3.8' },
      { name: 'TikTok', spend: generateData(2500000), conversions: generateData(250), roas: '5.1' }
    ],
    recommendations: [
      'Increase Facebook budget by 15% for better ROI',
      'Optimize Google Ads keywords for Q2 campaign',
      'Test new creatives on TikTok for younger audience'
    ]
  };
  
  res.json(report);
});

// 7. HEALTH CHECK
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ============ ERROR HANDLING ============
app.use((req, res, next) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    available_endpoints: [
      'GET /dashboard/overview',
      'GET /platforms',
      'GET /realtime/updates',
      'GET /historical/daily',
      'GET /currency/rates',
      'GET /export/json',
      'GET /health'
    ]
  });
});

app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// ============ EXPORT FOR NETLIFY ============
module.exports.handler = serverless(app);