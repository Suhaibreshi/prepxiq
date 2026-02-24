const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Check if Supabase is available
let supabaseAvailable = false;
const checkSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('registrations').select('count', { count: 'exact', head: true });
    supabaseAvailable = !error;
    return supabaseAvailable;
  } catch (err) {
    supabaseAvailable = false;
    return false;
  }
};

// Check connection on startup and periodically
checkSupabaseConnection();
setInterval(checkSupabaseConnection, 30000); // Check every 30 seconds

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

// Helper function to check if registration number exists (SQLite)
const isRegistrationNumberUniqueSQLite = (regNum) => {
  const stmt = db.prepare('SELECT id FROM registrations WHERE registration_number = ?');
  const result = stmt.get(regNum);
  return !result;
};

// Helper function to check if registration number exists (Supabase)
const isRegistrationNumberUniqueSupabase = async (regNum) => {
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
  
  if (supabaseAvailable) {
    while (!(await isRegistrationNumberUniqueSupabase(regNum)) && attempts < 10) {
      regNum = generateRegistrationNumber();
      attempts++;
    }
  } else {
    while (!isRegistrationNumberUniqueSQLite(regNum) && attempts < 10) {
      regNum = generateRegistrationNumber();
      attempts++;
    }
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
    
    if (supabaseAvailable) {
      let query = supabase
        .from('registrations')
        .select('*', { count: 'exact' });

      if (status) {
        query = query.eq('status', status);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,registration_number.ilike.%${search}%,mobile_number.ilike.%${search}%,email_address.ilike.%${search}%`);
      }

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
    } else {
      // Use SQLite fallback
      let sql = 'SELECT * FROM registrations WHERE 1=1';
      const params = [];
      
      if (status) {
        sql += ' AND status = ?';
        params.push(status);
      }
      
      if (search) {
        sql += ' AND (name LIKE ? OR registration_number LIKE ? OR mobile_number LIKE ? OR email_address LIKE ?)';
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern);
      }
      
      // Get total count
      const countStmt = db.prepare(sql.replace('SELECT *', 'SELECT COUNT(*) as count'));
      const countResult = countStmt.get(...params);
      const total = countResult.count;
      
      // Add pagination
      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);
      
      const stmt = db.prepare(sql);
      const rows = stmt.all(...params);
      
      res.json({
        success: true,
        data: rows,
        pagination: {
          total: total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        },
        storage: 'sqlite'
      });
    }
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch registrations', error: error.message });
  }
});

// GET /api/registrations/:id - Get single registration
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (supabaseAvailable) {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return res.status(404).json({ success: false, message: 'Registration not found' });
      }

      res.json({ success: true, data: data });
    } else {
      // Use SQLite fallback
      const stmt = db.prepare('SELECT * FROM registrations WHERE id = ?');
      const row = stmt.get(id);
      
      if (!row) {
        return res.status(404).json({ success: false, message: 'Registration not found' });
      }
      
      res.json({ success: true, data: row, storage: 'sqlite' });
    }
  } catch (error) {
    console.error('Error fetching registration:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch registration', error: error.message });
  }
});

// GET /api/registrations/number/:regNumber - Get by registration number
router.get('/number/:regNumber', async (req, res) => {
  try {
    const { regNumber } = req.params;
    
    if (supabaseAvailable) {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('registration_number', regNumber)
        .single();

      if (error || !data) {
        return res.status(404).json({ success: false, message: 'Registration not found' });
      }

      res.json({ success: true, data: data });
    } else {
      // Use SQLite fallback
      const stmt = db.prepare('SELECT * FROM registrations WHERE registration_number = ?');
      const row = stmt.get(regNumber);
      
      if (!row) {
        return res.status(404).json({ success: false, message: 'Registration not found' });
      }
      
      res.json({ success: true, data: row, storage: 'sqlite' });
    }
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

    // Prepare data object
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
      has_allergies: data.allergies === 'yes' ? 1 : 0,
      allergies_list: data.allergiesList || null,
      has_medical_conditions: data.medicalConditions === 'yes' ? 1 : 0,
      medical_conditions_list: data.medicalConditionsList || null,
      blood_group: data.bloodGroup || null,
      photo_consent: (data.photoConsent === 'true' || data.photoConsent === true) ? 1 : 0,
      declaration_agreed: (data.declaration === 'true' || data.declaration === true) ? 1 : 0,
      photo_path: photoPath,
      status: 'pending'
    };

    if (supabaseAvailable) {
      // Convert boolean values for Supabase
      const supabaseData = {
        ...insertData,
        has_allergies: data.allergies === 'yes',
        has_medical_conditions: data.medicalConditions === 'yes',
        photo_consent: data.photoConsent === 'true' || data.photoConsent === true,
        declaration_agreed: data.declaration === 'true' || data.declaration === true
      };

      const { data: newRegistration, error } = await supabase
        .from('registrations')
        .insert([supabaseData])
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
    } else {
      // Use SQLite fallback
      const stmt = db.prepare(`
        INSERT INTO registrations (
          registration_number, registration_date, name, father_guardian_name, gender,
          current_class, mobile_number, email_address, course_program, batch_class_timing,
          guardian_name, relationship_to_student, guardian_phone, guardian_address,
          emergency_contact_name, emergency_relationship, emergency_phone,
          has_allergies, allergies_list, has_medical_conditions, medical_conditions_list,
          blood_group, photo_consent, declaration_agreed, photo_path, status
        ) VALUES (
          @registration_number, @registration_date, @name, @father_guardian_name, @gender,
          @current_class, @mobile_number, @email_address, @course_program, @batch_class_timing,
          @guardian_name, @relationship_to_student, @guardian_phone, @guardian_address,
          @emergency_contact_name, @emergency_relationship, @emergency_phone,
          @has_allergies, @allergies_list, @has_medical_conditions, @medical_conditions_list,
          @blood_group, @photo_consent, @declaration_agreed, @photo_path, @status
        )
      `);
      
      const result = stmt.run(insertData);
      
      // Get the inserted row
      const getStmt = db.prepare('SELECT * FROM registrations WHERE id = ?');
      const newRegistration = getStmt.get(result.lastInsertRowid);

      res.status(201).json({
        success: true,
        message: 'Registration created successfully (saved locally)',
        data: newRegistration,
        storage: 'sqlite'
      });
    }
  } catch (error) {
    console.error('Error creating registration:', error);
    // Clean up uploaded file if there was an error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error('Error cleaning up file:', e);
      }
    }
    res.status(500).json({ success: false, message: 'Failed to create registration', error: error.message });
  }
});

// PUT /api/registrations/:id - Update registration
router.put('/:id', upload.single('photo'), async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (supabaseAvailable) {
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

      const updateData = {
        name: data.name || existing.name,
        father_guardian_name: data.fatherGuardianName || existing.father_guardian_name,
        gender: data.gender || existing.gender,
        current_class: data.currentClass || existing.current_class,
        mobile_number: data.mobileNumber || existing.mobile_number,
        email_address: data.emailAddress || existing.email_address,
        course_program: data.courseProgram || existing.course_program,
        batch_class_timing: data.batchClassTiming || existing.batch_class_timing,
        guardian_name: data.guardianName || existing.guardian_name,
        relationship_to_student: data.relationshipToStudent || existing.relationship_to_student,
        guardian_phone: data.guardianPhone || existing.guardian_phone,
        guardian_address: data.guardianAddress || existing.guardian_address,
        emergency_contact_name: data.emergencyContactName || existing.emergency_contact_name,
        emergency_relationship: data.emergencyRelationship || existing.emergency_relationship,
        emergency_phone: data.emergencyPhone || existing.emergency_phone,
        has_allergies: data.allergies === 'yes',
        allergies_list: data.allergiesList || existing.allergies_list,
        has_medical_conditions: data.medicalConditions === 'yes',
        medical_conditions_list: data.medicalConditionsList || existing.medical_conditions_list,
        blood_group: data.bloodGroup || existing.blood_group,
        photo_consent: data.photoConsent === 'true' || data.photoConsent === true,
        declaration_agreed: data.declaration === 'true' || data.declaration === true,
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
    } else {
      // Use SQLite fallback
      const stmt = db.prepare('SELECT * FROM registrations WHERE id = ?');
      const existing = stmt.get(id);
      
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Registration not found' });
      }

      // Handle photo update
      let photoPath = existing.photo_path;
      if (req.file) {
        if (existing.photo_path) {
          const oldPhotoPath = path.join(uploadsDir, existing.photo_path);
          if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
          }
        }
        photoPath = req.file.filename;
      }

      const updateStmt = db.prepare(`
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
      
      updateStmt.run(
        data.name || existing.name,
        data.fatherGuardianName || existing.father_guardian_name,
        data.gender || existing.gender,
        data.currentClass || existing.current_class,
        data.mobileNumber || existing.mobile_number,
        data.emailAddress || existing.email_address,
        data.courseProgram || existing.course_program,
        data.batchClassTiming || existing.batch_class_timing,
        data.guardianName || existing.guardian_name,
        data.relationshipToStudent || existing.relationship_to_student,
        data.guardianPhone || existing.guardian_phone,
        data.guardianAddress || existing.guardian_address,
        data.emergencyContactName || existing.emergency_contact_name,
        data.emergencyRelationship || existing.emergency_relationship,
        data.emergencyPhone || existing.emergency_phone,
        data.allergies === 'yes' ? 1 : 0,
        data.allergiesList || existing.allergies_list,
        data.medicalConditions === 'yes' ? 1 : 0,
        data.medicalConditionsList || existing.medical_conditions_list,
        data.bloodGroup || existing.blood_group,
        (data.photoConsent === 'true' || data.photoConsent === true) ? 1 : 0,
        (data.declaration === 'true' || data.declaration === true) ? 1 : 0,
        photoPath,
        data.status || existing.status,
        id
      );

      const getStmt = db.prepare('SELECT * FROM registrations WHERE id = ?');
      const updated = getStmt.get(id);

      res.json({
        success: true,
        message: 'Registration updated successfully',
        data: updated,
        storage: 'sqlite'
      });
    }
  } catch (error) {
    console.error('Error updating registration:', error);
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error('Error cleaning up file:', e);
      }
    }
    res.status(500).json({ success: false, message: 'Failed to update registration', error: error.message });
  }
});

// DELETE /api/registrations/:id - Delete registration
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (supabaseAvailable) {
      // Get registration to delete photo
      const { data: existing, error: fetchError } = await supabase
        .from('registrations')
        .select('photo_path')
        .eq('id', id)
        .single();

      if (fetchError || !existing) {
        return res.status(404).json({ success: false, message: 'Registration not found' });
      }

      // Delete from database
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Delete photo file
      if (existing.photo_path) {
        const photoPath = path.join(uploadsDir, existing.photo_path);
        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
        }
      }

      res.json({
        success: true,
        message: 'Registration deleted successfully'
      });
    } else {
      // Use SQLite fallback
      const getStmt = db.prepare('SELECT * FROM registrations WHERE id = ?');
      const existing = getStmt.get(id);
      
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Registration not found' });
      }

      const deleteStmt = db.prepare('DELETE FROM registrations WHERE id = ?');
      deleteStmt.run(id);

      // Delete photo file
      if (existing.photo_path) {
        const photoPath = path.join(uploadsDir, existing.photo_path);
        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
        }
      }

      res.json({
        success: true,
        message: 'Registration deleted successfully',
        storage: 'sqlite'
      });
    }
  } catch (error) {
    console.error('Error deleting registration:', error);
    res.status(500).json({ success: false, message: 'Failed to delete registration', error: error.message });
  }
});

// GET /api/registrations/stats/summary - Get registration statistics
router.get('/stats/summary', async (req, res) => {
  try {
    if (supabaseAvailable) {
      const { data, error } = await supabase.rpc('get_registration_stats');
      
      if (error) {
        // If RPC doesn't exist, calculate manually
        const { count: total } = await supabase.from('registrations').select('*', { count: 'exact', head: true });
        const { count: pending } = await supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('status', 'pending');
        const { count: approved } = await supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('status', 'approved');
        const { count: rejected } = await supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('status', 'rejected');
        const { count: waitlisted } = await supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('status', 'waitlisted');

        return res.json({
          success: true,
          data: { total, pending, approved, rejected, waitlisted }
        });
      }

      res.json({ success: true, data: data });
    } else {
      // Use SQLite fallback
      const stmt = db.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
          SUM(CASE WHEN status = 'waitlisted' THEN 1 ELSE 0 END) as waitlisted
        FROM registrations
      `);
      const stats = stmt.get();
      
      res.json({
        success: true,
        data: stats,
        storage: 'sqlite'
      });
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics', error: error.message });
  }
});

module.exports = router;
