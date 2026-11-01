import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  BookOpen,
  TrendingUp,
} from 'lucide-react';

const MyAttendance = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const res = await api.get('/attendance/my-attendance');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load my attendance:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const bySubject = data?.bySubject || [];
  const recentLogs = data?.recentLogs || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Attendance Status</h1>
          <p className="text-xs text-slate-500">Track subject-wise lecture attendance, minimum criteria thresholds, and class logs</p>
        </div>
      </div>

      {/* Attendance Warning Banner if < 75% */}
      {summary.shortageWarning && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 shadow-xs flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-rose-500 text-white shrink-0">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-rose-900">
              Low Attendance Alert: {summary.percentage}% (Below 75%)
            </h3>
            <p className="text-xs text-rose-700 mt-1 leading-relaxed">
              Your overall attendance is below the university guideline of 75%. You need to regularly attend the forthcoming lectures to regain eligibility for the final semester examinations.
            </p>
          </div>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${summary.percentage}%`}
          subtitle="All subjects aggregate"
          icon={CalendarCheck}
          color={summary.percentage >= 75 ? 'emerald' : 'rose'}
          badge={summary.percentage >= 75 ? 'Safe Standing' : 'Shortage Alert'}
        />
        <StatCard
          title="Total Lectures"
          value={summary.totalClasses || 0}
          subtitle="Classes held so far"
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Classes Attended"
          value={summary.attended || 0}
          subtitle={`${summary.present} present, ${summary.late} late`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Classes Missed"
          value={summary.absent || 0}
          subtitle="Unattended lectures"
          icon={XCircle}
          color="rose"
        />
      </div>

      {/* Subject-wise Attendance Breakdown Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-1">Subject-Wise Attendance Breakdown</h2>
        <p className="text-xs text-slate-500 mb-6">Subject attendance vs the 75% minimum eligibility threshold</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bySubject.map((sub) => {
            const isSafe = sub.percentage >= 75;

            return (
              <div
                key={sub.subjectId}
                className={`p-5 rounded-2xl border transition ${
                  isSafe
                    ? 'border-slate-200/80 bg-white hover:border-slate-300'
                    : 'border-rose-200 bg-rose-50/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-primary-50 text-primary-700 border border-primary-100">
                    {sub.code}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isSafe
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {isSafe ? 'Eligible' : 'Shortage'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{sub.name}</h3>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500 font-medium">
                      Attended <strong>{sub.present + sub.late}</strong> of {sub.totalClasses} classes
                    </span>
                    <span
                      className={`font-extrabold text-sm ${
                        isSafe ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {sub.percentage}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSafe ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(sub.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Present: <strong className="text-slate-700">{sub.present}</strong></span>
                  <span>Absent: <strong className="text-rose-600">{sub.absent}</strong></span>
                  <span>Late: <strong className="text-amber-600">{sub.late}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Lecture Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Lecture Attendance Log History</h2>
          <p className="text-xs text-slate-500">Record of each class session and your recorded status</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Date & Slot</th>
                <th className="px-6 py-3.5">Subject</th>
                <th className="px-6 py-3.5">Topic Covered</th>
                <th className="px-6 py-3.5">Faculty</th>
                <th className="px-6 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                    No individual class sessions logged yet.
                  </td>
                </tr>
              ) : (
                recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="font-bold text-slate-900">{log.date}</div>
                      <div className="text-[11px] text-slate-400">{log.timeSlot || 'Lecture'}</div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-slate-800">{log.subjectName}</div>
                      <span className="text-[10px] font-mono text-slate-400">{log.subjectCode}</span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {log.topic || 'Regular Curriculum Lecture'}
                    </td>
                    <td className="px-6 py-3.5 text-slate-700 font-medium">{log.facultyName}</td>
                    <td className="px-6 py-3.5 text-right">
                      {log.status === 'PRESENT' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Present
                        </span>
                      )}
                      {log.status === 'ABSENT' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                          <XCircle className="w-3 h-3 text-rose-500" /> Absent
                        </span>
                      )}
                      {log.status === 'LATE' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-500" /> Late
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyAttendance;
