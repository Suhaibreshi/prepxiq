// Load .env from file if it exists (local development), otherwise rely on Vercel env vars
const fs = require('fs');
const envPath = require('path').join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 4000;

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Serve uploaded photos statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// In-memory store for OTPs (demo only)
const otps = new Map();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// OTP Routes
app.post('/api/send-otp', async (req, res) => {
  const { phone, channel } = req.body || {};
  if (!phone) return res.status(400).json({ message: 'phone required' });

  const otp = generateOtp();
  const expiresAt = Date.now() + 1000 * 60 * 5; // 5 min
  otps.set(phone, { otp, expiresAt });

  // Attempt to use Twilio if configured
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      if (channel === 'whatsapp' && process.env.TWILIO_WHATSAPP_FROM) {
        await client.messages.create({ from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`, to: `whatsapp:${phone}`, body: `Your OTP: ${otp}` });
        return res.json({ message: 'OTP sent via WhatsApp' });
      }
      if (process.env.TWILIO_SMS_FROM) {
        await client.messages.create({ from: process.env.TWILIO_SMS_FROM, to: phone, body: `Your OTP: ${otp}` });
        return res.json({ message: 'OTP sent via SMS' });
      }
    } catch (err) {
      console.error('Twilio error', err);
    }
  }

  // Fallback demo: log OTP and return demo message
  console.log(`Demo OTP for ${phone}: ${otp}`);
  return res.json({ message: 'Demo mode: OTP logged on server console' });
});

app.post('/api/verify-otp', (req, res) => {
  const { phone, otp } = req.body || {};
  if (!phone || !otp) return res.status(400).json({ message: 'phone and otp required' });

  const record = otps.get(phone);
  if (!record) return res.status(400).json({ message: 'No OTP requested for this number' });
  if (Date.now() > record.expiresAt) {
    otps.delete(phone);
    return res.status(400).json({ message: 'OTP expired' });
  }
  if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

  otps.delete(phone);
  // In a real system you'd generate a JWT or session here. We'll return a demo token.
  return res.json({ token: `demo-token-${phone}-${Date.now()}` });
});

// Registration Routes
const registrationRoutes = require('./routes/registrations');
app.use('/api/registrations', registrationRoutes);

// Admin Auth Routes
const adminAuthRoutes = require('./routes/adminAuth');
app.use('/admin', adminAuthRoutes);

// Admin Dashboard API
const adminDashboardRoutes = require('./routes/adminDashboard');
app.use('/admin/api', adminDashboardRoutes);

// Admin Courses API
const adminCoursesRoutes = require('./routes/adminCourses');
app.use('/admin/api', adminCoursesRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large. Maximum size is 5MB.' });
  }
  
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ success: false, message: err.message });
  }
  
  // Always return JSON, never HTML
  res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

// 404 handler - must return JSON
app.use((req, res) => {
  console.error('Route not found:', req.method, req.url);
  res.status(404).json({ success: false, message: 'Route not found', path: req.url });
});

app.listen(PORT, () => {
  console.log(`PREP X IQ Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Registration API: http://localhost:${PORT}/api/registrations`);
});
