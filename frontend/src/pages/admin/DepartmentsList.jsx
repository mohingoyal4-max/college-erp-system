import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import { Building2, Plus, Edit, Trash2, Users, UserCheck, BookOpen } from 'lucide-react';

const DepartmentsList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/departments');
      if (res.data.success) {
        setDepartments(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenAdd = () => {
    setEditingDept(null);
    setFormData({ name: '', code: '', description: '' });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      if (editingDept) {
        await api.put(`/departments/${editingDept.id}`, formData);
      } else {
        await api.post('/departments', formData);
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save department.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This cascades to related courses and records.`)) {
      try {
        await api.delete(`/departments/${id}`);
        fetchDepartments();
      } catch (err) {
        alert('Failed to delete department.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Academic Departments</h1>
          <p className="text-xs text-slate-500">Manage institutional colleges, branches, and schools</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md shadow-primary-500/20 transition hover:scale-[1.01] active:scale-[0.99] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading departments...
          </div>
        ) : departments.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            No departments found. Click "Add Department" to create one.
          </div>
        ) : (
          departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-primary-50 text-primary-700 border border-primary-100">
                    {dept.code}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(dept)}
                      className="p-1.5 text-slate-400 hover:text-primary-600 rounded-lg hover:bg-slate-100 transition"
                      title="Edit Department"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(dept.id, dept.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Delete Department"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2">{dept.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                  {dept.description || 'No detailed department description provided.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="block text-sm font-extrabold text-slate-900">
                    {dept._count?.students || 0}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Students</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="block text-sm font-extrabold text-slate-900">
                    {dept._count?.faculty || 0}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Faculty</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="block text-sm font-extrabold text-slate-900">
                    {dept._count?.subjects || 0}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Courses</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? `Edit Department: ${editingDept.code}` : 'Add New Department'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Department Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. Computer Science & Engineering"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Department Code *</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. CSE"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500"
              placeholder="Brief overview of programs offered..."
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
              {isSubmitting ? 'Saving...' : editingDept ? 'Update Department' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DepartmentsList;
