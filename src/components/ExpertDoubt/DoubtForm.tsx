import { useState } from 'react';
import { Send, X } from 'lucide-react';

interface DoubtFormProps {
  onSubmit: (doubt: { subject: string; topic: string; question: string; attachments: string[] }) => void;
  onClose: () => void;
}

export default function DoubtForm({ onSubmit, onClose }: DoubtFormProps) {
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    question: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.subject && formData.topic && formData.question) {
      onSubmit({
        ...formData,
        attachments: [],
      });
      setFormData({ subject: '', topic: '', question: '' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-2xl w-full p-4 sm:p-8 max-h-[90vh] sm:max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Raise Your Doubt</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="sm:size-{24} text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2">
              Select Subject *
            </label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
            >
              <option value="">Choose a subject</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="English">English</option>
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2">
              Topic/Chapter *
            </label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="e.g., Quadratic Equations"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2">
              Your Question *
            </label>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="Describe your doubt..."
              rows={4}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
              required
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-blue-800">
              💡 <span className="font-semibold">Tip:</span> Be specific for faster response from experts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Send size={16} className="sm:size-{18}" />
              Submit Question
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-900 py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm sm:text-base"
      </div>
    </div>
  );
}
