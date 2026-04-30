import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import CourseForm from '../components/CourseForm';
import { adminApi } from '../api/adminApi';

interface Course {
  id: number;
  category: string;
  program: string;
  batch_timing: string;
  is_active: boolean;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>();

  useEffect(() => { loadCourses(); }, []);

  const loadCourses = async () => {
    try { setCourses(await adminApi.getCourses()); }
    catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleEdit = (course: Course) => { setEditingCourse(course); setShowForm(true); };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this course?')) return;
    try { await adminApi.deleteCourse(id); loadCourses(); }
    catch (err: any) { setError(err.message); }
  };

  const handleAddNew = () => { setEditingCourse(undefined); setShowForm(true); };

  if (loading) return <AdminLayout><div className="text-center py-12 text-gray-500">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">{courses.length} Course{courses.length !== 1 ? 's' : ''}</h3>
          <button onClick={handleAddNew}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold rounded-lg transition-colors">
            + Add Course
          </button>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Category</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Program</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Timing</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="py-3 px-4 text-sm text-gray-800 font-medium">{course.category}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{course.program}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{course.batch_timing || '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${course.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {course.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(course)}
                        className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">Edit</button>
                      <button onClick={() => handleDelete(course.id)}
                        className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-gray-500">No courses yet. Click "Add Course" to create one.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{editingCourse ? 'Edit Course' : 'Add New Course'}</h2>
              <CourseForm course={editingCourse} onSave={() => { setShowForm(false); loadCourses(); }} onCancel={() => setShowForm(false)} />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
