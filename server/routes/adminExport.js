const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { adminAuth } = require('../middleware/adminAuth');

router.use(adminAuth);

router.get('/csv', async (req, res) => {
  const { status, search, course, dateFrom, dateTo } = req.query;

  let query = supabase
    .from('registrations')
    .select('*')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') query = query.eq('status', status);
  if (course && course !== 'all') query = query.eq('course_program', course);
  if (dateFrom) query = query.gte('registration_date', dateFrom);
  if (dateTo) query = query.lte('registration_date', dateTo);
  if (search) {
    query = query.or(`name.ilike.%${search}%,registration_number.ilike.%${search}%,mobile_number.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) return res.status(500).json({ success: false, message: error.message });

  const headers = [
    'Registration Number', 'Registration Date', 'Name', 'Father/Guardian Name',
    'Gender', 'Current Class', 'Mobile', 'Email', 'Course', 'Batch Timing',
    'Status', 'Created At'
  ];

  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = data.map(r => [
    escape(r.registration_number),
    escape(r.registration_date),
    escape(r.name),
    escape(r.father_guardian_name),
    escape(r.gender),
    escape(r.current_class),
    escape(r.mobile_number),
    escape(r.email_address),
    escape(r.course_program),
    escape(r.batch_class_timing),
    escape(r.status),
    escape(r.created_at)
  ].join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="prepxiq-registrations-${dateStr}.csv"`);
  return res.send(csv);
});

module.exports = router;
