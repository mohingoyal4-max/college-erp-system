import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit,
  UserCheck,
  Building2,
  Layers,
  Sparkles,
} from 'lucide-react';

const SubjectsList = () => {
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [departmentId, setDepartmentId] = useState('');
  const [semester, setSemester] = useState('');

  // Subject Modal
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    departmentId: '',
    semester: '4',
    credits: '3',
    type: 'Theory',
  });

  // Assign Faculty Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    subjectId: '',
    facultyId: '',
    section: 'A',
    academicYear: '2025-2026',
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (departmentId) params.departmentId = departmentId;
      if (semester) params.semester = semester;

      const [subRes, deptRes, facRes] = await Promise.all([
        api.get('/subjects', { params }),
        api.get('/departments'),
        api.get('/faculty'),
      ]);

      if (subRes.data.success) setSubjects(subRes.data.data);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
      if (facRes.data.success) setFacultyList(facRes.data.data);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [departmentId, semester]);

  const handleOpenAddSubject = () => {
    setEditingSubject(null);
    setSubjectForm({
      name: '',
      code: '',
      departmentId: departments[0]?.id ? String(departments[0].id) : '',
      semester: '4',
      credits: '3',
      type: 'Theory',
    });
    setFormError('');
    setIsSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (sub) => {
    setEditingSubject(sub);
    setSubjectForm({
      name: sub.name,
      code: sub.code,
      departmentId: String(sub.departmentId),
      semester: String(sub.semester),
      credits: String(sub.credits),
      type: sub.type,
    });
    setFormError('');
    setIsSubjectModalOpen(true);
  };

  const handleOpenAssign = (sub) => {
    setAssignForm({
      subjectId: String(sub.id),
      facultyId: facultyList[0]?.id ? String(facultyList[0].id) : '',
      section: 'A',
      academicYear: '2025-2026',
    });
    setFormError('');
    setIsAssignModalOpen(true);
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    try {
      if (editingSubject) {
        await api.put(`/subjects/${editingSubject.id}`, subjectForm);
      } else {
        await api.post('/subjects', subjectForm);
      }
      setIsSubjectModalOpen(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save subject.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAssign = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    try {
      await api.post('/subjects/assign', assignForm);
      setIsAssignModalOpen(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to assign faculty.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubject = async (id, name) => {
    if (window.confirm(`Delete subject "${name}"?`)) {
      try {
        await api.delete(`/subjects/${id}`);
        fetchData();
      } catch (err) {
        alert('Failed to delete subject.');
      }
    }
  };

  const handleRemoveAssignment = async (assignId) => {
    if (window.confirm('Remove this faculty assignment?')) {
      try {
        await api.delete(`/subjects/assign/${assignId}`);
        fetchData();
      } catch (err) {
        alert('Failed to remove assignment.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Curriculum & Subjects</h1>
          <p className="text-xs text-slate-500">Manage courses, credit weights, and faculty teaching assignments</p>
        </div>

        <button
          onClick={handleOpenAddSubject}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md shadow-primary-500/20 transition hover:scale-[1.01] active:scale-[0.99] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center gap-3">
        <select
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:ring-2 focus:ring-primary-500 bg-white"
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
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:ring-2 focus:ring-primary-500 bg-white"
        >
          <option value="">All Semesters</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <option key={s} value={s}>
              Semester {s}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Code & Subject Name</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Semester & Credits</th>
                <th className="px-6 py-3.5">Assigned Instructors</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading subjects...
                  </td>
                </tr>
              ) : subjects.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                    No subjects found.
                  </td>
                </tr>
              ) : (
                subjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-extrabold text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 font-mono">
                          {sub.code}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900">{sub.name}</div>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">
                            {sub.type}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-700">
                      {sub.department.code}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-slate-800">Sem {sub.semester}</div>
                      <div className="text-[11px] text-slate-500">{sub.credits} Credits</div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {sub.assignments?.map((a) => (
                          <span
                            key={a.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                          >
                            <span>{a.faculty.user.name} (Sec {a.section})</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveAssignment(a.id)}
                              className="text-emerald-500 hover:text-rose-600 ml-0.5"
                              title="Remove Assignment"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        <button
                          onClick={() => handleOpenAssign(sub)}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 border border-primary-200 transition"
                        >
                          + Assign
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditSubject(sub)}
                        className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-slate-100 rounded-lg transition"
                        title="Edit Subject"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubject(sub.id, sub.name)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Subject"
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

      {/* Add / Edit Subject Modal */}
      <Modal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        title={editingSubject ? `Edit Subject: ${editingSubject.code}` : 'Add New Curriculum Subject'}
      >
        <form onSubmit={handleSaveSubject} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subject Name *</label>
            <input
              type="text"
              required
              value={subjectForm.name}
              onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. Compiler Design"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Course Code *</label>
              <input
                type="text"
                required
                value={subjectForm.code}
                onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500"
                placeholder="CS501"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department *</label>
              <select
                required
                value={subjectForm.departmentId}
                onChange={(e) => setSubjectForm({ ...subjectForm, departmentId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500 bg-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Semester *</label>
              <select
                value={subjectForm.semester}
                onChange={(e) => setSubjectForm({ ...subjectForm, semester: e.target.value })}
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Credits *</label>
              <input
                type="number"
                min="1"
                max="8"
                required
                value={subjectForm.credits}
                onChange={(e) => setSubjectForm({ ...subjectForm, credits: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Type *</label>
              <select
                value={subjectForm.type}
                onChange={(e) => setSubjectForm({ ...subjectForm, type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="Theory">Theory</option>
                <option value="Practical">Practical / Lab</option>
                <option value="Elective">Elective</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSubjectModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md shadow-primary-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingSubject ? 'Update Subject' : 'Add Subject'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Faculty Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Faculty Instructor"
      >
        <form onSubmit={handleSaveAssign} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Faculty *</label>
            <select
              required
              value={assignForm.facultyId}
              onChange={(e) => setAssignForm({ ...assignForm, facultyId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500 bg-white"
            >
              {facultyList.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.user.name} ({f.employeeId} • {f.department.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Class Section *</label>
              <input
                type="text"
                required
                value={assignForm.section}
                onChange={(e) => setAssignForm({ ...assignForm, section: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500"
                placeholder="A"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
              <input
                type="text"
                value={assignForm.academicYear}
                onChange={(e) => setAssignForm({ ...assignForm, academicYear: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500"
                placeholder="2025-2026"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md shadow-primary-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Assigning...' : 'Assign Instructor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SubjectsList;
