'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface Registration {
  id: string;
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

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  waitlisted: 'bg-gray-100 text-gray-800',
};

function RegistrationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [courseFilter, setCourseFilter] = useState(searchParams.get('course') || '');
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);

  useEffect(() => {
    const statusParam = searchParams.get('status');
    const courseParam = searchParams.get('course');
    if (statusParam) setStatusFilter(statusParam);
    if (courseParam) setCourseFilter(courseParam);
  }, [searchParams]);

  useEffect(() => {
    fetchRegistrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchRegistrations = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    if (courseFilter) params.set('course', courseFilter);
    params.set('page', searchParams.get('page') || '1');

    try {
      const res = await fetch(`/api/admin/registrations?${params}`);
      const data = await res.json();
      if (data.success) {
        setRegistrations(data.data);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    if (courseFilter) params.set('course', courseFilter);
    router.push(`/admin/registrations?${params}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/admin/registrations?${params}`);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/registrations/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchRegistrations();
        setSelectedReg(null);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this registration? This will also delete the associated user account if it exists.')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/registrations/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchRegistrations();
        setSelectedReg(null);
      } else {
        alert(data.message || 'Failed to delete registration');
      }
    } catch (err) {
      console.error('Failed to delete registration:', err);
      alert('An error occurred while deleting');
    }
  };

  const courses = ['6th Class', '7th Class', '8th Class', '9th Class', '10th Class', '11th - PCM', '11th - PCB', '12th - PCM', '12th - PCB', 'JEE', 'NEET', 'JKSSB'];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Registrations</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4 items-end">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, reg number, phone..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            const params = new URLSearchParams(searchParams.toString());
            if (e.target.value) params.set('status', e.target.value);
            else params.delete('status');
            params.delete('page');
            router.push(`/admin/registrations?${params}`);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="waitlisted">Waitlisted</option>
        </select>

        <select
          value={courseFilter}
          onChange={(e) => {
            setCourseFilter(e.target.value);
            const params = new URLSearchParams(searchParams.toString());
            if (e.target.value) params.set('course', e.target.value);
            else params.delete('course');
            params.delete('page');
            router.push(`/admin/registrations?${params}`);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
        >
          <option value="">All Courses</option>
          {courses.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No registrations found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Reg Number</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Course</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => (
                  <tr key={reg.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="py-3 px-4 text-sm font-mono text-gray-700">{reg.registration_number}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{reg.name}</div>
                      <div className="text-xs text-gray-500">{reg.mobile_number}</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{reg.course_program || '—'}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {reg.registration_date
                        ? new Date(reg.registration_date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[reg.status]}`}>
                        {reg.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedReg(reg)}
                          className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(reg.id)}
                          className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pagination && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 px-4 pb-4">
                <div className="text-sm text-gray-500">Showing {registrations.length} of {pagination.total}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Prev
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-700">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 flex items-center"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedReg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Registration Details</h2>
                <span className={`mt-1 inline-block px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[selectedReg.status]}`}>
                  {selectedReg.status}
                </span>
              </div>
              <button onClick={() => setSelectedReg(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
                ×
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Registration Number</div>
                  <div className="text-sm text-gray-900 font-medium mt-0.5">{selectedReg.registration_number}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Registration Date</div>
                  <div className="text-sm text-gray-900 font-medium mt-0.5">
                    {selectedReg.registration_date
                      ? new Date(selectedReg.registration_date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</div>
                  <div className="text-sm text-gray-900 font-medium mt-0.5">{selectedReg.name}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Father's/Guardian Name</div>
                  <div className="text-sm text-gray-900 font-medium mt-0.5">{selectedReg.father_guardian_name || '—'}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Gender</div>
                  <div className="text-sm text-gray-900 font-medium mt-0.5">{selectedReg.gender || '—'}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Current Class</div>
                  <div className="text-sm text-gray-900 font-medium mt-0.5">{selectedReg.current_class || '—'}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Mobile</div>
                  <div className="text-sm text-gray-900 font-medium mt-0.5">{selectedReg.mobile_number || '—'}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</div>
                  <div className="text-sm text-gray-900 font-medium mt-0.5">{selectedReg.email_address || '—'}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Course</div>
                  <div className="text-sm text-gray-900 font-medium mt-0.5">{selectedReg.course_program || '—'}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Batch Timing</div>
                  <div className="text-sm text-gray-900 font-medium mt-0.5">{selectedReg.batch_class_timing || '—'}</div>
                </div>
              </div>

              {selectedReg.status === 'pending' ? (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleStatusChange(selectedReg.id, 'approved')}
                    className="flex-1 py-3 rounded-xl font-semibold bg-green-100 hover:bg-green-200 text-green-800 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedReg.id, 'rejected')}
                    className="flex-1 py-3 rounded-xl font-semibold bg-red-100 hover:bg-red-200 text-red-800 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleDelete(selectedReg.id)}
                    className="flex-1 py-3 rounded-xl font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                   <button
                    onClick={() => handleDelete(selectedReg.id)}
                    className="flex-1 py-3 rounded-xl font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors"
                  >
                    Delete Registration
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RegistrationsLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

export default function RegistrationsPage() {
  return (
    <Suspense fallback={<RegistrationsLoading />}>
      <RegistrationsContent />
    </Suspense>
  );
}