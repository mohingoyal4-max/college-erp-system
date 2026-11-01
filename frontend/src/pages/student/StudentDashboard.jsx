import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';
import {
  CalendarCheck,
  Award,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  BellRing,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/student');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
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

  const student = data?.student || {};
  const stats = data?.stats || {};
  const notices = data?.notices || [];
  const enrolledSubjects = data?.enrolledSubjects || [];

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-500/20 text-primary-300 border border-primary-400/30">
            Student Academic Portal
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold mt-3 tracking-tight">
            Hello, {user?.name}
          </h1>
          <p className="text-slate-300 text-xs md:text-sm mt-1.5 leading-relaxed">
            Roll: <strong className="text-white font-mono">{student.rollNo}</strong> • Enrollment: <strong className="text-white font-mono">{student.enrollmentNo}</strong> • {student.department?.name} (Sem {student.semester}, Sec {student.section})
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/student/attendance"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs shadow-md shadow-primary-500/30 transition hover:scale-[1.01]"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Check My Attendance</span>
            </Link>
            <Link
              to="/student/marks"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition"
            >
              <Award className="w-4 h-4" />
              <span>View Semester Marksheet</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Prominent Attendance Shortage Alert Banner if < 75% */}
      {stats.isAttendanceShortage && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 shadow-xs flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-rose-500 text-white shrink-0">
            <AlertTriangle className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-rose-900">
              Attendance Shortage Warning! Current Rate: {stats.attendancePercentage}%
            </h3>
            <p className="text-xs text-rose-700 mt-1 leading-relaxed">
              Your overall attendance is currently below the mandatory institutional requirement of <strong>75%</strong>. You are at risk of being debarred from the upcoming End-Semester Examinations. Please meet your academic advisor and attend all remaining lectures.
            </p>
          </div>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${stats.attendancePercentage}%`}
          subtitle={`${stats.totalClassesAttended} of ${stats.totalClassesConducted} lectures attended`}
          icon={CalendarCheck}
          color={stats.attendancePercentage >= 75 ? 'emerald' : 'rose'}
          badge={stats.attendancePercentage >= 75 ? 'Eligible' : 'Shortage Alert'}
        />
        <StatCard
          title="Overall Score"
          value={stats.marksPercentage > 0 ? `${stats.marksPercentage}%` : 'Pending'}
          subtitle="Cumulative assessment average"
          icon={Award}
          color="blue"
          badge="Semester 4"
        />
        <StatCard
          title="Enrolled Courses"
          value={stats.enrolledSubjectsCount || 0}
          subtitle="Active curriculum subjects"
          icon={BookOpen}
          color="purple"
          badge="Curriculum"
        />
        <StatCard
          title="Evaluations Done"
          value={stats.evaluatedExamsCount || 0}
          subtitle="Completed exam components"
          icon={TrendingUp}
          color="indigo"
          badge="IA1 / IA2 / Midterm"
        />
      </div>

      {/* Enrolled Courses & Campus Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrolled Subjects List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Registered Subjects</h2>
                <p className="text-xs text-slate-500">Current semester academic curriculum</p>
              </div>
              <Link
                to="/student/courses"
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                View Details <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {enrolledSubjects.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-primary-100 text-primary-800 border border-primary-200">
                      {sub.code}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{sub.name}</h4>
                      <p className="text-[11px] text-slate-400">
                        {sub.credits} Credits • {sub.type}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notices Board */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Student Announcements</h2>
                <p className="text-xs text-slate-500">Official circulars from administration</p>
              </div>
            </div>

            <div className="space-y-3">
              {notices.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No recent notices.</p>
              ) : (
                notices.map((n) => (
                  <div
                    key={n.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">{n.title}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-primary-100 text-primary-700">
                        {n.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{n.content}</p>
                    <div className="mt-2 text-[10px] text-slate-400 font-medium">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </div>
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

export default StudentDashboard;
