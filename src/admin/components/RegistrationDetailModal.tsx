import { useState } from 'react';
import { adminApi } from '../api/adminApi';

interface Registration {
  id: number;
  registration_number: string;
  name: string;
  father_guardian_name: string;
  gender: string;
  current_class: string;
  blood_group: string;
  mobile_number: string;
  email_address: string;
  course_program: string;
  batch_class_timing: string;
  guardian_name: string;
  relationship_to_student: string;
  guardian_phone: string;
  guardian_address: string;
  emergency_contact_name: string;
  emergency_relationship: string;
  emergency_phone: string;
  has_allergies: boolean;
  allergies_list: string;
  has_medical_conditions: boolean;
  medical_conditions_list: string;
  photo_path: string;
  photo_consent: boolean;
  declaration_agreed: boolean;
  status: string;
  registration_date: string;
  created_at: string;
}

interface Props {
  registration: Registration;
  onClose: () => void;
  onUpdated: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  waitlisted: 'bg-gray-100 text-gray-800',
};

export default function RegistrationDetailModal({ registration, onClose, onUpdated }: Props) {
  const [status, setStatus] = useState(registration.status);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const handleStatusAction = async (newStatus: string) => {
    if (confirmAction !== newStatus) { setConfirmAction(newStatus); return; }
    setUpdating(true); setError('');
    try {
      const res = await adminApi.updateStatus(registration.id, newStatus);
      if (res.success) { setStatus(newStatus); setConfirmAction(null); onUpdated(); }
      else setError(res.message || 'Update failed');
    } catch (err: any) { setError(err.message); }
    finally { setUpdating(false); }
  };

  const fields: [string, string][] = [
    ['Registration Number', registration.registration_number],
    ['Registration Date', new Date(registration.registration_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
    ['Full Name', registration.name],
    ["Father's/Guardian Name", registration.father_guardian_name || '—'],
    ['Gender', registration.gender || '—'],
    ['Current Class', registration.current_class || '—'],
    ['Blood Group', registration.blood_group || '—'],
    ['Mobile', registration.mobile_number || '—'],
    ['Email', registration.email_address || '—'],
    ['Course', registration.course_program || '—'],
    ['Batch Timing', registration.batch_class_timing || '—'],
    ['Guardian Name', registration.guardian_name || '—'],
    ['Relationship', registration.relationship_to_student || '—'],
    ['Guardian Phone', registration.guardian_phone || '—'],
    ['Guardian Address', registration.guardian_address || '—'],
    ['Emergency Contact', registration.emergency_contact_name || '—'],
    ['Emergency Phone', registration.emergency_phone || '—'],
    ['Has Allergies', registration.has_allergies ? 'Yes' : 'No'],
    ['Allergies', registration.allergies_list || '—'],
    ['Medical Conditions', registration.has_medical_conditions ? 'Yes' : 'No'],
    ['Conditions List', registration.medical_conditions_list || '—'],
    ['Photo Consent', registration.photo_consent ? 'Yes' : 'No'],
    ['Declaration Agreed', registration.declaration_agreed ? 'Yes' : 'No'],
  ];

  const photoFilename = registration.photo_path ? registration.photo_path.split('/').pop() : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Registration Details</h2>
            <span className={`mt-1 inline-block px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}>{status}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="p-6 space-y-6">
          {photoFilename && (
            <div className="flex justify-center">
              <img src={`/uploads/photos/${photoFilename}`} alt="Student"
                className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {fields.map(([label, value]) => (
              <div key={label}>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</div>
                <div className="text-sm text-gray-900 font-medium mt-0.5">{value}</div>
              </div>
            ))}
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
          {status === 'pending' && (
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button onClick={() => handleStatusAction('approved')} disabled={updating}
                className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${confirmAction === 'approved' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-100 hover:bg-green-200 text-green-800'}`}>
                {confirmAction === 'approved' ? '✓ Confirm Approve' : '✓ Approve'}
              </button>
              <button onClick={() => handleStatusAction('rejected')} disabled={updating}
                className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${confirmAction === 'rejected' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-100 hover:bg-red-200 text-red-800'}`}>
                {confirmAction === 'rejected' ? '✓ Confirm Reject' : '✗ Reject'}
              </button>
              <button onClick={() => handleStatusAction('waitlisted')} disabled={updating}
                className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${confirmAction === 'waitlisted' ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}>
                {confirmAction === 'waitlisted' ? '✓ Confirm Waitlist' : '⏸ Waitlist'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
