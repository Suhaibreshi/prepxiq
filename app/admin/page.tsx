'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Users, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  waitlisted: number;
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login/admin');
      return;
    }
    if (status === 'authenticated') {
      fetchStats();
    }
  }, [status, router]);

  const fetchStats = () => {
    fetch('/api/admin/dashboard/stats')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        if (data.success) setStats(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Stats fetch error:', err);
        setError(err.message);
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-2 text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Registrations', value: stats?.total || 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Pending', value: stats?.pending || 0, icon: Clock, color: 'bg-yellow-500' },
    { label: 'Approved', value: stats?.approved || 0, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Rejected', value: stats?.rejected || 0, icon: XCircle, color: 'bg-red-500' },
    { label: 'Waitlisted', value: stats?.waitlisted || 0, icon: Clock, color: 'bg-purple-500' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex gap-4">
          <Link
            href="/admin/registrations"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
          >
            View All Registrations
          </Link>
          <Link
            href="/admin/courses"
            className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            Manage Courses
          </Link>
        </div>
      </div>
    </div>
  );
}