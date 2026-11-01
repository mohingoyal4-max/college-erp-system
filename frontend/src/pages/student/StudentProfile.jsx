import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, MapPin, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

const StudentProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState(null);
  const [isUpdatingPwd, setIsUpdatingPwd] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setProfile(res.data.user);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg(null);

    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setPwdMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    try {
      setIsUpdatingPwd(true);
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      if (res.data.success) {
        setPwdMsg({ type: 'success', text: 'Password updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPwdMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update password.',
      });
    } finally {
      setIsUpdatingPwd(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        Loading profile...
      </div>
    );
  }

  const stu = profile?.studentProfile || {};

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Profile</h1>
        <p className="text-xs text-slate-500">Institutional registration details and credential management</p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-slate-100">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary-600 to-sky-400 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-primary-500/20 shrink-0">
            {profile?.name?.charAt(0) || 'S'}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-extrabold text-slate-900">{profile?.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{profile?.email}</p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200">
                Roll: {stu.rollNo}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                Enrollment: {stu.enrollmentNo}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {stu.department?.name || 'Computer Science'}
              </span>
            </div>
          </div>
        </div>

        {/* Academic & Personal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Academic Details
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Department</span>
                <strong className="text-slate-800">{stu.department?.name} ({stu.department?.code})</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Semester & Section</span>
                <strong className="text-slate-800">Semester {stu.semester} • Section {stu.section}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Academic Batch</span>
                <strong className="text-slate-800">{stu.batch}</strong>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Personal & Guardian Details
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Phone Number</span>
                <strong className="text-slate-800">{stu.phone || '—'}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Gender</span>
                <strong className="text-slate-800">{stu.gender || '—'}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Parent / Guardian</span>
                <strong className="text-slate-800">{stu.parentName || '—'}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Parent Contact</span>
                <strong className="text-slate-800">{stu.parentPhone || '—'}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Address</span>
                <strong className="text-slate-800">{stu.address || '—'}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-1">Security & Password</h3>
        <p className="text-xs text-slate-500 mb-4">Update your ERP access credentials</p>

        {pwdMsg && (
          <div
            className={`p-3 rounded-xl text-xs font-bold border mb-4 flex items-center gap-2 ${
              pwdMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {pwdMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{pwdMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Current Password *</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">New Password *</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password *</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500"
              placeholder="Re-enter new password"
            />
          </div>

          <button
            type="submit"
            disabled={isUpdatingPwd}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
          >
            {isUpdatingPwd ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentProfile;
