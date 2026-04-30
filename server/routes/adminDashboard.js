const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { adminAuth } = require('../middleware/adminAuth');

router.use(adminAuth);

router.get('/stats', async (req, res) => {
  const { data, error } = await supabase
    .from('registrations')
    .select('status, created_at');

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  const counts = { total: data.length, pending: 0, approved: 0, rejected: 0, waitlisted: 0 };
  data.forEach(r => {
    if (counts[r.status] !== undefined) counts[r.status]++;
  });

  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const thisMonthCount = data.filter(r => new Date(r.created_at) >= thisMonth).length;
  const lastMonthCount = data.filter(r => {
    const d = new Date(r.created_at);
    return d >= lastMonth && d <= lastMonthEnd;
  }).length;

  return res.json({
    success: true,
    data: { ...counts, thisMonth: thisMonthCount, lastMonth: lastMonthCount }
  });
});

router.get('/registrations', async (req, res) => {
  const {
    page = '1',
    limit = '20',
    status,
    search,
    course,
    dateFrom,
    dateTo
  } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = Math.min(parseInt(limit, 10), 100);
  const offset = (pageNum - 1) * limitNum;

  let query = supabase
    .from('registrations')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limitNum - 1);

  if (status && status !== 'all') query = query.eq('status', status);
  if (course && course !== 'all') query = query.eq('course_program', course);
  if (dateFrom) query = query.gte('registration_date', dateFrom);
  if (dateTo) query = query.lte('registration_date', dateTo);
  if (search) {
    query = query.or(`name.ilike.%${search}%,registration_number.ilike.%${search}%,mobile_number.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  return res.json({
    success: true,
    data,
    pagination: { page: pageNum, limit: limitNum, total: count, totalPages: Math.ceil(count / limitNum) }
  });
});

router.get('/registrations/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('registrations').select('*').eq('id', id).single();

  if (error || !data) {
    return res.status(404).json({ success: false, message: 'Registration not found' });
  }

  return res.json({ success: true, data });
});

module.exports = router;