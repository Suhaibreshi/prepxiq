const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../supabase');
const { ADMIN_JWT_SECRET } = require('../middleware/adminAuth');

const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }

  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const key = `login:${ip}`;
  const record = loginAttempts.get(key);
  const now = Date.now();

  if (record && record.count >= MAX_ATTEMPTS && now < record.resetAt) {
    const waitMs = record.resetAt - now;
    return res.status(429).json({
      success: false,
      message: `Too many login attempts. Try again in ${Math.ceil(waitMs / 60000)} minutes.`
    });
  }

  const { data: admin, error } = await supabase
    .from('admin_users')
    .select('id, username, password_hash')
    .eq('username', username)
    .maybeSingle();

  if (error || !admin) {
    if (!record) {
      loginAttempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    } else {
      record.count++;
    }
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const passwordMatch = await bcrypt.compare(password, admin.password_hash);
  if (!passwordMatch) {
    if (!record) {
      loginAttempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    } else {
      record.count++;
    }
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  loginAttempts.delete(key);

  const token = jwt.sign(
    { id: admin.id, username: admin.username },
    ADMIN_JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.json({ success: true, token, username: admin.username });
});

router.post('/logout', (req, res) => {
  return res.json({ success: true, message: 'Logged out' });
});

router.get('/me', require('../middleware/adminAuth').adminAuth, (req, res) => {
  return res.json({ success: true, username: req.adminUser.username });
});

module.exports = router;