import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Award, Save, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';

const EnterMarks = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [selectedClassIndex, setSelectedClassIndex] = useState(0);

  const [examType, setExamType] = useState('IA1');
  const [maxMarks, setMaxMarks] = useState(25);

  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({}); // { studentId: marksObtained }
  const [remarks, setRemarks] = useState({});

  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Update default maxMarks based on examType
  const handleExamTypeChange = (type) => {
    setExamType(type);
    if (type === 'IA1' || type === 'IA2' || type === 'ASSIGNMENT') {
      setMaxMarks(25);
    } else if (type === 'MIDTERM') {
      setMaxMarks(50);
    } else if (type === 'ENDSEM') {
      setMaxMarks(100);
    }
  };

  // 1. Fetch assigned classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoadingClasses(true);
        const res = await api.get('/faculty/my-classes');
        if (res.data.success && res.data.data.length > 0) {
          const list = res.data.data;
          setClasses(list);

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

  // 2. Fetch students and existing marks for this class & examType
  useEffect(() => {
    if (classes.length === 0) return;
    const currentClass = classes[selectedClassIndex];
    if (!currentClass) return;

    const fetchStudentsAndMarks = async () => {
      try {
        setLoadingStudents(true);
        const [stuRes, marksRes] = await Promise.all([
          api.get('/students', {
            params: {
              departmentId: currentClass.subject.departmentId,
              semester: currentClass.subject.semester,
              section: currentClass.section,
            },
          }),
          api.get(`/marks/subject/${currentClass.subject.id}`, {
            params: { examType, section: currentClass.section },
          }),
        ]);

        if (stuRes.data.success) {
          const stuList = stuRes.data.data;
          setStudents(stuList);

          // Populate existing marks if already saved
          const existingMarksMap = {};
          const existingRemarksMap = {};

          if (marksRes.data.success && marksRes.data.data) {
            marksRes.data.data.forEach((item) => {
              if (item.marks && item.marks.length > 0) {
                const markObj = item.marks.find((m) => m.examType === examType);
                if (markObj) {
                  existingMarksMap[item.studentId] = markObj.marksObtained;
                  existingRemarksMap[item.studentId] = markObj.remarks || '';
                  if (markObj.maxMarks) setMaxMarks(markObj.maxMarks);
                }
              }
            });
          }

          setMarks(existingMarksMap);
          setRemarks(existingRemarksMap);
        }
      } catch (err) {
        console.error('Failed to load marks and students:', err);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudentsAndMarks();
  }, [classes, selectedClassIndex, examType]);

  const handleMarkChange = (studentId, val) => {
    setMarks((prev) => ({ ...prev, [studentId]: val }));
  };

  const handleRemarkChange = (studentId, val) => {
    setRemarks((prev) => ({ ...prev, [studentId]: val }));
  };

  const calculateGrade = (obtained, max) => {
    if (obtained === undefined || obtained === '' || isNaN(obtained)) return { grade: '—', color: 'text-slate-400' };
    const num = parseFloat(obtained);
    const pct = (num / max) * 100;
    if (pct >= 90) return { grade: 'A+', color: 'text-emerald-700 bg-emerald-50' };
    if (pct >= 80) return { grade: 'A', color: 'text-emerald-700 bg-emerald-50' };
    if (pct >= 70) return { grade: 'B', color: 'text-blue-700 bg-blue-50' };
    if (pct >= 60) return { grade: 'C', color: 'text-blue-700 bg-blue-50' };
    if (pct >= 50) return { grade: 'D', color: 'text-amber-700 bg-amber-50' };
    if (pct >= 40) return { grade: 'E', color: 'text-amber-700 bg-amber-50' };
    return { grade: 'F', color: 'text-rose-700 bg-rose-50' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentClass = classes[selectedClassIndex];
    if (!currentClass) return;

    // Check for negative or marks > maxMarks
    for (const stu of students) {
      const val = marks[stu.id];
      if (val !== undefined && val !== '') {
        const num = parseFloat(val);
        if (num < 0 || num > maxMarks) {
          setMessage({
            type: 'error',
            text: `Invalid marks for ${stu.user.name}. Score must be between 0 and ${maxMarks}.`,
          });
          return;
        }
      }
    }

    const marksList = students
      .filter((s) => marks[s.id] !== undefined && marks[s.id] !== '')
      .map((s) => ({
        studentId: s.id,
        marksObtained: parseFloat(marks[s.id]),
        remarks: remarks[s.id] || null,
      }));

    if (marksList.length === 0) {
      setMessage({
        type: 'error',
        text: 'Please enter marks for at least one student before saving.',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage(null);

      const res = await api.post('/marks/save', {
        subjectId: currentClass.subject.id,
        examType,
        maxMarks: parseFloat(maxMarks),
        marksList,
      });

      if (res.data.success) {
        setMessage({
          type: 'success',
          text: `Success! Marks recorded for ${marksList.length} students.`,
        });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save marks.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingClasses) {
    return (
      <div className="py-12 text-center text-slate-400">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        Loading courses...
      </div>
    );
  }

  const currentClass = classes[selectedClassIndex];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Enter Examination Marks</h1>
          <p className="text-xs text-slate-500">Record scores for Internal Assessments, Midterms, and End-Semester exams</p>
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

      {/* Course & Exam Selection Form */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Course
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
              Exam / Assessment Type
            </label>
            <select
              value={examType}
              onChange={(e) => handleExamTypeChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="IA1">Internal Assessment 1 (IA-1)</option>
              <option value="IA2">Internal Assessment 2 (IA-2)</option>
              <option value="MIDTERM">Midterm Examination</option>
              <option value="ASSIGNMENT">Assignment / Practical</option>
              <option value="ENDSEM">End Semester Examination</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Maximum Marks
            </label>
            <input
              type="number"
              min="1"
              max="200"
              required
              value={maxMarks}
              onChange={(e) => setMaxMarks(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Marks Entry Table */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Roll No</th>
                  <th className="px-6 py-3.5">Student Name</th>
                  <th className="px-6 py-3.5 w-44">Marks Obtained (/{maxMarks})</th>
                  <th className="px-6 py-3.5 text-center">Grade Preview</th>
                  <th className="px-6 py-3.5">Remarks / Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingStudents ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                      <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      Loading student roster...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                      No enrolled students found for this class.
                    </td>
                  </tr>
                ) : (
                  students.map((stu) => {
                    const currentVal = marks[stu.id];
                    const { grade, color } = calculateGrade(currentVal, maxMarks);

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
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max={maxMarks}
                              step="0.5"
                              value={currentVal !== undefined ? currentVal : ''}
                              onChange={(e) => handleMarkChange(stu.id, e.target.value)}
                              placeholder={`0 - ${maxMarks}`}
                              className="w-24 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-primary-500"
                            />
                            <span className="text-slate-400 font-semibold">/ {maxMarks}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold ${color}`}>
                            {grade}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <input
                            type="text"
                            placeholder="e.g. Excellent / Needs improvement"
                            value={remarks[stu.id] || ''}
                            onChange={(e) => handleRemarkChange(stu.id, e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-primary-500"
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

        {students.length > 0 && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm shadow-lg shadow-primary-600/25 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Examination Marks</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default EnterMarks;
