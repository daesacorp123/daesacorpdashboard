const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

// **TAMBAHKAN INI: Serve static files dari root directory**
app.use(express.static(__dirname));

// API Routes
app.get('/api/dashboard/overview', (req, res) => {
  // ... kode API yang sudah ada
});

app.get('/api/platforms', (req, res) => {
  // ... kode API yang sudah ada
});

app.get('/api/realtime/updates', (req, res) => {
  // ... kode API yang sudah ada
});

// **TAMBAHKAN INI: Route untuk HTML files**
app.get('/demo.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'demo.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Fallback untuk Netlify Functions
app.get('/.netlify/functions/api/*', (req, res) => {
  res.redirect(`/api${req.path.replace('/.netlify/functions/api', '')}`);
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

// ADD THESE NEW ENDPOINTS

// Historical data for charts
app.get('/api/historical/daily', (req, res) => {
  const days = 7;
  const historicalData = [];
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Base values dengan sedikit variasi
    const baseRevenue = 15000000;
    const baseOrders = 1200;
    const baseUsers = 8500;
    
    // Trend: sedikit naik setiap hari
    const trendMultiplier = 1 + (i * 0.02);
    
    historicalData.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.round(baseRevenue * trendMultiplier + (Math.random() * 2000000 - 1000000)),
      orders: Math.round(baseOrders * trendMultiplier + (Math.random() * 200 - 100)),
      users: Math.round(baseUsers * trendMultiplier + (Math.random() * 1000 - 500))
    });
  }
  
  res.json(historicalData);
});

// Platform comparison data
app.get('/api/platforms/comparison', (req, res) => {
  const platforms = [
    { 
      name: 'Facebook', 
      revenue: generateData(45000000),
      roas: (Math.random() * 5 + 2).toFixed(1),
      impressions: generateData(1500000),
      clicks: generateData(25000)
    },
    { 
      name: 'Google', 
      revenue: generateData(38000000),
      roas: (Math.random() * 4 + 1.5).toFixed(1),
      impressions: generateData(1200000),
      clicks: generateData(18000)
    },
    { 
      name: 'TikTok', 
      revenue: generateData(42000000),
      roas: (Math.random() * 6 + 2.5).toFixed(1),
      impressions: generateData(2000000),
      clicks: generateData(35000)
    },
    { 
      name: 'Instagram', 
      revenue: generateData(28000000),
      roas: (Math.random() * 4.5 + 2).toFixed(1),
      impressions: generateData(900000),
      clicks: generateData(15000)
    }
  ];
  
  res.json(platforms);
});

// Currency conversion rates
app.get('/api/currency/rates', (req, res) => {
  res.json({
    rates: {
      IDR: 1,
      USD: 15500,  // 1 USD = 15,500 IDR
      EUR: 16800,  // 1 EUR = 16,800 IDR
      SGD: 11500   // 1 SGD = 11,500 IDR
    },
    updated: new Date().toISOString()
  });
});

// Export data as JSON
app.get('/api/export/json', (req, res) => {
  const reportDate = new Date();
  
  // Generate comprehensive report
  const report = {
    metadata: {
      reportId: `DASH-${Date.now()}`,
      generatedAt: reportDate.toISOString(),
      period: 'Last 7 days',
      currency: 'IDR'
    },
    summary: {
      totalRevenue: generateData(125000000),
      totalOrders: generateData(8450),
      averageOrderValue: generateData(14800),
      topPlatform: 'Facebook'
    },
    platforms: [
      { name: 'Facebook', revenue: generateData(45000000), share: '36%' },
      { name: 'Google', revenue: generateData(38000000), share: '30%' },
      { name: 'TikTok', revenue: generateData(42000000), share: '34%' }
    ],
    recommendations: [
      'Increase TikTok budget by 15% for better ROI',
      'Optimize Google Ads keywords for higher conversion',
      'Test new creatives on Facebook for Q2 campaign'
    ]
  };
  
  // Set headers untuk download
  res.setHeader('Content-Disposition', 'attachment; filename="dashboard-report.json"');
  res.setHeader('Content-Type', 'application/json');
  res.json(report);
});