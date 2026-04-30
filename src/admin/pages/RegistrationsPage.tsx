import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import RegistrationTable from '../components/RegistrationTable';
import RegistrationDetailModal from '../components/RegistrationDetailModal';
import { adminApi } from '../api/adminApi';

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [selectedReg, setSelectedReg] = useState<any>(null);

  useEffect(() => {
    loadRegistrations();
  }, [page, statusFilter, courseFilter]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const statusParam = params.get('status');
    if (statusParam) setStatusFilter(statusParam);
  }, []);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getRegistrations({ page, limit: 20, status: statusFilter, course: courseFilter, search });
      setRegistrations(data.data);
      setPagination(data.pagination);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleView = async (id: number) => {
    try {
      const reg = await adminApi.getRegistration(id);
      setSelectedReg(reg);
    } catch (err: any) { setError(err.message); }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadRegistrations();
  };

  const courses = ['6th Class','7th Class','8th Class','9th Class','10th Class','11th - PCM','11th - PCB','12th - PCM','12th - PCB','JEE','NEET','JKSSB'];

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4 items-end">
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px]">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, reg number, phone..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none" />
          </form>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="waitlisted">Waitlisted</option>
          </select>
          <select value={courseFilter} onChange={e => { setCourseFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none">
            <option value="">All Courses</option>
            {courses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={() => adminApi.exportCsv({ status: statusFilter, search, course: courseFilter })}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
            📥 Export CSV
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
          <RegistrationTable registrations={registrations} loading={loading}
            onView={handleView} onPageChange={setPage} pagination={pagination} />
        </div>
      </div>
      {selectedReg && (
        <RegistrationDetailModal registration={selectedReg} onClose={() => setSelectedReg(null)} onUpdated={loadRegistrations} />
      )}
    </AdminLayout>
  );
}
