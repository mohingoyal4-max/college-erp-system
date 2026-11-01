import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Users,
  UserCheck,
  CalendarCheck,
  Award,
  Building2,
  BookOpen,
  BellRing,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomPortalDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const permissions = user?.permissions || [];

  const hasPermission = (key) => {
    if (user?.role === 'ADMIN') return true;
    return permissions.includes(key);
  };

  useEffect(() => {
    const fetchPortalData = async () => {
      try {
        setLoading(true);
        const [dashRes, noticeRes] = await Promise.all([
          api.get('/dashboard/admin').catch(() => ({ data: { success: false } })),
          api.get('/notices'),
        ]);

        if (dashRes.data?.success) {
          setStats(dashRes.data.stats);
        }
        if (noticeRes.data?.success) {
          setNotices(noticeRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load custom portal data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortalData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-500/20 text-primary-300 border border-primary-400/30">
            {user?.roleDisplayName || user?.role} Dashboard
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold mt-3 tracking-tight">
            Welcome, {user?.name}
          </h1>
          <p className="text-slate-300 text-xs md:text-sm mt-1.5 leading-relaxed">
            You are logged in with the customized role <strong className="text-white font-mono">{user?.role}</strong> ({user?.roleDisplayName}). Below are the sections and academic modules accessible under your permission scope.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value={stats.totalStudents || 0}
            subtitle="Campus enrollment"
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Faculty Members"
            value={stats.totalFaculty || 0}
            subtitle="Active teaching staff"
            icon={UserCheck}
            color="emerald"
          />
          <StatCard
            title="Attendance Rate"
            value={`${stats.overallAttendance || 0}%`}
            subtitle="College average"
            icon={CalendarCheck}
            color={stats.overallAttendance >= 75 ? 'emerald' : 'amber'}
          />
          <StatCard
            title="Departments"
            value={stats.totalDepartments || 0}
            subtitle="Academic schools"
            icon={Building2}
            color="purple"
          />
        </div>
      )}

      {/* Dynamic Accessible Modules Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-1">Your Accessible ERP Modules</h2>
        <p className="text-xs text-slate-500 mb-5">Click any module to manage institutional data</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hasPermission('view_students') && (
            <Link
              to="/admin/students"
              className="p-5 rounded-2xl border border-slate-200 hover:border-primary-300 hover:shadow-md transition bg-gradient-to-br from-blue-50/30 to-white flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Student Directory</h3>
                <p className="text-xs text-slate-500 mt-1">Browse student profiles, rolls, and sections</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-primary-600 group-hover:translate-x-0.5 transition">
                <span>Open Module</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          )}

          {hasPermission('view_attendance') && (
            <Link
              to="/admin/attendance"
              className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition bg-gradient-to-br from-emerald-50/30 to-white flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Attendance Records</h3>
                <p className="text-xs text-slate-500 mt-1">Lecture logs, rosters, and 75% shortage monitoring</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600 group-hover:translate-x-0.5 transition">
                <span>Open Module</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          )}

          {hasPermission('view_marks') && (
            <Link
              to="/admin/marks"
              className="p-5 rounded-2xl border border-slate-200 hover:border-purple-300 hover:shadow-md transition bg-gradient-to-br from-purple-50/30 to-white flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Examination & Marks</h3>
                <p className="text-xs text-slate-500 mt-1">Assessment scores, marksheets, and grade reports</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600 group-hover:translate-x-0.5 transition">
                <span>Open Module</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          )}

          {hasPermission('view_faculty') && (
            <Link
              to="/admin/faculty"
              className="p-5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition bg-gradient-to-br from-slate-50 to-white flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Faculty Directory</h3>
                <p className="text-xs text-slate-500 mt-1">Teaching staff and designations</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:translate-x-0.5 transition">
                <span>Open Module</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          )}

          {hasPermission('view_subjects') && (
            <Link
              to="/admin/subjects"
              className="p-5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition bg-gradient-to-br from-slate-50 to-white flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Curriculum & Subjects</h3>
                <p className="text-xs text-slate-500 mt-1">Course syllabus and teaching assignments</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700 group-hover:translate-x-0.5 transition">
                <span>Open Module</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          )}

          {hasPermission('view_notices') && (
            <Link
              to="/admin/notices"
              className="p-5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition bg-gradient-to-br from-slate-50 to-white flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-3">
                  <BellRing className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Campus Circulars</h3>
                <p className="text-xs text-slate-500 mt-1">Official announcements and circulars</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-700 group-hover:translate-x-0.5 transition">
                <span>Open Module</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomPortalDashboard;
