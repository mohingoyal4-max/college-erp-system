import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import {
  UserCheck,
  Search,
  Plus,
  Trash2,
  Edit,
  Mail,
  Phone,
  BookOpen,
  Building2,
  Briefcase,
} from 'lucide-react';

const FacultyList = () => {
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'faculty123',
    employeeId: '',
    departmentId: '',
    designation: 'Assistant Professor',
    qualification: '',
    phone: '',
    officeRoom: '',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const params = {};
      if (departmentId) params.departmentId = departmentId;
      if (search) params.search = search;

      const res = await api.get('/faculty', { params });
      if (res.data.success) {
        setFaculty(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching faculty:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      if (res.data.success) {
        setDepartments(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchFaculty();
  }, [departmentId, search]);

  const handleOpenAdd = () => {
    setEditingFaculty(null);
    setFormData({
      name: '',
      email: '',
      password: 'faculty123',
      employeeId: '',
      departmentId: departments[0]?.id ? String(departments[0].id) : '',
      designation: 'Assistant Professor',
      qualification: 'M.Tech / Ph.D.',
      phone: '',
      officeRoom: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (fac) => {
    setEditingFaculty(fac);
    setFormData({
      name: fac.user.name,
      email: fac.user.email,
      departmentId: String(fac.departmentId),
      designation: fac.designation,
      qualification: fac.qualification,
      phone: fac.phone || '',
      officeRoom: fac.officeRoom || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      if (editingFaculty) {
        await api.put(`/faculty/${editingFaculty.id}`, formData);
      } else {
        await api.post('/faculty', formData);
      }
      setIsModalOpen(false);
      fetchFaculty();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save faculty.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete faculty "${name}"?`)) {
      try {
        await api.delete(`/faculty/${id}`);
        fetchFaculty();
      } catch (err) {
        alert('Failed to delete faculty member.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Faculty Directory</h1>
          <p className="text-xs text-slate-500">Manage teaching staff, professorships, and course assignments</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md shadow-primary-500/20 transition hover:scale-[1.01] active:scale-[0.99] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Faculty Member</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by faculty name, employee ID, or designation..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <select
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white w-full md:w-auto"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.code})
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Faculty Member</th>
                <th className="px-6 py-3.5">Employee ID</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Designation & Qualifications</th>
                <th className="px-6 py-3.5">Assigned Courses</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading faculty directory...
                  </td>
                </tr>
              ) : faculty.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                    No faculty found matching your search.
                  </td>
                </tr>
              ) : (
                faculty.map((fac) => (
                  <tr key={fac.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                          {fac.user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{fac.user.name}</div>
                          <div className="text-[11px] text-slate-400">{fac.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-800">{fac.employeeId}</td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {fac.department.code}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="font-bold text-slate-800">{fac.designation}</div>
                      <div className="text-[11px] text-slate-500">{fac.qualification}</div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {fac.assignments?.length > 0 ? (
                          fac.assignments.map((a) => (
                            <span
                              key={a.id}
                              className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-primary-50 text-primary-700 border border-primary-100"
                            >
                              {a.subject.code} (Sec {a.section})
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-[11px]">No active classes</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(fac)}
                        className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-slate-100 rounded-lg transition"
                        title="Edit Faculty"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(fac.id, fac.user.name)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Faculty"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Faculty Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFaculty ? `Edit Faculty: ${editingFaculty.user.name}` : 'Register New Faculty Member'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500"
                placeholder="Dr. Rajesh Patel"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                disabled={!!editingFaculty}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500 disabled:bg-slate-100"
                placeholder="faculty@erp.edu"
              />
            </div>
          </div>

          {!editingFaculty && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Employee ID *</label>
              <input
                type="text"
                required
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500"
                placeholder="FAC-CSE-05"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department *</label>
              <select
                required
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500 bg-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Designation *</label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500"
                placeholder="Associate Professor"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Academic Qualifications *</label>
            <input
              type="text"
              required
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500"
              placeholder="Ph.D. in Computer Science"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500"
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Office Room</label>
              <input
                type="text"
                value={formData.officeRoom}
                onChange={(e) => setFormData({ ...formData, officeRoom: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500"
                placeholder="Block B, Room 301"
              />
            </div>
          </div>

          {!editingFaculty && (
            <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              Default password will be initialized to <code className="font-mono text-emerald-600 font-bold">faculty123</code>.
            </p>
          )}

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
              {isSubmitting ? 'Saving...' : editingFaculty ? 'Update Faculty' : 'Create Faculty'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FacultyList;
