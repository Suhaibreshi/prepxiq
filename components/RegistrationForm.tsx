'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle, Loader2, Phone, Mail, MapPin, GraduationCap, User } from 'lucide-react';

interface FormData {
  registrationNumber: string;
  registrationDate: string;
  name: string;
  fatherName: string;
  gender: string;
  currentClass: string;
  mobileNumber: string;
  emailAddress: string;
  courseProgram: string;
  batchClassTiming: string;
  declaration: boolean;
}

interface RegistrationFormProps {
  onBack?: () => void;
}

const generateRegNumber = (): string => {
  const d = new Date();
  const pad = (n: number, len = 2) => String(n).padStart(len, '0');
  const random = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
  return `REG-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${random}`;
};

const todayISO = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const INITIAL: FormData = {
  registrationNumber: '',
  registrationDate: '',
  name: '',
  fatherName: '',
  gender: '',
  currentClass: '',
  mobileNumber: '',
  emailAddress: '',
  courseProgram: '',
  batchClassTiming: '',
  declaration: false,
};

const lettersOnly = (v: string) => v.replace(/[^a-zA-Z\s]/g, '');
const digitsOnly = (v: string) => v.replace(/[^0-9]/g, '');

const CLASS_OPTIONS = ['6th', '7th', '8th', '9th', '10th', '11th', '12th', '12+'];

const COURSE_CATEGORIES = [
  {
    name: 'Foundation',
    options: ['6th Class', '7th Class', '8th Class', '9th Class', '10th Class']
  },
  {
    name: 'Science',
    options: ['11th - PCM', '12th - PCM', '11th - PCB', '12th - PCB']
  },
  {
    name: 'Arts',
    options: ['11th - Arts', '12th - Arts']
  },
  {
    name: 'Commerce',
    options: ['11th - Commerce', '12th - Commerce']
  },
  {
    name: 'Competitive Exams',
    options: ['JEE', 'NEET', 'JKSSB']
  }
];

export default function RegistrationForm({ onBack }: RegistrationFormProps) {
  const [formData, setFormData] = useState<FormData>(INITIAL);
  const [courseCategory, setCourseCategory] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [serverRegNumber, setServerRegNumber] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [triedSubmit, setTriedSubmit] = useState(false);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      registrationNumber: generateRegNumber(),
      registrationDate: todayISO(),
    }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    let filtered = value;
    if (name === 'name' || name === 'fatherName') filtered = lettersOnly(value);
    if (name === 'mobileNumber') filtered = digitsOnly(value).slice(0, 10);
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : filtered }));
  };

  const handleBlur = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));

  const errors: Record<string, string> = {};
  if (!formData.name.trim()) errors.name = 'Name is required';
  if (formData.mobileNumber && formData.mobileNumber.length !== 10) errors.mobileNumber = 'Must be 10 digits';
  if (formData.emailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)) errors.emailAddress = 'Invalid email format';
  if (!courseCategory) errors.courseCategory = 'Category is required';
  if (courseCategory && !formData.courseProgram) errors.courseProgram = 'Course is required';
  if (!formData.declaration) errors.declaration = 'Required';

  const showError = (field: string) => (touched[field] || triedSubmit) && errors[field];

  const fieldClass = (field: string) =>
    `w-full px-3 sm:px-4 py-2.5 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${showError(field)
      ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-200'
      : 'border-gray-200 bg-white focus:border-blue-500 focus:ring-blue-200 hover:border-gray-300'
    }`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTriedSubmit(true);
    if (Object.keys(errors).length > 0) return;
    setShowReview(true);
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const payload = new FormData();
      payload.append('name', formData.name.trim());
      payload.append('fatherGuardianName', formData.fatherName.trim());
      payload.append('gender', formData.gender);
      payload.append('currentClass', formData.currentClass);
      payload.append('mobileNumber', formData.mobileNumber);
      payload.append('emailAddress', formData.emailAddress.trim());
      payload.append('courseProgram', formData.courseProgram.trim());
      payload.append('batchClassTiming', formData.batchClassTiming.trim());
      payload.append('registrationDate', formData.registrationDate);
      payload.append('declaration', String(formData.declaration));

      const res = await fetch('/api/registrations', { method: 'POST', body: payload });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to submit registration');
      }

      setServerRegNumber(result.data.registration_number);
      setIsSubmitted(true);
      console.log('Registration saved:', result.data);
      setTimeout(() => {
        setFormData({ ...INITIAL, registrationNumber: generateRegNumber(), registrationDate: todayISO() });
        setCourseCategory('');
        setIsSubmitted(false);
        setShowReview(false);
        setServerRegNumber('');
        setTouched({});
        setTriedSubmit(false);
      }, 5000);
    } catch (err) {
      console.error('Submission error:', err);
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ═══════ REVIEW SCREEN ═══════ */
  if (showReview && !isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 py-6 sm:py-12 px-3 sm:px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            {/* Review Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white p-6 sm:p-10 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />
              <div className="relative z-10">
                <div className="inline-flex p-3 bg-white/20 rounded-full mb-4">
                  <CheckCircle size={40} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Review Your Details</h1>
                <p className="text-emerald-100 text-sm sm:text-base">Please verify all information before final submission</p>
              </div>
            </div>

            <div className="p-5 sm:p-8 space-y-5">
              {/* Reg Info Cards */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-3 sm:p-4 rounded-xl border border-blue-200">
                  <p className="text-[10px] sm:text-xs font-semibold text-blue-600 uppercase tracking-wider">Reg. Number</p>
                  <p className="text-sm sm:text-lg font-bold text-blue-900 mt-1 font-mono">{formData.registrationNumber}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-3 sm:p-4 rounded-xl border border-blue-200">
                  <p className="text-[10px] sm:text-xs font-semibold text-blue-600 uppercase tracking-wider">Date</p>
                  <p className="text-sm sm:text-lg font-bold text-blue-900 mt-1">{formData.registrationDate}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 text-sm sm:text-base flex items-center gap-2">
                  <User size={16} className="text-blue-600" /> Student Information
                </h3>
                <div className="grid grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-3 sm:gap-y-4 text-xs sm:text-sm">
                  {([
                    ['Name', formData.name],
                    ['Father\'s Name', formData.fatherName],
                    ['Gender', formData.gender],
                    ['Class', formData.currentClass],
                    ['Mobile', formData.mobileNumber],
                    ['Email', formData.emailAddress],
                    ['Course', `${courseCategory} - ${formData.courseProgram}`],
                    ['Timing', formData.batchClassTiming],
                  ] as [string, string][]).map(([label, val]) => (
                    <div key={label} className="border-b border-gray-200 pb-2">
                      <p className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wider">{label}</p>
                      <p className="text-gray-900 font-semibold break-words mt-0.5">{val || '—'}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 sm:p-4 rounded-xl text-xs sm:text-sm">
                <p className="text-amber-800">
                  <span className="font-bold">Note:</span> Once submitted, please visit our center for final verification and document submission.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button onClick={() => setShowReview(false)} disabled={isSubmitting}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all text-sm border border-gray-300 disabled:opacity-50">
                  ← Edit Details
                </button>
                <button onClick={confirmSubmit} disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl transition-all text-sm shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSubmitting ? (<><Loader2 className="animate-spin" size={18} /> Submitting...</>) : 'Confirm & Submit ✓'}
                </button>
              </div>

              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  <strong>Error:</strong> {submitError}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════ SUCCESS SCREEN ═══════ */
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 py-6 sm:py-12 px-3 sm:px-4 flex items-center">
        <div className="max-w-lg mx-auto w-full">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white p-8 sm:p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />
              <div className="relative z-10">
                <div className="inline-flex p-4 bg-white/20 rounded-full mb-4">
                  <CheckCircle size={48} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Registration Successful!</h1>
                <p className="text-emerald-100 mb-6">Your registration has been submitted</p>
                <div className="bg-white text-emerald-700 rounded-xl px-6 py-3 inline-block font-bold text-lg font-mono shadow-lg">
                  {serverRegNumber || formData.registrationNumber}
                </div>
                <p className="text-emerald-200 text-xs sm:text-sm mt-5">Please visit PREP X IQ center for final verification</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════ MAIN FORM ═══════ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 py-6 sm:py-12 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {onBack && (
          <button onClick={onBack}
            className="mb-4 sm:mb-6 flex items-center gap-2 text-gray-600 hover:text-blue-700 transition-colors text-sm font-medium group">
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>
        )}

        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-6 sm:p-10 rounded-t-2xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />

          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full mb-4">
                <GraduationCap size={14} />
                <span className="text-xs font-medium tracking-wider uppercase">PREP X IQ</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                Student<br />Registration
              </h1>
            </div>
            <div className="text-sm space-y-2.5 sm:text-right">
              <div className="flex items-center gap-2.5 sm:justify-end">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Phone size={14} />
                </div>
                <span className="font-medium">+91 9149747791</span>
              </div>
              <div className="flex items-center gap-2.5 sm:justify-end">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Mail size={14} />
                </div>
                <span className="font-medium">hello@prepxiq.com</span>
              </div>
              <div className="flex items-center gap-2.5 sm:justify-end">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <MapPin size={14} />
                </div>
                <span className="font-medium">Achabal, Anantnag</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Form Body ── */}
        <form onSubmit={handleSubmit} className="bg-white rounded-b-2xl shadow-xl overflow-hidden border border-t-0 border-gray-200" noValidate>

          {/* Registration Info */}
          <div className="p-5 sm:p-8 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-6 bg-blue-600 rounded-full" />
              <h2 className="text-sm sm:text-base font-bold text-gray-800 uppercase tracking-wide">Registration Information</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 p-4 rounded-xl border border-blue-200">
                <p className="text-[10px] sm:text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Registration Number</p>
                <p className="text-base sm:text-lg font-bold text-blue-900 font-mono">{formData.registrationNumber}</p>
                <p className="text-[10px] text-blue-500 mt-1">Auto-generated</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 p-4 rounded-xl border border-blue-200">
                <p className="text-[10px] sm:text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Registration Date</p>
                <p className="text-base sm:text-lg font-bold text-blue-900">{formData.registrationDate}</p>
                <p className="text-[10px] text-blue-500 mt-1">Today's date</p>
              </div>
            </div>
          </div>

          {/* Student Information */}
          <div className="p-5 sm:p-8 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-6 bg-blue-600 rounded-full" />
              <h2 className="text-sm sm:text-base font-bold text-gray-800 uppercase tracking-wide">Student Information</h2>
            </div>

            <div className="space-y-5">
              {/* Name + Father */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange}
                    onBlur={() => handleBlur('name')}
                    className={fieldClass('name')}
                    placeholder="Full name (letters only)" />
                  {showError('name') && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                    Father's Name
                  </label>
                  <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange}
                    onBlur={() => handleBlur('fatherName')}
                    className={fieldClass('fatherName')}
                    placeholder="Father's name (letters only)" />
                </div>
              </div>

              {/* Gender + Class + Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange}
                    onBlur={() => handleBlur('gender')}
                    className={fieldClass('gender')}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Current Class</label>
                  <select name="currentClass" value={formData.currentClass} onChange={handleChange}
                    onBlur={() => handleBlur('currentClass')}
                    className={fieldClass('currentClass')}>
                    <option value="">Select Class</option>
                    {CLASS_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Mobile Number</label>
                  <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange}
                    onBlur={() => handleBlur('mobileNumber')}
                    className={fieldClass('mobileNumber')}
                    placeholder="10-digit mobile number"
                    inputMode="numeric" />
                  {showError('mobileNumber') && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>}
                </div>
              </div>

              {/* Email + Batch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                  <input type="email" name="emailAddress" value={formData.emailAddress} onChange={handleChange}
                    onBlur={() => handleBlur('emailAddress')}
                    className={fieldClass('emailAddress')}
                    placeholder="email@example.com" />
                  {showError('emailAddress') && <p className="text-red-500 text-xs mt-1">{errors.emailAddress}</p>}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Timing</label>
                  <select name="batchClassTiming" value={formData.batchClassTiming} onChange={handleChange}
                    onBlur={() => handleBlur('batchClassTiming')}
                    className={fieldClass('batchClassTiming')}>
                    <option value="">Select Timing</option>
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                  </select>
                </div>
              </div>

              {/* Course Category + Selected Course */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={courseCategory}
                    onChange={(e) => {
                      setCourseCategory(e.target.value);
                      setFormData(prev => ({ ...prev, courseProgram: '' }));
                      handleBlur('courseCategory');
                    }}
                    onBlur={() => handleBlur('courseCategory')}
                    className={fieldClass('courseCategory')}
                  >
                    <option value="">Select Category</option>
                    {COURSE_CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                  {showError('courseCategory') && <p className="text-red-500 text-xs mt-1">{errors.courseCategory}</p>}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="courseProgram"
                    value={formData.courseProgram}
                    onChange={handleChange}
                    onBlur={() => handleBlur('courseProgram')}
                    disabled={!courseCategory}
                    className={`${fieldClass('courseProgram')} ${!courseCategory ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
                  >
                    <option value="">{courseCategory ? 'Select Course' : 'Select a Category First'}</option>
                    {COURSE_CATEGORIES.find(c => c.name === courseCategory)?.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {showError('courseProgram') && <p className="text-red-500 text-xs mt-1">{errors.courseProgram}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Declaration */}
          <div className="p-5 sm:p-8 bg-gray-50/50 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-6 bg-blue-600 rounded-full" />
              <h2 className="text-sm sm:text-base font-bold text-gray-800 uppercase tracking-wide">Declaration</h2>
            </div>
            <div className="mb-5 p-4 bg-white rounded-xl border border-gray-200 text-xs sm:text-sm leading-relaxed text-gray-600">
              I hereby declare that all the information provided above is true and correct to the best of my knowledge.
              I have read and understood the terms, conditions, and media consent of PREP X IQ.
            </div>
            <label className={`flex items-center gap-3 text-sm cursor-pointer select-none p-3 rounded-xl border-2 transition-all ${triedSubmit && !formData.declaration
              ? 'border-red-300 bg-red-50'
              : formData.declaration
                ? 'border-emerald-300 bg-emerald-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }`}>
              <input type="checkbox" name="declaration" checked={formData.declaration} onChange={handleChange}
                className="w-4 h-4 rounded accent-emerald-600" />
              <span className={`font-medium ${triedSubmit && !formData.declaration ? 'text-red-700' : formData.declaration ? 'text-emerald-700' : 'text-gray-700'}`}>
                I agree to the declaration above <span className="text-red-500">*</span>
              </span>
            </label>
            {triedSubmit && !formData.declaration && (
              <p className="text-red-500 text-xs mt-2 ml-1">You must agree to the declaration to proceed</p>
            )}
          </div>

          {/* Submit */}
          <div className="p-5 sm:p-8 flex flex-col sm:flex-row gap-3">
            <button type="submit"
              className="flex-1 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all text-sm shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 hover:-translate-y-0.5">
              Review & Submit Registration
            </button>
            {onBack && (
              <button type="button" onClick={onBack}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all text-sm border border-gray-300">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}