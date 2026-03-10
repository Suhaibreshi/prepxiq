import { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

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

// Only letters and spaces
const lettersOnly = (v: string) => v.replace(/[^a-zA-Z\s]/g, '');
// Only digits
const digitsOnly = (v: string) => v.replace(/[^0-9]/g, '');

const CLASS_OPTIONS = [
  '6th', '7th', '8th', '9th', '10th', '11th', '12th',
];

export default function RegistrationForm({ onBack }: RegistrationFormProps) {
  const [formData, setFormData] = useState<FormData>(INITIAL);
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    let filtered = value;
    // Filter name fields – letters & spaces only
    if (name === 'name' || name === 'fatherName') {
      filtered = lettersOnly(value);
    }
    // Filter mobile – digits only, max 10
    if (name === 'mobileNumber') {
      filtered = digitsOnly(value).slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : filtered }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Validation rules
  const errors: Record<string, string> = {};
  if (!formData.name.trim()) errors.name = 'Name is required';
  if (formData.mobileNumber && formData.mobileNumber.length !== 10) errors.mobileNumber = 'Must be 10 digits';
  if (formData.emailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)) errors.emailAddress = 'Invalid email';
  if (!formData.declaration) errors.declaration = 'Required';

  const showError = (field: string) => (touched[field] || triedSubmit) && errors[field];

  const inputClass = (field: string) =>
    `w-full px-3 sm:px-4 py-2 text-sm border rounded focus:outline-none transition-colors ${showError(field)
      ? 'border-red-500 bg-red-50 focus:border-red-500'
      : 'border-gray-300 focus:border-blue-500'
    }`;

  const selectClass = (field: string) =>
    `w-full px-3 sm:px-4 py-2 text-sm border rounded focus:outline-none transition-colors ${showError(field)
      ? 'border-red-500 bg-red-50 focus:border-red-500'
      : 'border-gray-300 focus:border-blue-500'
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
      const { data, error } = await supabase
        .from('registrations')
        .insert([{
          name: formData.name.trim(),
          father_name: formData.fatherName.trim(),
          gender: formData.gender,
          current_class: formData.currentClass,
          mobile_number: formData.mobileNumber,
          email_address: formData.emailAddress.trim(),
          course_program: formData.courseProgram.trim(),
          batch_class_timing: formData.batchClassTiming.trim(),
          registration_date: formData.registrationDate,
          declaration_agreed: formData.declaration,
          status: 'pending',
        }])
        .select();

      if (error) throw new Error(error.message || 'Failed to submit registration');

      setServerRegNumber(formData.registrationNumber);
      setIsSubmitted(true);
      console.log('Registration saved:', data);

      setTimeout(() => {
        setFormData({ ...INITIAL, registrationNumber: generateRegNumber(), registrationDate: todayISO() });
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

  /* ───── REVIEW SCREEN ───── */
  if (showReview && !isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 sm:py-12 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 sm:border-4 border-green-600">
            <div className="bg-green-600 text-white p-4 sm:p-8 text-center">
              <CheckCircle size={48} className="mx-auto mb-2 sm:mb-4 sm:w-16 sm:h-16" />
              <h1 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">PLEASE REVIEW YOUR DETAILS</h1>
              <p className="text-sm sm:text-lg">Verify all information before final submission</p>
            </div>

            <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border-l-4 border-blue-900">
                  <p className="text-xs font-semibold text-gray-600 uppercase">Registration Number</p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-900 mt-1">{formData.registrationNumber}</p>
                </div>
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border-l-4 border-blue-900">
                  <p className="text-xs font-semibold text-gray-600 uppercase">Registration Date</p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-900 mt-1">{formData.registrationDate}</p>
                </div>
              </div>

              <div className="bg-gray-100 p-3 sm:p-4 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-3 text-base sm:text-lg">Student Information</h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                  {([
                    ['Name', formData.name],
                    ['Father\'s Name', formData.fatherName],
                    ['Gender', formData.gender],
                    ['Class', formData.currentClass],
                    ['Mobile', formData.mobileNumber],
                    ['Email', formData.emailAddress],
                    ['Course', formData.courseProgram],
                    ['Batch Timing', formData.batchClassTiming],
                  ] as [string, string][]).map(([label, val]) => (
                    <div key={label}>
                      <p className="text-gray-600 font-semibold">{label}:</p>
                      <p className="text-gray-900 font-bold break-words">{val || '-'}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 sm:p-4 rounded text-xs sm:text-sm">
                <p className="text-gray-700">
                  <span className="font-bold">Important:</span> Please review all details carefully.
                  Once submitted, you will need to visit our center for final verification.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-2 sm:pt-4">
                <button
                  onClick={() => setShowReview(false)}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded transition-colors text-sm sm:text-base disabled:opacity-50"
                >
                  Edit Details
                </button>
                <button
                  onClick={confirmSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded transition-colors text-sm sm:text-base disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <><Loader2 className="animate-spin" size={20} /> Submitting...</>
                  ) : (
                    'Confirm & Submit'
                  )}
                </button>
              </div>

              {submitError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <strong>Error:</strong> {submitError}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ───── SUCCESS SCREEN ───── */
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 sm:py-12 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 sm:border-4 border-green-600">
            <div className="bg-green-600 text-white p-4 sm:p-8 text-center">
              <CheckCircle size={48} className="mx-auto mb-2 sm:mb-4 sm:w-16 sm:h-16" />
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Registration Successful!</h1>
              <p className="text-sm sm:text-lg mb-2 sm:mb-4">Your registration has been submitted successfully</p>
              <div className="bg-white text-green-600 rounded-lg px-3 sm:px-6 py-2 sm:py-3 inline-block font-bold text-base sm:text-xl">
                Ref: {serverRegNumber || formData.registrationNumber}
              </div>
              <p className="text-xs sm:text-sm mt-3 sm:mt-4">Please visit PREP X IQ center for final verification</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ───── MAIN FORM ───── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 sm:py-12 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {onBack && (
          <button onClick={onBack}
            className="mb-4 sm:mb-6 flex items-center gap-1 sm:gap-2 text-blue-900 hover:text-blue-700 transition-colors text-sm sm:text-base">
            <ChevronLeft size={18} />
            <span>Back to Home</span>
          </button>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-4 sm:p-8 rounded-t-lg shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-6">
            <div>
              <h1 className="text-3xl sm:text-5xl font-bold mb-1 sm:mb-2">STUDENT</h1>
              <h1 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6">REGISTRATION FORM</h1>
            </div>
            <div className="text-right text-xs sm:text-sm space-y-1 sm:space-y-2">
              <p className="flex items-center gap-1 sm:gap-2 justify-end">
                <span className="text-base sm:text-lg">📞</span>
                <span>+91 9149747791</span>
              </p>
              <p className="flex items-center gap-1 sm:gap-2 justify-end">
                <span className="text-base sm:text-lg">✉️</span>
                <span className="break-all">hello@prepxiq.com</span>
              </p>
              <p className="flex items-center gap-1 sm:gap-2 justify-end">
                <span className="text-base sm:text-lg">📍</span>
                <span>Achabol, Near J&K BANK</span>
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-b-lg shadow-lg overflow-hidden" noValidate>
          {/* Registration Info (auto-generated, read-only) */}
          <div className="p-4 sm:p-8 border-b-2 sm:border-b-4 border-blue-900">
            <h2 className="bg-blue-900 text-white px-3 sm:px-4 py-2 text-center font-bold mb-4 sm:mb-6 rounded text-sm sm:text-base">
              REGISTRATION INFORMATION
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Registration Number: <span className="text-blue-900">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="w-full px-3 sm:px-4 py-2 border-2 border-blue-200 rounded bg-blue-50 text-blue-900 font-bold text-sm">
                    {formData.registrationNumber}
                  </div>
                  <span className="text-xs text-gray-600 font-semibold whitespace-nowrap">AUTO-GEN</span>
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Registration Date: <span className="text-blue-900">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="w-full px-3 sm:px-4 py-2 border-2 border-blue-200 rounded bg-blue-50 text-blue-900 font-bold text-sm">
                    {formData.registrationDate}
                  </div>
                  <span className="text-xs text-gray-600 font-semibold whitespace-nowrap">TODAY</span>
                </div>
              </div>
            </div>
          </div>

          {/* Student Information */}
          <div className="p-4 sm:p-8 border-b-2 sm:border-b-4 border-blue-900">
            <h2 className="bg-blue-900 text-white px-3 sm:px-4 py-2 text-center font-bold mb-4 sm:mb-6 rounded text-sm sm:text-base">
              STUDENT INFORMATION
            </h2>
            <div className="space-y-4 sm:space-y-6">
              {/* Row 1: Name + Father's Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Name: <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange}
                    onBlur={() => handleBlur('name')}
                    className={inputClass('name')}
                    placeholder="Full name (letters only)" />
                  {showError('name') && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Father's Name:
                  </label>
                  <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange}
                    onBlur={() => handleBlur('fatherName')}
                    className={inputClass('fatherName')}
                    placeholder="Father's name (letters only)" />
                </div>
              </div>

              {/* Row 2: Gender + Class + Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Gender:</label>
                  <select name="gender" value={formData.gender} onChange={handleChange}
                    onBlur={() => handleBlur('gender')}
                    className={selectClass('gender')}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Current Class:
                  </label>
                  <select name="currentClass" value={formData.currentClass} onChange={handleChange}
                    onBlur={() => handleBlur('currentClass')}
                    className={selectClass('currentClass')}>
                    <option value="">Select Class</option>
                    {CLASS_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Mobile Number:</label>
                  <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange}
                    onBlur={() => handleBlur('mobileNumber')}
                    className={inputClass('mobileNumber')}
                    placeholder="10-digit number"
                    inputMode="numeric" />
                  {showError('mobileNumber') && (
                    <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>
                  )}
                </div>
              </div>

              {/* Row 3: Email + Course + Batch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Email Address:</label>
                  <input type="email" name="emailAddress" value={formData.emailAddress} onChange={handleChange}
                    onBlur={() => handleBlur('emailAddress')}
                    className={inputClass('emailAddress')}
                    placeholder="email@example.com" />
                  {showError('emailAddress') && (
                    <p className="text-red-500 text-xs mt-1">{errors.emailAddress}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Course / Program:
                  </label>
                  <input type="text" name="courseProgram" value={formData.courseProgram} onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    placeholder="Course name" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Batch / Class Timing:
                  </label>
                  <input type="text" name="batchClassTiming" value={formData.batchClassTiming} onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    placeholder="Timing" />
                </div>
              </div>
            </div>
          </div>

          {/* Declaration */}
          <div className="p-4 sm:p-8 border-b-2 sm:border-b-4 border-blue-900 bg-gray-50">
            <h2 className="bg-blue-900 text-white px-3 sm:px-4 py-2 text-center font-bold mb-4 sm:mb-6 rounded text-sm sm:text-base">
              DECLARATION
            </h2>
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-white rounded border border-gray-300 text-xs sm:text-sm">
              <p className="text-gray-700 leading-relaxed">
                I hereby declare that all the information provided above is true and correct to the best of my knowledge.
                I have read and understood the terms, conditions, and media consent of PREP X IQ.
              </p>
            </div>
            <label className={`flex items-start gap-2 sm:gap-3 text-xs sm:text-sm ${triedSubmit && !formData.declaration ? 'text-red-600' : ''}`}>
              <input type="checkbox" name="declaration" checked={formData.declaration} onChange={handleChange}
                className={`w-4 h-4 mt-0.5 sm:mt-1 ${triedSubmit && !formData.declaration ? 'accent-red-500' : ''}`} />
              <span className={triedSubmit && !formData.declaration ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                I agree to the declaration above <span className="text-red-500">*</span>
              </span>
            </label>
            {triedSubmit && !formData.declaration && (
              <p className="text-red-500 text-xs mt-2">You must agree to the declaration to proceed</p>
            )}
          </div>

          {/* Submit */}
          <div className="p-4 sm:p-8 bg-gray-50 border-t-2 sm:border-t-4 border-blue-900 flex flex-col sm:flex-row gap-2 sm:gap-4">
            <button type="submit"
              className="flex-1 bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 sm:py-3 px-3 sm:px-6 rounded transition-colors text-sm sm:text-base">
              Review & Submit Registration
            </button>
            {onBack && (
              <button type="button" onClick={onBack}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 sm:py-3 px-3 sm:px-6 rounded transition-colors text-sm sm:text-base">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
