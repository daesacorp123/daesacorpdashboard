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