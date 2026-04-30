const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');

// Email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendStatusEmail(registration, newStatus) {
  if (!registration.email_address) return;

  const subject = newStatus === 'approved'
    ? 'Your PREPX IQ Registration is Approved'
    : 'Your PREPX IQ Registration Update';

  const body = newStatus === 'approved'
    ? `Congratulations ${registration.name},\n\nYour registration (${registration.registration_number}) for ${registration.course_program} has been approved. Welcome to PREPX IQ!\n\nBatch timing: ${registration.batch_class_timing || 'To be announced'}\n\nRegards,\nPREPX IQ Team`
    : `Dear ${registration.name},\n\nYour registration (${registration.registration_number}) could not be approved at this time. Please contact us at hello@prepxiq.com for more information.\n\nRegards,\nPREPX IQ Team`;

  try {
    await emailTransporter.sendMail({
      from: process.env.SMTP_FROM || 'hello@prepxiq.com',
      to: registration.email_address,
      subject,
      text: body
    });
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
}

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
  limits: { fileSize: 5 * 1024 * 1024 }
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

// GET /api/registrations/:id/pdf - Generate PDF for a registration
router.get('/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: registration, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    const photosDir = path.join(__dirname, '..', 'uploads', 'photos');
    const pdfsDir = path.join(__dirname, '..', 'uploads', 'pdfs');

    if (!fs.existsSync(pdfsDir)) {
      fs.mkdirSync(pdfsDir, { recursive: true });
    }

    let photoPath = null;
    if (registration.photo_path) {
      photoPath = path.join(photosDir, registration.photo_path);
    }

    const pdfFileName = `registration-${registration.registration_number}.pdf`;
    const pdfPath = path.join(pdfsDir, pdfFileName);

    const doc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    doc.fontSize(20).font('Helvetica-Bold').text('Registration Form', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').text(`Registration Number: ${registration.registration_number}`, { align: 'center' });
    doc.text(`Date: ${new Date(registration.created_at).toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    if (photoPath && fs.existsSync(photoPath)) {
      try {
        doc.fontSize(14).font('Helvetica-Bold').text('Photo', { continued: false });
        doc.moveDown(0.5);
        doc.image(photoPath, { fit: [150, 150], align: 'left' });
        doc.moveDown(2);
      } catch (imgErr) {
        console.error('Error adding image to PDF:', imgErr);
      }
    }

    doc.fontSize(14).font('Helvetica-Bold').text('Student Information');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');

    const studentInfo = [
      ['Name:', registration.name || 'N/A'],
      ['Father/Guardian Name:', registration.father_guardian_name || 'N/A'],
      ['Gender:', registration.gender || 'N/A'],
      ['Class:', registration.current_class || 'N/A'],
      ['Blood Group:', registration.blood_group || 'N/A']
    ];

    studentInfo.forEach(([label, value]) => {
      doc.font('Helvetica-Bold').text(label, { continued: true, width: 150 });
      doc.font('Helvetica').text(value);
    });

    doc.moveDown(1);

    doc.fontSize(14).font('Helvetica-Bold').text('Contact Information');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');

    const contactInfo = [
      ['Mobile Number:', registration.mobile_number || 'N/A'],
      ['Email Address:', registration.email_address || 'N/A']
    ];

    contactInfo.forEach(([label, value]) => {
      doc.font('Helvetica-Bold').text(label, { continued: true, width: 150 });
      doc.font('Helvetica').text(value);
    });

    doc.moveDown(1);

    doc.fontSize(14).font('Helvetica-Bold').text('Course Information');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');

    const courseInfo = [
      ['Course Program:', registration.course_program || 'N/A'],
      ['Batch Timing:', registration.batch_class_timing || 'N/A']
    ];

    courseInfo.forEach(([label, value]) => {
      doc.font('Helvetica-Bold').text(label, { continued: true, width: 150 });
      doc.font('Helvetica').text(value);
    });

    doc.moveDown(1);

    doc.fontSize(14).font('Helvetica-Bold').text('Guardian Information');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');

    const guardianInfo = [
      ['Guardian Name:', registration.guardian_name || 'N/A'],
      ['Relationship:', registration.relationship_to_student || 'N/A'],
      ['Phone:', registration.guardian_phone || 'N/A'],
      ['Address:', registration.guardian_address || 'N/A']
    ];

    guardianInfo.forEach(([label, value]) => {
      doc.font('Helvetica-Bold').text(label, { continued: true, width: 150 });
      doc.font('Helvetica').text(value);
    });

    doc.moveDown(1);

    doc.fontSize(14).font('Helvetica-Bold').text('Emergency Contact');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');

    const emergencyInfo = [
      ['Contact Name:', registration.emergency_contact_name || 'N/A'],
      ['Relationship:', registration.emergency_relationship || 'N/A'],
      ['Phone:', registration.emergency_phone || 'N/A']
    ];

    emergencyInfo.forEach(([label, value]) => {
      doc.font('Helvetica-Bold').text(label, { continued: true, width: 150 });
      doc.font('Helvetica').text(value);
    });

    doc.moveDown(1);

    doc.fontSize(14).font('Helvetica-Bold').text('Medical Information');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');

    const hasAllergies = registration.has_allergies ? 'Yes' : 'No';
    const hasMedicalConditions = registration.has_medical_conditions ? 'Yes' : 'No';

    const medicalInfo = [
      ['Has Allergies:', hasAllergies],
      ['Allergies List:', registration.allergies_list || 'N/A'],
      ['Has Medical Conditions:', hasMedicalConditions],
      ['Medical Conditions List:', registration.medical_conditions_list || 'N/A']
    ];

    medicalInfo.forEach(([label, value]) => {
      doc.font('Helvetica-Bold').text(label, { continued: true, width: 150 });
      doc.font('Helvetica').text(value);
    });

    doc.moveDown(1);

    doc.fontSize(14).font('Helvetica-Bold').text('Consent & Declaration');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');

    const photoConsent = registration.photo_consent ? 'Yes' : 'No';
    const declaration = registration.declaration_agreed ? 'Yes' : 'No';

    const consentInfo = [
      ['Photo Consent Given:', photoConsent],
      ['Declaration Agreed:', declaration]
    ];

    consentInfo.forEach(([label, value]) => {
      doc.font('Helvetica-Bold').text(label, { continued: true, width: 150 });
      doc.font('Helvetica').text(value);
    });

    doc.moveDown(2);
    doc.fontSize(9).font('Helvetica').text('Generated on: ' + new Date().toLocaleString(), { align: 'center' });

    doc.end();

    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    res.json({
      success: true,
      message: 'PDF generated successfully',
      pdfPath: `/uploads/pdfs/${pdfFileName}`,
      pdfFileName: pdfFileName
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ success: false, message: 'Failed to generate PDF', error: error.message });
  }
});

// POST /api/registrations - Create new registration
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const data = req.body;

    if (!data || !data.name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const registrationNumber = await getUniqueRegistrationNumber();
    const registrationDate = data.registrationDate || new Date().toISOString().split('T')[0];

    let photoPath = null;
    if (req.file) {
      photoPath = req.file.filename;
    }

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
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error('Error cleaning up file:', e);
      }
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/registrations/:id - Update registration
router.put('/:id', upload.single('photo'), async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const { data: existing, error: fetchError } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

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

    const { data: existing, error: fetchError } = await supabase
      .from('registrations')
      .select('photo_path')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    const { error } = await supabase
      .from('registrations')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

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
  } catch (error) {
    console.error('Error deleting registration:', error);
    res.status(500).json({ success: false, message: 'Failed to delete registration', error: error.message });
  }
});

// PUT /api/registrations/:id/status - Admin status update
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  const validStatuses = ['pending', 'approved', 'rejected', 'waitlisted'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Status must be one of: ${validStatuses.join(', ')}`
    });
  }

  if (supabaseAvailable) {
    const { data: current } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!current) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    const { data, error } = await supabase
      .from('registrations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    if (status === 'approved' || status === 'rejected') {
      sendStatusEmail(current, status).catch(console.error);
    }

    return res.json({ success: true, data });
  } else {
    return res.status(503).json({ success: false, message: 'Supabase not available' });
  }
});

// GET /api/registrations/stats/summary - Get registration statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const { count: total } = await supabase.from('registrations').select('*', { count: 'exact', head: true });
    const { count: pending } = await supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: approved } = await supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('status', 'approved');
    const { count: rejected } = await supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('status', 'rejected');
    const { count: waitlisted } = await supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('status', 'waitlisted');

    res.json({
      success: true,
      data: { total, pending, approved, rejected, waitlisted }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics', error: error.message });
  }
});

module.exports = router;