const express = require('express');
const router = express.Router();
const db = require('../db');
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
const isRegistrationNumberUnique = (regNum) => {
  const stmt = db.prepare('SELECT id FROM registrations WHERE registration_number = ?');
  const result = stmt.get(regNum);
  return !result;
};

// Helper function to get unique registration number
const getUniqueRegistrationNumber = () => {
  let regNum = generateRegistrationNumber();
  let attempts = 0;
  while (!isRegistrationNumberUnique(regNum) && attempts < 10) {
    regNum = generateRegistrationNumber();
    attempts++;
  }
  if (attempts >= 10) {
    throw new Error('Unable to generate unique registration number');
  }
  return regNum;
};

// GET /api/registrations - List all registrations
router.get('/', (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = 'SELECT * FROM registrations WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (name LIKE ? OR registration_number LIKE ? OR mobile_number LIKE ? OR email_address LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countStmt = db.prepare(countQuery);
    const { total } = countStmt.get(...params);

    // Add pagination
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const stmt = db.prepare(query);
    const registrations = stmt.all(...params);

    res.json({
      success: true,
      data: registrations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch registrations', error: error.message });
  }
});

// GET /api/registrations/:id - Get single registration
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('SELECT * FROM registrations WHERE id = ?');
    const registration = stmt.get(id);

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    res.json({ success: true, data: registration });
  } catch (error) {
    console.error('Error fetching registration:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch registration', error: error.message });
  }
});

// GET /api/registrations/number/:regNumber - Get by registration number
router.get('/number/:regNumber', (req, res) => {
  try {
    const { regNumber } = req.params;
    const stmt = db.prepare('SELECT * FROM registrations WHERE registration_number = ?');
    const registration = stmt.get(regNumber);

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    res.json({ success: true, data: registration });
  } catch (error) {
    console.error('Error fetching registration:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch registration', error: error.message });
  }
});

// POST /api/registrations - Create new registration
router.post('/', upload.single('photo'), (req, res) => {
  try {
    const data = req.body;
    
    // Validate required fields
    if (!data.name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    // Generate unique registration number
    const registrationNumber = getUniqueRegistrationNumber();
    const registrationDate = data.registrationDate || new Date().toISOString().split('T')[0];

    // Handle photo path
    let photoPath = null;
    if (req.file) {
      photoPath = req.file.filename;
    }

    // Insert registration
    const stmt = db.prepare(`
      INSERT INTO registrations (
        registration_number, registration_date, name, father_guardian_name,
        gender, current_class, mobile_number, email_address, course_program,
        batch_class_timing, guardian_name, relationship_to_student, guardian_phone,
        guardian_address, emergency_contact_name, emergency_relationship, emergency_phone,
        has_allergies, allergies_list, has_medical_conditions, medical_conditions_list,
        blood_group, photo_consent, declaration_agreed, photo_path, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      registrationNumber,
      registrationDate,
      data.name,
      data.fatherGuardianName || null,
      data.gender || null,
      data.currentClass || null,
      data.mobileNumber || null,
      data.emailAddress || null,
      data.courseProgram || null,
      data.batchClassTiming || null,
      data.guardianName || null,
      data.relationshipToStudent || null,
      data.guardianPhone || null,
      data.guardianAddress || null,
      data.emergencyContactName || null,
      data.emergencyRelationship || null,
      data.emergencyPhone || null,
      data.allergies === 'yes' ? 1 : 0,
      data.allergiesList || null,
      data.medicalConditions === 'yes' ? 1 : 0,
      data.medicalConditionsList || null,
      data.bloodGroup || null,
      data.photoConsent === 'true' || data.photoConsent === true ? 1 : 0,
      data.declaration === 'true' || data.declaration === true ? 1 : 0,
      photoPath,
      'pending'
    );

    // Fetch the created registration
    const newRegistration = db.prepare('SELECT * FROM registrations WHERE id = ?').get(result.lastInsertRowid);

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
router.put('/:id', upload.single('photo'), (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Check if registration exists
    const existing = db.prepare('SELECT * FROM registrations WHERE id = ?').get(id);
    if (!existing) {
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

    // Update registration
    const stmt = db.prepare(`
      UPDATE registrations SET
        name = ?, father_guardian_name = ?, gender = ?, current_class = ?,
        mobile_number = ?, email_address = ?, course_program = ?, batch_class_timing = ?,
        guardian_name = ?, relationship_to_student = ?, guardian_phone = ?, guardian_address = ?,
        emergency_contact_name = ?, emergency_relationship = ?, emergency_phone = ?,
        has_allergies = ?, allergies_list = ?, has_medical_conditions = ?, medical_conditions_list = ?,
        blood_group = ?, photo_consent = ?, declaration_agreed = ?, photo_path = ?,
        status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      data.name || existing.name,
      data.fatherGuardianName !== undefined ? data.fatherGuardianName : existing.father_guardian_name,
      data.gender || existing.gender,
      data.currentClass || existing.current_class,
      data.mobileNumber || existing.mobile_number,
      data.emailAddress || existing.email_address,
      data.courseProgram || existing.course_program,
      data.batchClassTiming || existing.batch_class_timing,
      data.guardianName !== undefined ? data.guardianName : existing.guardian_name,
      data.relationshipToStudent !== undefined ? data.relationshipToStudent : existing.relationship_to_student,
      data.guardianPhone !== undefined ? data.guardianPhone : existing.guardian_phone,
      data.guardianAddress !== undefined ? data.guardianAddress : existing.guardian_address,
      data.emergencyContactName !== undefined ? data.emergencyContactName : existing.emergency_contact_name,
      data.emergencyRelationship !== undefined ? data.emergencyRelationship : existing.emergency_relationship,
      data.emergencyPhone !== undefined ? data.emergencyPhone : existing.emergency_phone,
      data.allergies !== undefined ? (data.allergies === 'yes' ? 1 : 0) : existing.has_allergies,
      data.allergiesList !== undefined ? data.allergiesList : existing.allergies_list,
      data.medicalConditions !== undefined ? (data.medicalConditions === 'yes' ? 1 : 0) : existing.has_medical_conditions,
      data.medicalConditionsList !== undefined ? data.medicalConditionsList : existing.medical_conditions_list,
      data.bloodGroup || existing.blood_group,
      data.photoConsent !== undefined ? (data.photoConsent === 'true' || data.photoConsent === true ? 1 : 0) : existing.photo_consent,
      data.declaration !== undefined ? (data.declaration === 'true' || data.declaration === true ? 1 : 0) : existing.declaration_agreed,
      photoPath,
      data.status || existing.status,
      id
    );

    // Fetch updated registration
    const updated = db.prepare('SELECT * FROM registrations WHERE id = ?').get(id);

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
router.patch('/:id/status', (req, res) => {
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

    const existing = db.prepare('SELECT * FROM registrations WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    db.prepare('UPDATE registrations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);

    const updated = db.prepare('SELECT * FROM registrations WHERE id = ?').get(id);

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
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM registrations WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    // Delete photo if exists
    if (existing.photo_path) {
      const photoPath = path.join(uploadsDir, existing.photo_path);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    db.prepare('DELETE FROM registrations WHERE id = ?').run(id);

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
router.get('/stats/summary', (req, res) => {
  try {
    const totalStmt = db.prepare('SELECT COUNT(*) as total FROM registrations');
    const { total } = totalStmt.get();

    const statusStmt = db.prepare('SELECT status, COUNT(*) as count FROM registrations GROUP BY status');
    const statusCounts = statusStmt.all();

    const todayStmt = db.prepare("SELECT COUNT(*) as count FROM registrations WHERE date(created_at) = date('now')");
    const { count: todayCount } = todayStmt.get();

    const thisMonthStmt = db.prepare("SELECT COUNT(*) as count FROM registrations WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')");
    const { count: thisMonthCount } = thisMonthStmt.get();

    res.json({
      success: true,
      data: {
        total,
        today: todayCount,
        thisMonth: thisMonthCount,
        byStatus: statusCounts.reduce((acc, item) => {
          acc[item.status] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics', error: error.message });
  }
});

module.exports = router;