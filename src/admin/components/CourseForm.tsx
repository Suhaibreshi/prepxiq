import { useState } from 'react';
import { adminApi } from '../api/adminApi';

interface Course {
  id: number;
  category: string;
  program: string;
  batch_timing: string;
  is_active: boolean;
}

interface Props {
  course?: Course;
  onSave: () => void;
  onCancel: () => void;
}

const CATEGORIES = ['Foundation', 'Science', 'Arts', 'Commerce', 'Competitive'];

export default function CourseForm({ course, onSave, onCancel }: Props) {
  const [category, setCategory] = useState(course?.category || '');
  const [program, setProgram] = useState(course?.program || '');
  const [batchTiming, setBatchTiming] = useState(course?.batch_timing || '');
  const [isActive, setIsActive] = useState(course?.is_active ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const payload = { category, program, batch_timing: batchTiming, is_active: isActive };
      if (course) await adminApi.updateCourse(course.id, payload);
      else await adminApi.createCourse(payload);
      onSave();
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select value={category} onChange={e => setCategory(e.target.value)} required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none">
          <option value="">Select category</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
        <input type="text" value={program} onChange={e => setProgram(e.target.value)} required placeholder="e.g. 11th - PCM"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Batch Timing</label>
        <input type="text" value={batchTiming} onChange={e => setBatchTiming(e.target.value)} placeholder="e.g. Morning, Evening"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none" />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="is_active" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
        <label htmlFor="is_active" className="text-sm text-gray-700">Active</label>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={loading}
          className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-colors">
          {loading ? 'Saving...' : course ? 'Update Course' : 'Add Course'}
        </button>
        <button type="button" onClick={onCancel}
          className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors">Cancel</button>
      </div>
    </form>
  );
}
