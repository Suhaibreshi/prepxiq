const API_BASE = '/admin/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('prepxiq_admin_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('prepxiq_admin_token');
    localStorage.removeItem('prepxiq_admin_user');
    window.location.href = '/admin/login';
    throw new Error('Unauthorized');
  }

  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Request failed');
  return json.data;
}

export const adminApi = {
  login: (username: string, password: string) =>
    fetch('/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }).then(r => r.json()),

  logout: () => fetch('/admin/logout', { method: 'POST' }),

  getMe: () => request<{ username: string }>('/me'),

  getStats: () =>
    request<{
      total: number; pending: number; approved: number; rejected: number;
      waitlisted: number; thisMonth: number; lastMonth: number;
    }>('/stats'),

  getRegistrations: (params: {
    page?: number; limit?: number; status?: string; search?: string;
    course?: string; dateFrom?: string; dateTo?: string;
  }) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== 'all') qs.set(k, String(v));
    });
    return request<{
      data: any[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/registrations?${qs}`);
  },

  getRegistration: (id: number) => request<any>(`/registrations/${id}`),

  updateStatus: (id: number, status: string) =>
    fetch(`/api/registrations/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('prepxiq_admin_token')}`,
      },
      body: JSON.stringify({ status }),
    }).then(r => r.json()),

  getCourses: () => request<any[]>('/courses'),

  createCourse: (data: { category: string; program: string; batch_timing?: string; is_active?: boolean }) =>
    fetch('/admin/api/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('prepxiq_admin_token')}`,
      },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  updateCourse: (id: number, data: { category: string; program: string; batch_timing?: string; is_active?: boolean }) =>
    fetch(`/admin/api/courses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('prepxiq_admin_token')}`,
      },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  deleteCourse: (id: number) =>
    fetch(`/admin/api/courses/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('prepxiq_admin_token')}`,
      },
    }).then(r => r.json()),

  exportCsv: (params: { status?: string; search?: string; course?: string; dateFrom?: string; dateTo?: string }) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v && v !== 'all') qs.set(k, String(v));
    });
    const token = localStorage.getItem('prepxiq_admin_token');
    window.open(`/admin/api/export/csv?${qs}`, '_blank');
  },
};
