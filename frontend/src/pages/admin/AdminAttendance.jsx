import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import { CalendarCheck, Search, Filter, Eye, User, CheckCircle2, XCircle, Clock } from 'lucide-react';

const AdminAttendance = () => {
  const [sessions, setSessions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [departmentId, setDepartmentId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState('');

  // Session Detail Modal
  const [selectedSession, setSelectedSession] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (departmentId) params.departmentId = departmentId;
      if (subjectId) params.subjectId = subjectId;
      if (date) params.date = date;

      const [sessRes, deptRes, subRes] = await Promise.all([
        api.get('/attendance/sessions', { params }),
        api.get('/departments'),
        api.get('/subjects', { params: departmentId ? { departmentId } : {} }),
      ]);

      if (sessRes.data.success) setSessions(sessRes.data.data);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
      if (subRes.data.success) setSubjects(subRes.data.data);
    } catch (err) {
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [departmentId, subjectId, date]);

  const handleViewSession = async (id) => {
    try {
      setDetailLoading(true);
      setIsDetailOpen(true);
      const res = await api.get(`/attendance/sessions/${id}`);
      if (res.data.success) {
        setSelectedSession(res.data.data);
      }
    } catch (err) {
      alert('Failed to load session details.');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Attendance Logs</h1>
          <p className="text-xs text-slate-500">College-wide lecture attendance sessions recorded by faculty members</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center gap-3">
        <select
          value={departmentId}
          onChange={(e) => {
            setDepartmentId(e.target.value);
            setSubjectId('');
          }}
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
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:ring-2 focus:ring-primary-500 bg-white"
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.code})
            </option>
          ))}
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:ring-2 focus:ring-primary-500 bg-white"
        />

        {date && (
          <button
            onClick={() => setDate('')}
            className="text-xs text-slate-500 hover:text-slate-800 underline"
          >
            Clear Date
          </button>
        )}
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Date & Time</th>
                <th className="px-6 py-3.5">Subject</th>
                <th className="px-6 py-3.5">Faculty</th>
                <th className="px-6 py-3.5">Class / Section</th>
                <th className="px-6 py-3.5">Topic Covered</th>
                <th className="px-6 py-3.5">Students Recorded</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading attendance sessions...
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-400">
                    No attendance records found matching filters.
                  </td>
                </tr>
              ) : (
                sessions.map((sess) => (
                  <tr key={sess.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="font-bold text-slate-900">{sess.date}</div>
                      <div className="text-[11px] text-slate-400">{sess.timeSlot || 'Standard Slot'}</div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-slate-800">{sess.subject.name}</div>
                      <span className="text-[10px] font-bold text-slate-400">{sess.subject.code}</span>
                    </td>
                    <td className="px-6 py-3.5 font-medium text-slate-700">
                      {sess.faculty?.user?.name || 'Faculty Member'}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-700">
                      Sem {sess.semester} • Sec {sess.section}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 max-w-xs truncate">
                      {sess.topic || 'Regular Lecture'}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {sess._count.records} Students
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => handleViewSession(sess.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Roster</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Session Details Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedSession ? `Session: ${selectedSession.subject.name} (${selectedSession.date})` : 'Attendance Roster'}
        maxWidth="max-w-2xl"
      >
        {detailLoading ? (
          <div className="py-8 text-center text-slate-400">Loading student roster...</div>
        ) : selectedSession ? (
          <div className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex flex-wrap gap-4 justify-between">
              <div>
                <span className="text-slate-400">Faculty:</span>{' '}
                <strong className="text-slate-800">{selectedSession.faculty.user.name}</strong>
              </div>
              <div>
                <span className="text-slate-400">Class:</span>{' '}
                <strong className="text-slate-800">Sem {selectedSession.semester} Sec {selectedSession.section}</strong>
              </div>
              <div>
                <span className="text-slate-400">Topic:</span>{' '}
                <strong className="text-slate-800">{selectedSession.topic || 'General Lecture'}</strong>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="px-4 py-2.5">Roll No</th>
                    <th className="px-4 py-2.5">Student Name</th>
                    <th className="px-4 py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedSession.records.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 font-mono font-semibold text-slate-700">{r.student.rollNo}</td>
                      <td className="px-4 py-2 font-bold text-slate-900">{r.student.user.name}</td>
                      <td className="px-4 py-2 text-right">
                        {r.status === 'PRESENT' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Present
                          </span>
                        )}
                        {r.status === 'ABSENT' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            <XCircle className="w-3 h-3" /> Absent
                          </span>
                        )}
                        {r.status === 'LATE' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <Clock className="w-3 h-3" /> Late
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default AdminAttendance;
