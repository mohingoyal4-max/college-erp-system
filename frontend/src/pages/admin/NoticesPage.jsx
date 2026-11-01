import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import { BellRing, Plus, Trash2, Calendar, User, Tag } from 'lucide-react';

const NoticesPage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetRole: 'ALL',
    category: 'GENERAL',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notices');
      if (res.data.success) {
        setNotices(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    try {
      await api.post('/notices', formData);
      setIsModalOpen(false);
      fetchNotices();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to post notice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this notice?')) {
      try {
        await api.delete(`/notices/${id}`);
        fetchNotices();
      } catch (err) {
        alert('Failed to delete notice.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Campus Notices & Circulars</h1>
          <p className="text-xs text-slate-500">Official bulletins broadcasted to faculties, students, or campus wide</p>
        </div>

        <button
          onClick={() => {
            setFormData({ title: '', content: '', targetRole: 'ALL', category: 'GENERAL' });
            setFormError('');
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md shadow-primary-500/20 transition hover:scale-[1.01] active:scale-[0.99] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Notice</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading announcements...
          </div>
        ) : notices.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            No notices published yet.
          </div>
        ) : (
          notices.map((n) => (
            <div
              key={n.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-primary-50 text-primary-700 border border-primary-100">
                      {n.category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-slate-100 text-slate-600">
                      Target: {n.targetRole}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDelete(n.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">{n.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{n.content}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>By {n.author?.name || 'Administrator'}</span>
                <span>{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish Campus Announcement"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notice Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. Schedule for End-Term Practical Examinations"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="GENERAL">General Notice</option>
                <option value="EXAM">Examination</option>
                <option value="ACADEMIC">Academic / Syllabus</option>
                <option value="HOLIDAY">Holiday & Events</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience *</label>
              <select
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="ALL">All Campus (Everyone)</option>
                <option value="STUDENT">Students Only</option>
                <option value="FACULTY">Faculty Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notice Content *</label>
            <textarea
              rows={4}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500"
              placeholder="Write circular description here..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md shadow-primary-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Notice'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default NoticesPage;
