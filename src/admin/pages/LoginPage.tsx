import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api/adminApi';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await adminApi.login(username, password);
      if (res.success && res.token) {
        localStorage.setItem('prepxiq_admin_token', res.token);
        localStorage.setItem('prepxiq_admin_user', res.username);
        navigate('/admin');
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-2 bg-yellow-500 rounded-xl mb-4">
            <span className="text-xl font-bold text-gray-900">PREPX IQ</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-500 mt-2">Sign in to access the admin panel</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
              placeholder="Enter username" required autoComplete="username" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
              placeholder="Enter password" required autoComplete="current-password" />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-colors">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
