import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Save,
  AlertCircle,
  Users,
} from 'lucide-react';

const TakeAttendance = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [selectedClassIndex, setSelectedClassIndex] = useState(0);

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [timeSlot, setTimeSlot] = useState('09:00 - 10:00 AM');
  const [topic, setTopic] = useState('');

  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({}); // { studentId: 'PRESENT' | 'ABSENT' | 'LATE' }
  const [remarks, setRemarks] = useState({}); // { studentId: string }

  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // 1. Fetch faculty's assigned classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoadingClasses(true);
        const res = await api.get('/faculty/my-classes');
        if (res.data.success && res.data.data.length > 0) {
          const list = res.data.data;
          setClasses(list);

          // Check if preselected in query param
          const querySubId = searchParams.get('subjectId');
          const querySec = searchParams.get('section');
          if (querySubId && querySec) {
            const idx = list.findIndex(
              (c) => String(c.subject.id) === querySubId && c.section === querySec
            );
            if (idx !== -1) setSelectedClassIndex(idx);
          }
        }
      } catch (err) {
        console.error('Failed to load faculty classes:', err);
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, [searchParams]);

  // 2. Fetch students for the selected class
  useEffect(() => {
    if (classes.length === 0) return;

    const currentClass = classes[selectedClassIndex];
    if (!currentClass) return;

    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);
        const res = await api.get('/students', {
          params: {
            departmentId: currentClass.subject.departmentId,
            semester: currentClass.subject.semester,
            section: currentClass.section,
          },
        });

        if (res.data.success) {
          const stuList = res.data.data;
          setStudents(stuList);

          // Initialize all as PRESENT by default for maximum convenience
          const initial = {};
          stuList.forEach((s) => {
            initial[s.id] = 'PRESENT';
          });
          setRecords(initial);
        }
      } catch (err) {
        console.error('Failed to load students:', err);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [classes, selectedClassIndex]);

  const handleStatusChange = (studentId, status) => {
    setRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleRemarkChange = (studentId, text) => {
    setRemarks((prev) => ({ ...prev, [studentId]: text }));
  };

  const markAll = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setRecords(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (students.length === 0) return;

    const currentClass = classes[selectedClassIndex];
    if (!currentClass) return;

    setIsSubmitting(true);
    setMessage(null);

    const formattedRecords = students.map((s) => ({
      studentId: s.id,
      status: records[s.id] || 'PRESENT',
      remarks: remarks[s.id] || '',
    }));

    try {
      const res = await api.post('/attendance/mark', {
        subjectId: currentClass.subject.id,
        semester: currentClass.subject.semester,
        section: currentClass.section,
        date,
        timeSlot,
        topic,
        records: formattedRecords,
      });

      if (res.data.success) {
        setMessage({
          type: 'success',
          text: `Success! Attendance saved for ${formattedRecords.length} students.`,
        });
        setTimeout(() => {
          navigate('/faculty/attendance-history');
        }, 1200);
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to submit attendance.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculations for counters
  const total = students.length;
  const presentCount = Object.values(records).filter((s) => s === 'PRESENT').length;
  const absentCount = Object.values(records).filter((s) => s === 'ABSENT').length;
  const lateCount = Object.values(records).filter((s) => s === 'LATE').length;
  const attendanceRate = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 100;

  if (loadingClasses) {
    return (
      <div className="py-12 text-center text-slate-400">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        Loading teaching assignments...
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center max-w-lg mx-auto mt-8">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">No Teaching Assignments</h2>
        <p className="text-xs text-slate-500 mt-1">
          You currently do not have any courses assigned to your faculty profile. Please contact the ERP administrator.
        </p>
      </div>
    );
  }

  const currentClass = classes[selectedClassIndex];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Mark Class Attendance</h1>
          <p className="text-xs text-slate-500">Record daily lecture participation with real-time analytics</p>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Class & Lecture Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Course & Class
            </label>
            <select
              value={selectedClassIndex}
              onChange={(e) => setSelectedClassIndex(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-primary-500 bg-white"
            >
              {classes.map((c, i) => (
                <option key={c.id} value={i}>
                  {c.subject.code}: {c.subject.name} (Sec {c.section})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Date of Lecture
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-primary-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Time Slot
            </label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="09:00 - 10:00 AM">09:00 - 10:00 AM</option>
              <option value="10:15 - 11:15 AM">10:15 - 11:15 AM</option>
              <option value="11:30 - 12:30 PM">11:30 - 12:30 PM</option>
              <option value="01:30 - 02:30 PM">01:30 - 02:30 PM</option>
              <option value="02:30 - 04:30 PM">02:30 - 04:30 PM (Lab)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Lecture Topic (Optional)
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Graph Algorithms (Dijkstra)"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Action Bar & Live Statistics */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500">Total:</span>
            <span className="text-sm font-extrabold text-slate-900">{total}</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <span className="text-xs font-bold text-emerald-700">Present:</span>
            <span className="text-sm font-extrabold text-emerald-800">{presentCount}</span>
          </div>
          <div className="flex items-center gap-2 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
            <span className="text-xs font-bold text-rose-700">Absent:</span>
            <span className="text-sm font-extrabold text-rose-800">{absentCount}</span>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            <span className="text-xs font-bold text-amber-700">Late:</span>
            <span className="text-sm font-extrabold text-amber-800">{lateCount}</span>
          </div>
          <span className="text-xs font-extrabold text-slate-700 hidden lg:inline">
            Rate: {attendanceRate}%
          </span>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={() => markAll('PRESENT')}
            className="px-3 py-1.5 rounded-xl bg-emerald-100/70 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition"
          >
            Mark All Present
          </button>
          <button
            type="button"
            onClick={() => markAll('ABSENT')}
            className="px-3 py-1.5 rounded-xl bg-rose-100/70 hover:bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200 transition"
          >
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Student Attendance List */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Roll No</th>
                  <th className="px-6 py-3.5">Student Name</th>
                  <th className="px-6 py-3.5 text-center">Attendance Status</th>
                  <th className="px-6 py-3.5">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingStudents ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-400">
                      <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      Loading student roster...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-400">
                      No enrolled students found for Section {currentClass?.section} in {currentClass?.subject?.department?.name}.
                    </td>
                  </tr>
                ) : (
                  students.map((stu) => {
                    const currentStatus = records[stu.id] || 'PRESENT';

                    return (
                      <tr key={stu.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-3.5 font-mono font-bold text-slate-900">
                          {stu.rollNo}
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="font-bold text-slate-900">{stu.user.name}</div>
                          <div className="text-[11px] text-slate-400">{stu.enrollmentNo}</div>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(stu.id, 'PRESENT')}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition ${
                                currentStatus === 'PRESENT'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Present</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(stu.id, 'ABSENT')}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition ${
                                currentStatus === 'ABSENT'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Absent</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(stu.id, 'LATE')}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition ${
                                currentStatus === 'LATE'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Late</span>
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <input
                            type="text"
                            placeholder="Optional remark..."
                            value={remarks[stu.id] || ''}
                            onChange={(e) => handleRemarkChange(stu.id, e.target.value)}
                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-primary-500"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submit Attendance Button */}
        {students.length > 0 && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/25 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Submit & Save Attendance</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default TakeAttendance;
