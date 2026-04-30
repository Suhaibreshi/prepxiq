const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { adminAuth } = require('../middleware/adminAuth');

router.use(adminAuth);

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('category', { ascending: true })
    .order('program', { ascending: true });

  if (error) return res.status(500).json({ success: false, message: error.message });
  return res.json({ success: true, data });
});

router.post('/', async (req, res) => {
  const { category, program, batch_timing, is_active = true } = req.body || {};
  if (!category || !program) return res.status(400).json({ success: false, message: 'category and program are required' });

  const { data: existing } = await supabase.from('courses').select('id').eq('category', category).eq('program', program).maybeSingle();
  if (existing) return res.status(400).json({ success: false, message: 'Course already exists' });

  const { data, error } = await supabase.from('courses').insert([{ category, program, batch_timing, is_active }]).select().single();
  if (error) return res.status(500).json({ success: false, message: error.message });
  return res.json({ success: true, data });
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { category, program, batch_timing, is_active } = req.body || {};
  const { data, error } = await supabase.from('courses').update({ category, program, batch_timing, is_active }).eq('id', id).select().single();
  if (error) return res.status(500).json({ success: false, message: error.message });
  if (!data) return res.status(404).json({ success: false, message: 'Course not found' });
  return res.json({ success: true, data });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('courses').delete().eq('id', id);
  if (error) return res.status(500).json({ success: false, message: error.message });
  return res.json({ success: true });
});

module.exports = router;
