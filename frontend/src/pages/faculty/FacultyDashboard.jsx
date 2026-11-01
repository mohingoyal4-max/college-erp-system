import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  Users,
  CalendarCheck,
  Award,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/faculty');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load faculty dashboard:', err);
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
  const assignedClasses = data?.assignedClasses || [];
  const recentSessions = data?.recentSessions || [];

  return (
    <div className="space-y-6">
      {/* Faculty Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            Faculty Teaching Portal
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold mt-3 tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-slate-300 text-xs md:text-sm mt-2 leading-relaxed">
            {user?.facultyProfile?.designation} • {user?.facultyProfile?.department?.name || 'Department of Computer Science'}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/faculty/take-attendance"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/30 transition hover:scale-[1.01]"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Mark Today's Attendance</span>
            </Link>
            <Link
              to="/faculty/enter-marks"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition"
            >
              <Award className="w-4 h-4" />
              <span>Enter Exam Marks</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Assigned Classes"
          value={stats.totalClassesAssigned || 0}
          subtitle="Courses in curriculum"
          icon={BookOpen}
          color="emerald"
        />
        <StatCard
          title="Students Taught"
          value={stats.totalStudentsTaught || 0}
          subtitle="Enrolled in your sections"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Sessions Logged"
          value={stats.totalSessionsConducted || 0}
          subtitle="Attendance lectures completed"
          icon={CalendarCheck}
          color="purple"
        />
      </div>

      {/* Assigned Subjects & Quick Attendance Links */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your Assigned Teaching Courses</h2>
            <p className="text-xs text-slate-500">Select any course to take attendance or grade exams</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignedClasses.length === 0 ? (
            <p className="text-xs text-slate-400 col-span-full py-4 text-center">No assigned courses found.</p>
          ) : (
            assignedClasses.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-slate-200/70 bg-gradient-to-br from-slate-50/50 to-white hover:border-slate-300 hover:shadow-xs transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-primary-50 text-primary-700 border border-primary-100">
                      {item.subject.code}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      Section {item.section}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{item.subject.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Semester {item.subject.semester} • {item.subject.credits} Credits • {item.subject.type}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    to={`/faculty/take-attendance?subjectId=${item.subject.id}&section=${item.section}&semester=${item.subject.semester}`}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold text-center border border-emerald-200/60 transition"
                  >
                    Take Attendance
                  </Link>
                  <Link
                    to={`/faculty/enter-marks?subjectId=${item.subject.id}&section=${item.section}`}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-bold text-center border border-primary-200/60 transition"
                  >
                    Enter Marks
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Attendance Sessions */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Attendance Sessions Logged</h2>
            <p className="text-xs text-slate-500">History of lectures marked by you</p>
          </div>
          <Link
            to="/faculty/attendance-history"
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            All Sessions <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentSessions.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No attendance sessions recorded yet.</p>
          ) : (
            recentSessions.map((s) => (
              <div key={s.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{s.subject.name}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      Sec {s.section}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {s.date} {s.timeSlot && `• ${s.timeSlot}`} {s.topic && `• Topic: ${s.topic}`}
                  </p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {s._count?.records || 0} Marked
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
