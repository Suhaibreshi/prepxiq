import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { adminApi } from '../api/adminApi';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/registrations', label: 'Registrations', icon: '📋' },
  { path: '/admin/courses', label: 'Courses', icon: '📚' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const username = localStorage.getItem('prepxiq_admin_user') || 'Admin';

  const handleLogout = async () => {
    await adminApi.logout();
    localStorage.removeItem('prepxiq_admin_token');
    localStorage.removeItem('prepxiq_admin_user');
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-yellow-400">PREPX IQ</h1>
          <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                location.pathname === item.path
                  ? 'bg-yellow-500 text-gray-900 font-semibold'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="text-sm text-gray-400 mb-2">{username}</div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b px-8 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            {navItems.find(n => n.path === location.pathname)?.label || 'Dashboard'}
          </h2>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
