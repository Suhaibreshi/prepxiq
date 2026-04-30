import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import StatsCard from '../components/StatsCard';
import { adminApi } from '../api/adminApi';

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  waitlisted: number;
  thisMonth: number;
  lastMonth: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      </AdminLayout>
    );
  }

  const monthChange = stats && stats.lastMonth > 0
    ? ((stats.thisMonth - stats.lastMonth) / stats.lastMonth * 100).toFixed(1)
    : null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard label="Total Registrations" value={stats?.total ?? 0} icon="👥" bgColor="bg-blue-100" />
          <StatsCard label="Pending Review" value={stats?.pending ?? 0} icon="⏳" bgColor="bg-amber-100" textColor="text-amber-700" />
          <StatsCard label="Approved" value={stats?.approved ?? 0} icon="✅" bgColor="bg-green-100" textColor="text-green-700" />
          <StatsCard label="Rejected" value={stats?.rejected ?? 0} icon="❌" bgColor="bg-red-100" textColor="text-red-700" />
        </div>
        <div className="flex gap-4 flex-wrap">
          <Link to="/admin/registrations?status=pending"
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-2">
            ⏳ Review {stats?.pending ?? 0} Pending
          </Link>
          <Link to="/admin/registrations"
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-2">
            📋 View All Registrations
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">This Month</h3>
          <div className="flex items-center gap-6">
            <div>
              <div className="text-3xl font-bold text-gray-900">{stats?.thisMonth ?? 0}</div>
              <div className="text-sm text-gray-500">Registrations this month</div>
            </div>
            {monthChange !== null && (
              <div className={`text-sm font-medium ${parseFloat(monthChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {parseFloat(monthChange) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(monthChange))}% vs last month
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
