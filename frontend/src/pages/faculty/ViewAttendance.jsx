import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  TrendingUp,
  Users,
} from 'lucide-react';

const ViewAttendance = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClassIndex, setSelectedClassIndex] = useState(0);

  // Tabs: 'analytics' (student percentage & shortage) vs 'sessions' (session logs)
  const [activeTab, setActiveTab] = useState('analytics');

  const [statsData, setStatsData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Session details modal
  const [selectedSession, setSelectedSession] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // 1. Fetch assigned classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/faculty/my-classes');
        if (res.data.success && res.data.data.length > 0) {
          setClasses(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load faculty classes:', err);
      }
    };
    fetchClasses();
  }, []);

  // 2. Fetch subject attendance analytics & sessions for selected class
  useEffect(() => {
    if (classes.length === 0) return;
    const currentClass = classes[selectedClassIndex];
    if (!currentClass) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, sessRes] = await Promise.all([
          api.get('/attendance/subject-stats', {
            params: {
              subjectId: currentClass.subject.id,
              section: currentClass.section,
            },
          }),
          api.get('/attendance/sessions', {
            params: {
              subjectId: currentClass.subject.id,
              section: currentClass.section,
            },
          }),
        ]);

        if (statsRes.data.success) setStatsData(statsRes.data);
        if (sessRes.data.success) setSessions(sessRes.data.data);
      } catch (err) {
        console.error('Failed to load attendance records:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classes, selectedClassIndex]);

  const handleOpenSessionRoster = async (id) => {
    try {
      const res = await api.get(`/attendance/sessions/${id}`);
      if (res.data.success) {
        setSelectedSession(res.data.data);
        setIsDetailOpen(true);
      }
    } catch (err) {
      alert('Failed to load session details.');
    }
  };

  const currentClass = classes[selectedClassIndex];
  const studentStats = statsData?.studentStats || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Attendance Records & Analytics</h1>
          <p className="text-xs text-slate-500">Track student attendance rates and identify students with shortage warnings</p>
        </div>
      </div>

      {/* Class Selector & Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-auto">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Assigned Course
          </label>
          <select
            value={selectedClassIndex}
            onChange={(e) => setSelectedClassIndex(Number(e.target.value))}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-primary-500 bg-white min-w-[280px]"
          >
            {classes.map((c, i) => (
              <option key={c.id} value={i}>
                {c.subject.code}: {c.subject.name} (Sec {c.section})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-stretch md:self-auto">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'analytics'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Student % & Shortage
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'sessions'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Session History ({sessions.length})
          </button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      {statsData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase">Lectures Conducted</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {statsData.totalSessions}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Total class sessions logged</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase">Class Average</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">
              {statsData.avgAttendance}%
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Mean student attendance</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase">Shortage Alerts</span>
            <div
              className={`text-2xl font-extrabold mt-1 ${
                statsData.shortageStudentsCount > 0 ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {statsData.shortageStudentsCount} Students
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Attendance below 75% criteria</p>
          </div>
        </div>
      )}

      {/* Tab 1: Student Attendance Analytics Table */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Student Attendance Performance
            </h2>
            <span className="text-xs font-bold text-slate-400">
              Minimum Requirement: 75%
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Roll No</th>
                  <th className="px-6 py-3.5">Student Name</th>
                  <th className="px-6 py-3.5 text-center">Conducted</th>
                  <th className="px-6 py-3.5 text-center">Attended</th>
                  <th className="px-6 py-3.5 text-center">Absent</th>
                  <th className="px-6 py-3.5">Attendance Progress</th>
                  <th className="px-6 py-3.5 text-right">Eligibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-slate-400">
                      <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      Loading student attendance records...
                    </td>
                  </tr>
                ) : studentStats.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-slate-400">
                      No attendance data recorded yet for this course.
                    </td>
                  </tr>
                ) : (
                  studentStats.map((stu) => (
                    <tr
                      key={stu.studentId}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        stu.isShortage ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="px-6 py-3.5 font-mono font-bold text-slate-800">
                        {stu.rollNo}
                      </td>
                      <td className="px-6 py-3.5 font-bold text-slate-900">{stu.name}</td>
                      <td className="px-6 py-3.5 text-center font-semibold text-slate-700">
                        {stu.totalSessions}
                      </td>
                      <td className="px-6 py-3.5 text-center font-bold text-emerald-700">
                        {stu.attended}
                      </td>
                      <td className="px-6 py-3.5 text-center font-bold text-rose-700">
                        {stu.absent}
                      </td>
                      <td className="px-6 py-3.5 w-64">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                stu.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(stu.percentage, 100)}%` }}
                            ></div>
                          </div>
                          <span
                            className={`font-extrabold text-xs w-10 text-right ${
                              stu.percentage >= 75 ? 'text-slate-800' : 'text-rose-600'
                            }`}
                          >
                            {stu.percentage}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        {stu.isShortage ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-500" /> Shortage Alert
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Eligible
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
      )}

      {/* Tab 2: Sessions Log Table */}
      {activeTab === 'sessions' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Time Slot</th>
                  <th className="px-6 py-3.5">Topic Covered</th>
                  <th className="px-6 py-3.5">Records Marked</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                      No sessions recorded yet.
                    </td>
                  </tr>
                ) : (
                  sessions.map((sess) => (
                    <tr key={sess.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-3.5 font-bold text-slate-900">{sess.date}</td>
                      <td className="px-6 py-3.5 text-slate-500">{sess.timeSlot || '—'}</td>
                      <td className="px-6 py-3.5 font-medium text-slate-800">
                        {sess.topic || 'Regular Lecture'}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {sess._count?.records || 0} Students
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => handleOpenSessionRoster(sess.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Roster</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Roster Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedSession ? `Attendance Session: ${selectedSession.date}` : 'Session Details'}
      >
        {selectedSession && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex justify-between">
              <div>
                <span className="text-slate-400">Subject:</span>{' '}
                <strong className="text-slate-800">{selectedSession.subject.name}</strong>
              </div>
              <div>
                <span className="text-slate-400">Topic:</span>{' '}
                <strong className="text-slate-800">{selectedSession.topic || '—'}</strong>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="px-4 py-2">Roll No</th>
                    <th className="px-4 py-2">Student</th>
                    <th className="px-4 py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedSession.records.map((r) => (
                    <tr key={r.id}>
                      <td className="px-4 py-2 font-mono font-bold">{r.student.rollNo}</td>
                      <td className="px-4 py-2 font-semibold text-slate-800">{r.student.user.name}</td>
                      <td className="px-4 py-2 text-right">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            r.status === 'PRESENT'
                              ? 'bg-emerald-50 text-emerald-700'
                              : r.status === 'ABSENT'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ViewAttendance;
