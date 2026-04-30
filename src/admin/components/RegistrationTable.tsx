interface Registration {
  id: number;
  registration_number: string;
  name: string;
  father_guardian_name: string;
  gender: string;
  current_class: string;
  mobile_number: string;
  email_address: string;
  course_program: string;
  batch_class_timing: string;
  registration_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'waitlisted';
  created_at: string;
}

interface Props {
  registrations: Registration[];
  loading: boolean;
  onView: (id: number) => void;
  onPageChange: (page: number) => void;
  pagination: { page: number; totalPages: number; total: number };
}

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  waitlisted: 'bg-gray-100 text-gray-800',
};

export default function RegistrationTable({ registrations, loading, onView, onPageChange, pagination }: Props) {
  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (registrations.length === 0) return <div className="text-center py-12 text-gray-500">No registrations found</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Reg Number</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Course</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map(reg => (
            <tr key={reg.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
              <td className="py-3 px-4 text-sm font-mono text-gray-700">{reg.registration_number}</td>
              <td className="py-3 px-4">
                <div className="font-medium text-gray-900">{reg.name}</div>
                <div className="text-xs text-gray-500">{reg.mobile_number}</div>
              </td>
              <td className="py-3 px-4 text-sm text-gray-700">{reg.course_program || '—'}</td>
              <td className="py-3 px-4 text-sm text-gray-500">
                {new Date(reg.registration_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[reg.status]}`}>{reg.status}</span>
              </td>
              <td className="py-3 px-4">
                <button onClick={() => onView(reg.id)}
                  className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">Showing {registrations.length} of {pagination.total}</div>
        <div className="flex gap-2">
          <button onClick={() => onPageChange(pagination.page - 1)} disabled={pagination.page <= 1}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50">
            Prev
          </button>
          <span className="px-3 py-1 text-sm text-gray-700">Page {pagination.page} of {pagination.totalPages}</span>
          <button onClick={() => onPageChange(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
