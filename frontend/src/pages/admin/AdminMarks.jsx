import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import { Award, BookOpen, TrendingUp, CheckCircle, AlertTriangle, Search } from 'lucide-react';

const AdminMarks = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [examType, setExamType] = useState('IA1');
  const [marksData, setMarksData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get('/subjects');
        if (res.data.success && res.data.data.length > 0) {
          setSubjects(res.data.data);
          setSelectedSubjectId(String(res.data.data[0].id));
        }
      } catch (err) {
        console.error('Failed to fetch subjects:', err);
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (!selectedSubjectId) return;

    const fetchMarks = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/marks/subject/${selectedSubjectId}`, {
          params: { examType },
        });
        if (res.data.success) {
          setMarksData(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch marks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, [selectedSubjectId, examType]);

  const analytics = marksData?.analytics || {};
  const studentMarks = marksData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Examination & Marks</h1>
          <p className="text-xs text-slate-500">Departmental assessment performance, grading distributions, and scorecards</p>
        </div>
      </div>

      {/* Select Subject & Exam Type */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Subject
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-primary-500 bg-white"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code}: {s.name} (Sem {s.semester})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Exam Type
          </label>
          <select
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="IA1">Internal Assessment 1 (IA-1)</option>
            <option value="IA2">Internal Assessment 2 (IA-2)</option>
            <option value="MIDTERM">Midterm Examination</option>
            <option value="ENDSEM">End Semester Examination</option>
          </select>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Class Average"
          value={analytics.average !== undefined ? `${analytics.average}` : '—'}
          subtitle="Mean score obtained"
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="Highest Score"
          value={analytics.highest !== undefined ? `${analytics.highest}` : '—'}
          subtitle="Top performer in class"
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Pass Percentage"
          value={analytics.passPercentage !== undefined ? `${analytics.passPercentage}%` : '—'}
          subtitle="Students passing"
          icon={CheckCircle}
          color={analytics.passPercentage >= 75 ? 'emerald' : 'amber'}
        />
        <StatCard
          title="Total Evaluated"
          value={analytics.totalEvaluated || 0}
          subtitle="Students assessed"
          icon={BookOpen}
          color="purple"
        />
      </div>

      {/* Scores Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Student Marks Sheet — {examType}
          </h2>
          <span className="text-xs text-slate-400 font-semibold">
            {marksData?.subject ? `${marksData.subject.code} • ${marksData.subject.name}` : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Roll No</th>
                <th className="px-6 py-3.5">Student Name</th>
                <th className="px-6 py-3.5">Section</th>
                <th className="px-6 py-3.5">Marks Obtained</th>
                <th className="px-6 py-3.5">Max Marks</th>
                <th className="px-6 py-3.5">Percentage</th>
                <th className="px-6 py-3.5">Letter Grade</th>
                <th className="px-6 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading marks...
                  </td>
                </tr>
              ) : studentMarks.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-slate-400">
                    No marks records found for this subject and exam.
                  </td>
                </tr>
              ) : (
                studentMarks.map((item) => {
                  const m = item.marks && item.marks[0];
                  const percentage = m ? Math.round((m.marksObtained / m.maxMarks) * 100) : 0;
                  const isPass = m && m.grade !== 'F';

                  return (
                    <tr key={item.studentId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-3.5 font-mono font-semibold text-slate-800">
                        {item.rollNo}
                      </td>
                      <td className="px-6 py-3.5 font-bold text-slate-900">{item.name}</td>
                      <td className="px-6 py-3.5 text-slate-600">Sec {item.section}</td>
                      <td className="px-6 py-3.5 font-bold text-slate-900 text-sm">
                        {m ? m.marksObtained : <span className="text-slate-400 font-normal">Pending</span>}
                      </td>
                      <td className="px-6 py-3.5 text-slate-500 font-medium">{m ? m.maxMarks : '—'}</td>
                      <td className="px-6 py-3.5 font-semibold text-slate-700">
                        {m ? `${percentage}%` : '—'}
                      </td>
                      <td className="px-6 py-3.5">
                        {m ? (
                          <span
                            className={`px-2 py-0.5 rounded-md font-extrabold text-[11px] ${
                              m.grade === 'A+' || m.grade === 'A'
                                ? 'bg-emerald-100 text-emerald-800'
                                : m.grade === 'B' || m.grade === 'C'
                                ? 'bg-blue-100 text-blue-800'
                                : m.grade === 'D' || m.grade === 'E'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {m.grade}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        {m ? (
                          isPass ? (
                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              PASS
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                              FAIL
                            </span>
                          )
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-400">Not Graded</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminMarks;
