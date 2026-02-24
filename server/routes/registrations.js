const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads', 'photos');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `photo-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, and PNG are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Helper function to generate registration number
const generateRegistrationNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
  return `REG-${year}${month}${day}-${random}`;
};

// Helper function to check if registration number exists
const isRegistrationNumberUnique = async (regNum) => {
  const { data, error } = await supabase
    .from('registrations')
    .select('id')
    .eq('registration_number', regNum)
    .maybeSingle();
  
  return !data;
};

// Helper function to get unique registration number
const getUniqueRegistrationNumber = async () => {
  let regNum = generateRegistrationNumber();
  let attempts = 0;
  while (!(await isRegistrationNumberUnique(regNum)) && attempts < 10) {
    regNum = generateRegistrationNumber();
    attempts++;
  }
  if (attempts >= 10) {
    throw new Error('Unable to generate unique registration number');
  }
  return regNum;
};

// GET /api/registrations - List all registrations
router.get('/', async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = supabase
      .from('registrations')
      .select('*', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,registration_number.ilike.%${search}%,mobile_number.ilike.%${search}%,email_address.ilike.%${search}%`);
    }

    // Add pagination and ordering
    query = query.order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: data,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch registrations', error: error.message });
  }
});

// GET /api/registrations/:id - Get single registration
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    res.json({ success: true, data: data });
  } catch (error) {
    console.error('Error fetching registration:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch registration', error: error.message });
  }
});

// GET /api/registrations/number/:regNumber - Get by registration number
router.get('/number/:regNumber', async (req, res) => {
  try {
    const { regNumber } = req.params;
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('registration_number', regNumber)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    res.json({ success: true, data: data });
  } catch (error) {
    console.error('Error fetching registration:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch registration', error: error.message });
  }
});

// POST /api/registrations - Create new registration
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const data = req.body;
    
    // Validate required fields
    if (!data.name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    // Generate unique registration number
    const registrationNumber = await getUniqueRegistrationNumber();
    const registrationDate = data.registrationDate || new Date().toISOString().split('T')[0];

    // Handle photo path
    let photoPath = null;
    if (req.file) {
      photoPath = req.file.filename;
    }

    // Insert registration
    const insertData = {
      registration_number: registrationNumber,
      registration_date: registrationDate,
      name: data.name,
      father_guardian_name: data.fatherGuardianName || null,
      gender: data.gender || null,
      current_class: data.currentClass || null,
      mobile_number: data.mobileNumber || null,
      email_address: data.emailAddress || null,
      course_program: data.courseProgram || null,
      batch_class_timing: data.batchClassTiming || null,
      guardian_name: data.guardianName || null,
      relationship_to_student: data.relationshipToStudent || null,
      guardian_phone: data.guardianPhone || null,
      guardian_address: data.guardianAddress || null,
      emergency_contact_name: data.emergencyContactName || null,
      emergency_relationship: data.emergencyRelationship || null,
      emergency_phone: data.emergencyPhone || null,
      has_allergies: data.allergies === 'yes',
      allergies_list: data.allergiesList || null,
      has_medical_conditions: data.medicalConditions === 'yes',
      medical_conditions_list: data.medicalConditionsList || null,
      blood_group: data.bloodGroup || null,
      photo_consent: data.photoConsent === 'true' || data.photoConsent === true,
      declaration_agreed: data.declaration === 'true' || data.declaration === true,
      photo_path: photoPath,
      status: 'pending'
    };

    const { data: newRegistration, error } = await supabase
      .from('registrations')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      message: 'Registration created successfully',
      data: newRegistration
    });
  } catch (error) {
    console.error('Error creating registration:', error);
    // Clean up uploaded file if there was an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: 'Failed to create registration', error: error.message });
  }
});

// PUT /api/registrations/:id - Update registration
router.put('/:id', upload.single('photo'), async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Check if registration exists
    const { data: existing, error: fetchError } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    // Handle photo update
    let photoPath = existing.photo_path;
    if (req.file) {
      // Delete old photo if exists
      if (existing.photo_path) {
        const oldPhotoPath = path.join(uploadsDir, existing.photo_path);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      photoPath = req.file.filename;
    }

    // Update data
    const updateData = {
      name: data.name || existing.name,
      father_guardian_name: data.fatherGuardianName !== undefined ? data.fatherGuardianName : existing.father_guardian_name,
      gender: data.gender || existing.gender,
      current_class: data.currentClass || existing.current_class,
      mobile_number: data.mobileNumber || existing.mobile_number,
      email_address: data.emailAddress || existing.email_address,
      course_program: data.courseProgram || existing.course_program,
      batch_class_timing: data.batchClassTiming || existing.batch_class_timing,
      guardian_name: data.guardianName !== undefined ? data.guardianName : existing.guardian_name,
      relationship_to_student: data.relationshipToStudent !== undefined ? data.relationshipToStudent : existing.relationship_to_student,
      guardian_phone: data.guardianPhone !== undefined ? data.guardianPhone : existing.guardian_phone,
      guardian_address: data.guardianAddress !== undefined ? data.guardianAddress : existing.guardian_address,
      emergency_contact_name: data.emergencyContactName !== undefined ? data.emergencyContactName : existing.emergency_contact_name,
      emergency_relationship: data.emergencyRelationship !== undefined ? data.emergencyRelationship : existing.emergency_relationship,
      emergency_phone: data.emergencyPhone !== undefined ? data.emergencyPhone : existing.emergency_phone,
      has_allergies: data.allergies !== undefined ? data.allergies === 'yes' : existing.has_allergies,
      allergies_list: data.allergiesList !== undefined ? data.allergiesList : existing.allergies_list,
      has_medical_conditions: data.medicalConditions !== undefined ? data.medicalConditions === 'yes' : existing.has_medical_conditions,
      medical_conditions_list: data.medicalConditionsList !== undefined ? data.medicalConditionsList : existing.medical_conditions_list,
      blood_group: data.bloodGroup || existing.blood_group,
      photo_consent: data.photoConsent !== undefined ? (data.photoConsent === 'true' || data.photoConsent === true) : existing.photo_consent,
      declaration_agreed: data.declaration !== undefined ? (data.declaration === 'true' || data.declaration === true) : existing.declaration_agreed,
      photo_path: photoPath,
      status: data.status || existing.status,
      updated_at: new Date().toISOString()
    };

    const { data: updated, error } = await supabase
      .from('registrations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Registration updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating registration:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: 'Failed to update registration', error: error.message });
  }
});

// PATCH /api/registrations/:id/status - Update registration status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'approved', 'rejected', 'waitlisted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ') 
      });
    }

    const { data: existing, error: fetchError } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    const { data: updated, error } = await supabase
      .from('registrations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, message: 'Failed to update status', error: error.message });
  }
});

// DELETE /api/registrations/:id - Delete registration
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: existing, error: fetchError } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    // Delete photo if exists
    if (existing.photo_path) {
      const photoPath = path.join(uploadsDir, existing.photo_path);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    const { error } = await supabase
      .from('registrations')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Registration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting registration:', error);
    res.status(500).json({ success: false, message: 'Failed to delete registration', error: error.message });
  }
});

// GET /api/registrations/stats/summary - Get registration statistics
router.get('/stats/summary', async (req, res) => {
  try {
    // Get total count
    const { count: total, error: totalError } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    // Get count by status
    const { data: statusData, error: statusError } = await supabase
      .from('registrations')
      .select('status');

    if (statusError) throw statusError;

    const statusCounts = statusData.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    // Get today's count
    const today = new Date().toISOString().split('T')[0];
    const { count: todayCount, error: todayError } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today);

    if (todayError) throw todayError;

    // Get this month's count
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const { count: thisMonthCount, error: monthError } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', monthStart.toISOString());

    if (monthError) throw monthError;

    res.json({
      success: true,
      data: {
        total,
        today: todayCount,
        thisMonth: thisMonthCount,
        byStatus: statusCounts
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics', error: error.message });
  }
});

module.exports = router;
