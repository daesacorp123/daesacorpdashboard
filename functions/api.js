// functions/api.js
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Helper functions
const generateData = (base, variation = 0.05) => {
  const change = base * variation * (Math.random() > 0.5 ? 1 : -1);
  return Math.round(base + change);
};

// API Routes - SAMA seperti di server.js
app.get('/dashboard/overview', (req, res) => {
  const now = new Date();
  const data = {
    timestamp: now.toISOString(),
    totalRevenue: generateData(125000000),
    totalOrders: generateData(8450),
    conversionRate: generateData(3.2),
    activeUsers: generateData(12500),
    platforms: [
      { name: 'Facebook', revenue: generateData(45000000), change: '+12%' },
      { name: 'Google', revenue: generateData(38000000), change: '+8%' },
      { name: 'TikTok', revenue: generateData(42000000), change: '+15%' }
    ]
  };
  res.json(data);
});

app.get('/platforms', (req, res) => {
  const platforms = [
    { id: 1, name: 'Facebook', status: 'Active', budget: 50000000, spent: generateData(45000000) },
    { id: 2, name: 'Google', status: 'Warning', budget: 40000000, spent: generateData(38000000) },
    { id: 3, name: 'TikTok', status: 'Poor', budget: 45000000, spent: generateData(42000000) }
  ];
  res.json(platforms);
});

app.get('/realtime/updates', (req, res) => {
  const events = [
    `New order #${Math.floor(Math.random() * 10000)}`,
    `Facebook campaign updated`,
    `Google Ads performance +${Math.floor(Math.random() * 10)}%`,
    `TikTok video reached ${Math.floor(Math.random() * 100000)} views`
  ];
  res.json({
    timestamp: new Date().toISOString(),
    events: events.slice(0, Math.floor(Math.random() * events.length) + 1)
  });
});

app.get('/campaigns', (req, res) => {
  const campaigns = [
    { id: 1, name: 'Summer Sale', platform: 'Facebook', budget: 20000000, status: 'Active' },
    { id: 2, name: 'Product Launch', platform: 'Google', budget: 15000000, status: 'Active' },
    { id: 3, name: 'Brand Awareness', platform: 'TikTok', budget: 18000000, status: 'Paused' }
  ];
  res.json(campaigns);
});

// Netlify Functions handler
module.exports.handler = serverless(app);