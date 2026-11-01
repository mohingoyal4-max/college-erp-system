import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import {
  Users,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  GraduationCap,
  Mail,
  Phone,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [semester, setSemester] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'student123',
    rollNo: '',
    enrollmentNo: '',
    departmentId: '',
    semester: '4',
    section: 'A',
    batch: '2023-2027',
    phone: '',
    gender: 'Male',
    parentName: '',
    parentPhone: '',
    address: '',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (departmentId) params.departmentId = departmentId;
      if (semester) params.semester = semester;
      if (search) params.search = search;

      const res = await api.get('/students', { params });
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
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
    fetchStudents();
  }, [departmentId, semester, search]);

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      email: '',
      password: 'student123',
      rollNo: '',
      enrollmentNo: '',
      departmentId: departments[0]?.id ? String(departments[0].id) : '',
      semester: '4',
      section: 'A',
      batch: '2023-2027',
      phone: '',
      gender: 'Male',
      parentName: '',
      parentPhone: '',
      address: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (stu) => {
    setEditingStudent(stu);
    setFormData({
      name: stu.user.name,
      email: stu.user.email,
      departmentId: String(stu.departmentId),
      semester: String(stu.semester),
      section: stu.section,
      batch: stu.batch || '2023-2027',
      phone: stu.phone || '',
      gender: stu.gender || 'Male',
      parentName: stu.parentName || '',
      parentPhone: stu.parentPhone || '',
      address: stu.address || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      if (editingStudent) {
        await api.put(`/students/${editingStudent.id}`, formData);
      } else {
        await api.post('/students', formData);
      }
      setIsModalOpen(false);
      fetchStudents();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save student.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete student "${name}"? This removes their attendance & marks.`)) {
      try {
        await api.delete(`/students/${id}`);
        fetchStudents();
      } catch (err) {
        alert('Failed to delete student.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Directory</h1>
          <p className="text-xs text-slate-500">Manage enrolled student profiles, academic sections, and credentials</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md shadow-primary-500/20 transition hover:scale-[1.01] active:scale-[0.99] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, roll number, or enrollment number..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>

          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Student Details</th>
                <th className="px-6 py-3.5">Roll & Enrollment</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Sem & Section</th>
                <th className="px-6 py-3.5">Contact</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading students directory...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                students.map((stu) => (
                  <tr key={stu.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center shrink-0 text-xs">
                          {stu.user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{stu.user.name}</div>
                          <div className="text-[11px] text-slate-400">{stu.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-slate-800">{stu.rollNo}</div>
                      <div className="text-[11px] text-slate-400">{stu.enrollmentNo}</div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {stu.department.code}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-700">
                      Sem {stu.semester} • Sec {stu.section}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      <div>{stu.phone || '—'}</div>
                      {stu.parentName && (
                        <div className="text-[10px] text-slate-400">P: {stu.parentName}</div>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(stu)}
                        className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-slate-100 rounded-lg transition"
                        title="Edit Student"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(stu.id, stu.user.name)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Student"
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

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? `Edit Student: ${editingStudent.user.name}` : 'Register New Student'}
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
                placeholder="e.g. Rahul Sharma"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                disabled={!!editingStudent}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500 disabled:bg-slate-100"
                placeholder="student@erp.edu"
              />
            </div>
          </div>

          {!editingStudent && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Roll Number *</label>
                <input
                  type="text"
                  required
                  value={formData.rollNo}
                  onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500"
                  placeholder="CS2023-010"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Enrollment Number *</label>
                <input
                  type="text"
                  required
                  value={formData.enrollmentNo}
                  onChange={(e) => setFormData({ ...formData, enrollmentNo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500"
                  placeholder="ENR20230110"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Semester *</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500 bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Section *</label>
              <input
                type="text"
                required
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500"
                placeholder="A"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500"
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Parent Name</label>
              <input
                type="text"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500"
                placeholder="Parent / Guardian"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Parent Phone</label>
              <input
                type="text"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500"
                placeholder="+91 9876543211"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Residential Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500"
              placeholder="Full address"
            />
          </div>

          {!editingStudent && (
            <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              Default password will be initialized to <code className="font-mono text-primary-600 font-bold">student123</code>. The student can change it upon initial login.
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
              {isSubmitting ? 'Saving...' : editingStudent ? 'Update Student' : 'Create Student'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentsList;
