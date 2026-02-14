require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// In-memory store for OTPs (demo only)
const otps = new Map();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

app.listen(PORT, () => {
  console.log(`OTP server listening on port ${PORT}`);
});
