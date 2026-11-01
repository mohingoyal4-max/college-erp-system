import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Edit,
  UserPlus,
  Users,
  CheckSquare,
  Square,
  Lock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

const AVAILABLE_PERMISSIONS = [
  { key: 'view_students', label: 'View Students Directory', category: 'Students' },
  { key: 'manage_students', label: 'Add/Edit/Delete Students', category: 'Students' },
  { key: 'view_faculty', label: 'View Faculty Directory', category: 'Faculty' },
  { key: 'manage_faculty', label: 'Add/Edit/Delete Faculty', category: 'Faculty' },
  { key: 'view_attendance', label: 'View Lecture Attendance', category: 'Attendance' },
  { key: 'manage_attendance', label: 'Mark Class Attendance', category: 'Attendance' },
  { key: 'view_marks', label: 'View Examination Marks', category: 'Marks & Grading' },
  { key: 'manage_marks', label: 'Enter & Save Marks', category: 'Marks & Grading' },
  { key: 'view_departments', label: 'View Departments', category: 'Academic' },
  { key: 'manage_departments', label: 'Manage Departments', category: 'Academic' },
  { key: 'view_subjects', label: 'View Subjects Curriculum', category: 'Academic' },
  { key: 'manage_subjects', label: 'Add Subjects & Assign Faculty', category: 'Academic' },
  { key: 'view_notices', label: 'View Campus Notices', category: 'Notices' },
  { key: 'manage_notices', label: 'Post Campus Notices', category: 'Notices' },
];

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Role Modal
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: [],
  });

  // Create User for Role Modal
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
  });

  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/roles');
      if (res.data.success) {
        setRoles(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleOpenAddRole = () => {
    setEditingRole(null);
    setRoleForm({
      name: '',
      displayName: '',
      description: '',
      permissions: ['view_students', 'view_attendance', 'view_marks', 'view_notices'],
    });
    setFormError('');
    setIsRoleModalOpen(true);
  };

  const handleOpenEditRole = (role) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      displayName: role.displayName,
      description: role.description || '',
      permissions: role.permissions || [],
    });
    setFormError('');
    setIsRoleModalOpen(true);
  };

  const handleOpenCreateUser = (role) => {
    setUserForm({
      name: '',
      email: '',
      password: 'password123',
      role: role.name,
    });
    setFormError('');
    setIsUserModalOpen(true);
  };

  const togglePermission = (key) => {
    setRoleForm((prev) => {
      const exists = prev.permissions.includes(key);
      if (exists) {
        return { ...prev, permissions: prev.permissions.filter((p) => p !== key) };
      } else {
        return { ...prev, permissions: [...prev.permissions, key] };
      }
    });
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    try {
      if (editingRole) {
        await api.put(`/roles/${editingRole.id}`, roleForm);
        setSuccessMsg(`Role ${roleForm.displayName} updated successfully.`);
      } else {
        await api.post('/roles', roleForm);
        setSuccessMsg(`New Role "${roleForm.displayName}" created! You can now assign users to this role.`);
      }
      setIsRoleModalOpen(false);
      fetchRoles();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save role.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    try {
      await api.post('/roles/create-user', userForm);
      setSuccessMsg(`User "${userForm.name}" created with role "${userForm.role}".`);
      setIsUserModalOpen(false);
      fetchRoles();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create user for role.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async (role) => {
    if (role.isSystem) {
      alert('System roles cannot be deleted.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete role "${role.displayName}"?`)) {
      try {
        await api.delete(`/roles/${role.id}`);
        fetchRoles();
        setSuccessMsg(`Role "${role.name}" deleted.`);
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete role.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Role & Permission Management</h1>
          <p className="text-xs text-slate-500">Create new customized institutional roles, configure access permissions, and assign users</p>
        </div>

        <button
          onClick={handleOpenAddRole}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md shadow-primary-500/20 transition hover:scale-[1.01] active:scale-[0.99] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Role</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading role configurations...
          </div>
        ) : (
          roles.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200">
                    {r.name}
                  </span>
                  <div className="flex items-center gap-1">
                    {r.isSystem ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                        <Lock className="w-2.5 h-2.5" /> Built-in
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleOpenEditRole(r)}
                          className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-slate-100 rounded-lg transition"
                          title="Edit Permissions"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRole(r)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Role"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">{r.displayName}</h3>
                <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                  {r.description || 'Custom institutional role'}
                </p>

                {/* Permissions Badges */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Granted Permissions ({r.permissions?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                    {r.permissions?.map((p) => (
                      <span
                        key={p}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-primary-50 text-primary-700 border border-primary-100"
                      >
                        {p.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  <strong className="text-slate-900 font-bold">{r.userCount}</strong> Active Users
                </span>

                <button
                  onClick={() => handleOpenCreateUser(r)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add User</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Role Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title={editingRole ? `Configure Role: ${editingRole.displayName}` : 'Create New Custom Role'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveRole} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Role Code / Identifier *
              </label>
              <input
                type="text"
                required
                disabled={!!editingRole}
                value={roleForm.name}
                onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-primary-500 disabled:bg-slate-100"
                placeholder="e.g. LIBRARIAN or WARDEN"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Display Title *
              </label>
              <input
                type="text"
                required
                value={roleForm.displayName}
                onChange={(e) => setRoleForm({ ...roleForm, displayName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. Head Librarian"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Role Description</label>
            <input
              type="text"
              value={roleForm.description}
              onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-primary-500"
              placeholder="Responsibilities and access scope of this role..."
            />
          </div>

          {/* Granular Permissions Checkbox List */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Select Permissions ({roleForm.permissions.length} selected)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-3 rounded-xl border border-slate-200 bg-slate-50/50">
              {AVAILABLE_PERMISSIONS.map((perm) => {
                const isChecked = roleForm.permissions.includes(perm.key);
                return (
                  <button
                    key={perm.key}
                    type="button"
                    onClick={() => togglePermission(perm.key)}
                    className={`flex items-center gap-2.5 p-2 rounded-lg text-left text-xs transition border ${
                      isChecked
                        ? 'bg-primary-50 border-primary-200 text-primary-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-primary-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                    <div>
                      <div className="text-[11px] leading-tight">{perm.label}</div>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider">
                        {perm.category}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRoleModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md shadow-primary-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingRole ? 'Update Role' : 'Create Custom Role'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Create User for Role Modal */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title={`Add User with Role: ${userForm.role}`}
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. Ramesh Chandra"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500"
              placeholder="officer@erp.edu"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
            <input
              type="password"
              required
              value={userForm.password}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500"
              placeholder="••••••••"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsUserModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md shadow-primary-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RoleManagement;
