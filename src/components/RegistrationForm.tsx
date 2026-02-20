import { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle, Loader2 } from 'lucide-react';

// API base URL - change this to match your server
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface FormDataType {
  registrationNumber: string;
  registrationReceivedOn: string;
  name: string;
  fatherGuardianName: string;
  gender: string;
  currentClass: string;
  mobileNumber: string;
  emailAddress: string;
  courseProgram: string;
  batchClassTiming: string;
  guardianName: string;
  relationshipToStudent: string;
  guardianPhone: string;
  guardianAddress: string;
  emergencyContactName: string;
  emergencyRelationship: string;
  emergencyPhone: string;
  allergies: string;
  allergiesList: string;
  medicalConditions: string;
  medicalConditionsList: string;
  bloodGroup: string;
  photoConsent: boolean;
  declaration: boolean;
  photoFile: File | null;
  photoFileName: string;
}

interface RegistrationFormProps {
  onBack?: () => void;
}

const generateRegistrationNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
  return `REG-${year}${month}${day}-${random}`;
};

const getCurrentDate = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const RegistrationForm = ({ onBack }: RegistrationFormProps) => {
  const [formData, setFormData] = useState<FormDataType>({
    registrationNumber: '',
    registrationReceivedOn: '',
    name: '',
    fatherGuardianName: '',
    gender: '',
    currentClass: '',
    mobileNumber: '',
    emailAddress: '',
    courseProgram: '',
    batchClassTiming: '',
    guardianName: '',
    relationshipToStudent: '',
    guardianPhone: '',
    guardianAddress: '',
    emergencyContactName: '',
    emergencyRelationship: '',
    emergencyPhone: '',
    allergies: 'no',
    allergiesList: '',
    medicalConditions: 'no',
    medicalConditionsList: '',
    bloodGroup: '',
    photoConsent: false,
    declaration: false,
    photoFile: null,
    photoFileName: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [serverRegistrationNumber, setServerRegistrationNumber] = useState('');

  // Auto-generate registration number and date on component mount
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      registrationNumber: generateRegistrationNumber(),
      registrationReceivedOn: getCurrentDate(),
    }));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPhotoError('');

    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5 MB
      if (file.size > maxSize) {
        setPhotoError('Photo size must not exceed 5 MB');
        setFormData((prev) => ({
          ...prev,
          photoFile: null,
          photoFileName: '',
        }));
        return;
      }
      if (!file.type.startsWith('image/')) {
        setPhotoError('Please upload a valid image file');
        setFormData((prev) => ({
          ...prev,
          photoFile: null,
          photoFileName: '',
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        photoFile: file,
        photoFileName: file.name,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.declaration) {
      alert('Please read and agree to the declaration.');
      return;
    }

    if (!formData.photoConsent) {
      alert('Please agree to the photo, video & media consent.');
      return;
    }

    // Show review screen instead of immediate submission
    setShowReview(true);
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('fatherGuardianName', formData.fatherGuardianName);
      submitData.append('gender', formData.gender);
      submitData.append('currentClass', formData.currentClass);
      submitData.append('mobileNumber', formData.mobileNumber);
      submitData.append('emailAddress', formData.emailAddress);
      submitData.append('courseProgram', formData.courseProgram);
      submitData.append('batchClassTiming', formData.batchClassTiming);
      submitData.append('guardianName', formData.guardianName);
      submitData.append('relationshipToStudent', formData.relationshipToStudent);
      submitData.append('guardianPhone', formData.guardianPhone);
      submitData.append('guardianAddress', formData.guardianAddress);
      submitData.append('emergencyContactName', formData.emergencyContactName);
      submitData.append('emergencyRelationship', formData.emergencyRelationship);
      submitData.append('emergencyPhone', formData.emergencyPhone);
      submitData.append('allergies', formData.allergies);
      submitData.append('allergiesList', formData.allergiesList);
      submitData.append('medicalConditions', formData.medicalConditions);
      submitData.append('medicalConditionsList', formData.medicalConditionsList);
      submitData.append('bloodGroup', formData.bloodGroup);
      submitData.append('photoConsent', String(formData.photoConsent));
      submitData.append('declaration', String(formData.declaration));
      submitData.append('registrationDate', formData.registrationReceivedOn);
      
      if (formData.photoFile) {
        submitData.append('photo', formData.photoFile);
      }

      const response = await fetch(`${API_BASE_URL}/api/registrations`, {
        method: 'POST',
        body: submitData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to submit registration');
      }

      // Success!
      setServerRegistrationNumber(result.data.registration_number);
      setIsSubmitted(true);
      console.log('Registration saved:', result.data);

      // Reset form after 5 seconds
      setTimeout(() => {
        setFormData({
          registrationNumber: generateRegistrationNumber(),
          registrationReceivedOn: getCurrentDate(),
          name: '',
          fatherGuardianName: '',
          gender: '',
          currentClass: '',
          mobileNumber: '',
          emailAddress: '',
          courseProgram: '',
          batchClassTiming: '',
          guardianName: '',
          relationshipToStudent: '',
          guardianPhone: '',
          guardianAddress: '',
          emergencyContactName: '',
          emergencyRelationship: '',
          emergencyPhone: '',
          allergies: 'no',
          allergiesList: '',
          medicalConditions: 'no',
          medicalConditionsList: '',
          bloodGroup: '',
          photoConsent: false,
          declaration: false,
          photoFile: null,
          photoFileName: '',
        });
        setPhotoError('');
        setIsSubmitted(false);
        setShowReview(false);
        setServerRegistrationNumber('');
      }, 5000);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 sm:py-12 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        {onBack && !showReview && (
          <button
            onClick={onBack}
            className="mb-4 sm:mb-6 flex items-center gap-1 sm:gap-2 text-blue-900 hover:text-blue-700 transition-colors text-sm sm:text-base"
          >
            <ChevronLeft size={18} className="sm:size-{20}" />
            <span>Back to Home</span>
          </button>
        )}

        {/* REVIEW SCREEN */}
        {showReview && !isSubmitted && (
          <div className="mb-4 sm:mb-8">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 sm:border-4 border-green-600">
              <div className="bg-green-600 text-white p-4 sm:p-8 text-center">
                <CheckCircle size={48} className="mx-auto mb-2 sm:mb-4 sm:size-{64}" />
                <h1 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">PLEASE REVIEW YOUR DETAILS</h1>
                <p className="text-sm sm:text-lg">Verify all information before final submission at TITAN</p>
              </div>
              
              <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
                {/* Key Information Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border-l-2 sm:border-l-4 border-blue-900">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Registration Number</p>
                    <p className="text-lg sm:text-2xl font-bold text-blue-900 mt-1">{formData.registrationNumber}</p>
                  </div>
                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border-l-2 sm:border-l-4 border-blue-900">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Registration Date</p>
                    <p className="text-lg sm:text-2xl font-bold text-blue-900 mt-1">{formData.registrationReceivedOn}</p>
                  </div>
                </div>

                <div className="bg-gray-100 p-3 sm:p-4 rounded-lg">
                  <h3 className="font-bold text-gray-800 mb-2 sm:mb-3 text-base sm:text-lg">Student Information Summary</h3>
                  <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <p className="text-gray-600 font-semibold">Name:</p>
                      <p className="text-gray-900 font-bold">{formData.name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-semibold">Email:</p>
                      <p className="text-gray-900 font-bold break-words">{formData.emailAddress || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-semibold">Mobile:</p>
                      <p className="text-gray-900 font-bold">{formData.mobileNumber || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-semibold">Course:</p>
                      <p className="text-gray-900 font-bold">{formData.courseProgram || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-semibold">Class/Qualification:</p>
                      <p className="text-gray-900 font-bold">{formData.currentClass || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-semibold">Batch Timing:</p>
                      <p className="text-gray-900 font-bold">{formData.batchClassTiming || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-semibold">Profile Photo:</p>
                      <p className="text-gray-900 font-bold break-words">{formData.photoFileName || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border-l-2 sm:border-l-4 border-yellow-500 p-3 sm:p-4 rounded text-xs sm:text-sm">
                  <p className="text-gray-700">
                    <span className="font-bold">Important:</span> Please review all details carefully. Once submitted, you will need to visit our TITAN center for final verification and document submission.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-2 sm:pt-4">
                  <button
                    onClick={() => setShowReview(false)}
                    disabled={isSubmitting}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Edit Details
                  </button>
                  <button
                    onClick={confirmSubmit}
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Submitting...
                      </>
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
        )}

        {/* SUCCESS MESSAGE */}
        {isSubmitted && (
          <div className="mb-4 sm:mb-8">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 sm:border-4 border-green-600">
              <div className="bg-green-600 text-white p-4 sm:p-8 text-center">
                <CheckCircle size={48} className="mx-auto mb-2 sm:mb-4 sm:size-{64}" />
                <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Registration Successful!</h1>
                <p className="text-sm sm:text-lg mb-2 sm:mb-4">Your registration has been submitted successfully</p>
                <div className="bg-white text-green-600 rounded-lg px-3 sm:px-6 py-2 sm:py-3 inline-block font-bold text-base sm:text-xl">
                  Ref: {serverRegistrationNumber || formData.registrationNumber}
                </div>
                <p className="text-xs sm:text-sm mt-3 sm:mt-4">Please visit PREP X IQ center for final verification and document submission</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Container - Hidden during review/success */}
        {!showReview && !isSubmitted && (
          <>
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

            {/* Form Container */}
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-b-lg shadow-lg overflow-hidden"
            >
              {/* REGISTRATION INFORMATION SECTION */}
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
                    <p className="text-xs text-gray-500 mt-1">Unique reference for this registration</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Registration Date: <span className="text-blue-900">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="w-full px-3 sm:px-4 py-2 border-2 border-blue-200 rounded bg-blue-50 text-blue-900 font-bold text-sm">
                        {formData.registrationReceivedOn}
                      </div>
                      <span className="text-xs text-gray-600 font-semibold whitespace-nowrap">TODAY</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Date of registration submission</p>
                  </div>
                </div>
              </div>

              {/* STUDENT INFORMATION SECTION */}
              <div className="p-4 sm:p-8 border-b-2 sm:border-b-4 border-blue-900">
                <h2 className="bg-blue-900 text-white px-3 sm:px-4 py-2 text-center font-bold mb-4 sm:mb-6 rounded text-sm sm:text-base">
                  STUDENT INFORMATION
                </h2>
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Name: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Father's / Guardian's Name:
                  </label>
                  <input
                    type="text"
                    name="fatherGuardianName"
                    value={formData.fatherGuardianName}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    placeholder="Parent/Guardian name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Gender:
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Current Class / Qualification:
                  </label>
                  <input
                    type="text"
                    name="currentClass"
                    value={formData.currentClass}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    placeholder="Class/Qualification"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Mobile Number:
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                <div className="lg:col-span-1">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Email Address:
                  </label>
                  <input
                    type="email"
                    name="emailAddress"
                    value={formData.emailAddress}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Course / Program Applied For:
                  </label>
                  <input
                    type="text"
                    name="courseProgram"
                    value={formData.courseProgram}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    placeholder="Course name"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Batch / Class Timing:
                  </label>
                  <input
                    type="text"
                    name="batchClassTiming"
                    value={formData.batchClassTiming}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    placeholder="Timing"
                  />
                </div>
              </div>
            </div>
          </div>

              {/* GUARDIAN INFORMATION SECTION */}
              <div className="p-4 sm:p-8 border-b-2 sm:border-b-4 border-blue-900">
                <h2 className="bg-blue-900 text-white px-3 sm:px-4 py-2 text-center font-bold mb-4 sm:mb-6 rounded text-sm sm:text-base">
                  GUARDIAN INFORMATION (FOR STUDENTS BELOW 18 YEARS)
            </h2>
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Guardian Name:
                  </label>
                  <input
                    type="text"
                    name="guardianName"
                    value={formData.guardianName}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    placeholder="Guardian name"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Relationship to Student:
                  </label>
                  <input
                    type="text"
                    name="relationshipToStudent"
                    value={formData.relationshipToStudent}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    placeholder="Relationship"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Phone Number:
                  </label>
                  <input
                    type="tel"
                    name="guardianPhone"
                    value={formData.guardianPhone}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Address (if different from student):
                  </label>
                  <input
                    type="text"
                    name="guardianAddress"
                    value={formData.guardianAddress}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    placeholder="Address"
                  />
                </div>
              </div>
            </div>
          </div>

              {/* EMERGENCY CONTACT INFORMATION SECTION */}
              <div className="p-4 sm:p-8 border-b-2 sm:border-b-4 border-blue-900">
                <h2 className="bg-blue-900 text-white px-3 sm:px-4 py-2 text-center font-bold mb-4 sm:mb-6 rounded text-sm sm:text-base">
              EMERGENCY CONTACT INFORMATION
            </h2>
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Emergency Contact Name:
                  </label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    placeholder="Contact name"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Relationship to Student:
                  </label>
                  <input
                    type="text"
                    name="emergencyRelationship"
                    value={formData.emergencyRelationship}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    placeholder="Relationship"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Phone Number:
                </label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  placeholder="Phone number"
                />
              </div>
            </div>
              </div>

              {/* MEDICAL INFORMATION SECTION */}
              <div className="p-4 sm:p-8 border-b-2 sm:border-b-4 border-blue-900">
                <h2 className="bg-blue-900 text-white px-3 sm:px-4 py-2 text-center font-bold mb-4 sm:mb-6 rounded text-sm sm:text-base">
                  MEDICAL INFORMATION
                </h2>
                <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                  Does the student have any allergies?
                </label>
                <div className="flex gap-4 sm:gap-6">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="allergies"
                      value="yes"
                      checked={formData.allergies === 'yes'}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="allergies"
                      value="no"
                      checked={formData.allergies === 'no'}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>No</span>
                  </label>
                </div>
                {formData.allergies === 'yes' && (
                  <div className="mt-2 sm:mt-3">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      If yes, please list:
                    </label>
                    <textarea
                      name="allergiesList"
                      value={formData.allergiesList}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      placeholder="List allergies"
                      rows={3}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                  Does the student have any medical conditions we should be aware of?
                </label>
                <div className="flex gap-4 sm:gap-6">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="medicalConditions"
                      value="yes"
                      checked={formData.medicalConditions === 'yes'}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="medicalConditions"
                      value="no"
                      checked={formData.medicalConditions === 'no'}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>No</span>
                  </label>
                </div>
                {formData.medicalConditions === 'yes' && (
                  <div className="mt-2 sm:mt-3">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      If yes, please specify:
                    </label>
                    <textarea
                      name="medicalConditionsList"
                      value={formData.medicalConditionsList}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      placeholder="Specify medical conditions"
                      rows={3}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Blood Group:
                </label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Blood Group</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>
          </div>

              {/* PHOTO UPLOAD SECTION */}
              <div className="p-4 sm:p-8 border-b-2 sm:border-b-4 border-blue-900">
                <h2 className="bg-blue-900 text-white px-3 sm:px-4 py-2 text-center font-bold mb-4 sm:mb-6 rounded text-sm sm:text-base">
                  STUDENT PHOTO UPLOAD
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-xs sm:text-sm text-gray-700">
                    Please upload a recent passport-sized photograph. <span className="font-semibold text-red-500">*</span>
                  </p>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Upload Photo (Max 5 MB):
                    </label>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <label className="flex-1 flex items-center justify-center px-3 sm:px-4 py-4 sm:py-6 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                        <div className="text-center">
                          <svg className="mx-auto h-6 sm:h-8 w-6 sm:w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx={20} cy={24} r={3} stroke="currentColor" strokeWidth={2} />
                            <path d="M40 12v4m-2-2h4" strokeWidth={2} strokeLinecap="round" />
                          </svg>
                          <p className="text-xs sm:text-sm font-semibold text-gray-700 mt-1 sm:mt-2">Click to upload</p>
                          <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                        </div>
                        <input
                          type="file"
                          name="photo"
                          onChange={handlePhotoUpload}
                          accept="image/*"
                          className="hidden"
                        />
                      </label>
                    </div>
                    {photoError && (
                      <p className="text-red-600 text-xs sm:text-sm mt-2 font-semibold">{photoError}</p>
                    )}
                    {formData.photoFileName && (
                      <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-green-50 border border-green-200 rounded text-xs sm:text-sm">
                        <p className="text-gray-700">
                          <span className="font-semibold text-green-700">✓ File uploaded:</span> {formData.photoFileName}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Size: {(formData.photoFile ? formData.photoFile.size / 1024 : 0).toFixed(2)} KB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

          {/* PHOTO, VIDEO & MEDIA CONSENT SECTION */}
              <div className="p-4 sm:p-8 border-b-2 sm:border-b-4 border-blue-900 bg-gray-50">
                <h2 className="bg-blue-900 text-white px-3 sm:px-4 py-2 text-center font-bold mb-4 sm:mb-6 rounded text-sm sm:text-base">
                  PHOTO, VIDEO & MEDIA CONSENT
                </h2>
                <label className="flex items-start gap-2 sm:gap-3 mb-3 text-xs sm:text-sm">
                  <input
                    type="checkbox"
                    name="photoConsent"
                    checked={formData.photoConsent}
                    onChange={handleChange}
                    className="w-4 h-4 mt-0.5 sm:mt-1"
                  />
                  <span className="text-gray-700">
                    I Agree <span className="font-semibold">☐</span> I Do Not Agree
                    <span className="font-semibold">☐</span>
                  </span>
                </label>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  I hereby grant permission to PREP X IQ to capture, store, and use
                  the student's photograph and/or video for institutional records, ID
                  cards, promotional materials, advertisements, social media, and
                  website purposes, without any compensation.
                </p>
              </div>

              {/* DECLARATION SECTION */}
              <div className="p-4 sm:p-8 border-b-2 sm:border-b-4 border-blue-900 bg-gray-50">
                <h2 className="bg-blue-900 text-white px-3 sm:px-4 py-2 text-center font-bold mb-4 sm:mb-6 rounded text-sm sm:text-base">
                  DECLARATION
                </h2>
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-white rounded border border-gray-300 text-xs sm:text-sm">
                  <p className="text-gray-700 leading-relaxed">
                    I hereby declare that all the information provided above is true
                    and correct to the best of my knowledge. I have read and
                    understood the terms, conditions, and media consent of PREP X
                    IQ.
                  </p>
                </div>
                <label className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm">
                  <input
                    type="checkbox"
                    name="declaration"
                    checked={formData.declaration}
                    onChange={handleChange}
                    className="w-4 h-4 mt-0.5 sm:mt-1"
                  />
                  <span className="text-gray-700">
                    I agree to the declaration above <span className="text-red-500">*</span>
                  </span>
                </label>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="p-4 sm:p-8 bg-gray-50 border-t-2 sm:border-t-4 border-blue-900 flex flex-col sm:flex-row gap-2 sm:gap-4">
                <button
                  type="submit"
                  disabled={isSubmitted}
                  className="flex-1 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-400 text-white font-bold py-2 sm:py-3 px-3 sm:px-6 rounded transition-colors text-sm sm:text-base"
                >
                  Review & Submit Registration
                </button>
                {onBack && (
                  <button
                    type="button"
                    onClick={onBack}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 sm:py-3 px-3 sm:px-6 rounded transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default RegistrationForm;
