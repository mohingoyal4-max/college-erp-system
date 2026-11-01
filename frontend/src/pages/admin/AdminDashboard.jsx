import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import {
  Users,
  UserCheck,
  Building2,
  BookOpen,
  CalendarCheck,
  BellRing,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/admin');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const departments = data?.departments || [];
  const recentSessions = data?.recentSessions || [];
  const recentNotices = data?.recentNotices || [];
  const recentStudents = data?.recentStudents || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-500/20 text-primary-300 border border-primary-400/30">
            Administrative Control Panel
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold mt-3 tracking-tight">
            Campus ERP Management System
          </h1>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Manage students, faculty members, academic departments, class attendance, and examination marks from a unified dashboard.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-10 translate-y-10">
          <Building2 className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents || 0}
          subtitle="Enrolled active students"
          icon={Users}
          color="blue"
          badge="CSE / IT / ECE"
        />
        <StatCard
          title="Faculty Members"
          value={stats.totalFaculty || 0}
          subtitle="Professors & Instructors"
          icon={UserCheck}
          color="emerald"
          badge="Active Teaching"
        />
        <StatCard
          title="Departments"
          value={stats.totalDepartments || 0}
          subtitle="Academic divisions"
          icon={Building2}
          color="purple"
          badge={`${stats.totalSubjects || 0} Subjects`}
        />
        <StatCard
          title="Overall Attendance"
          value={`${stats.overallAttendance || 0}%`}
          subtitle="Campus average rate"
          icon={CalendarCheck}
          color={stats.overallAttendance >= 75 ? 'emerald' : 'amber'}
          trend={stats.overallAttendance >= 75 ? 'Above 75% threshold' : 'Requires attention'}
        />
      </div>

      {/* Departments Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Academic Departments</h2>
            <p className="text-xs text-slate-500">Department-wise student and faculty breakdown</p>
          </div>
          <Link
            to="/admin/departments"
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            Manage All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-200 transition"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-sm text-primary-700 bg-primary-100/70 px-2 py-0.5 rounded-md">
                  {dept.code}
                </span>
                <span className="text-xs font-medium text-slate-400">
                  {dept._count.subjects} Subjects
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{dept.name}</h3>
              <div className="flex items-center gap-4 mt-3 pt-2 border-t border-slate-200/60 text-xs text-slate-600">
                <span>
                  <strong className="text-slate-900 font-bold">{dept._count.students}</strong> Students
                </span>
                <span>
                  <strong className="text-slate-900 font-bold">{dept._count.faculty}</strong> Faculty
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Recent Attendance Sessions & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance Sessions */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Recent Attendance Sessions</h2>
                <p className="text-xs text-slate-500">Live lecture attendance recorded by faculty</p>
              </div>
              <Link
                to="/admin/attendance"
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                View Logs <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentSessions.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No attendance sessions recorded yet.</p>
              ) : (
                recentSessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{s.subject.name}</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                          Sec {s.section}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {s.faculty?.user?.name} • {s.date} {s.timeSlot && `• ${s.timeSlot}`}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {s._count.records} Marked
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Notices Board */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Campus Notices</h2>
                <p className="text-xs text-slate-500">Announcements for faculty and students</p>
              </div>
              <Link
                to="/admin/notices"
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                Manage <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentNotices.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No notices posted yet.</p>
              ) : (
                recentNotices.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 line-clamp-1">{n.title}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-primary-100 text-primary-700 shrink-0">
                        {n.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{n.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
