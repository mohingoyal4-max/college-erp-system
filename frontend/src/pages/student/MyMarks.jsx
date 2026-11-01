import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import { Award, CheckCircle2, AlertTriangle, BookOpen, TrendingUp, Sparkles } from 'lucide-react';

const MyMarks = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        setLoading(true);
        const res = await api.get('/marks/my-marks');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load my marks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMarks();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const reportCard = data?.reportCard || [];
  const student = data?.student || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Academic Grade Report</h1>
          <p className="text-xs text-slate-500">Official semester marksheet and internal assessments score card</p>
        </div>
      </div>

      {/* GPA & Performance Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Semester SGPA"
          value={summary.sgpa || '0.00'}
          subtitle="Out of 10.0 scale"
          icon={Award}
          color="blue"
          badge="Semester 4"
        />
        <StatCard
          title="Overall Percentage"
          value={`${summary.overallPercentage || 0}%`}
          subtitle="Cumulative internal score"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Credits Registered"
          value={summary.totalCredits || 0}
          subtitle="Course credit weight"
          icon={BookOpen}
          color="purple"
        />
        <StatCard
          title="Academic Standing"
          value={summary.status || 'All Clear'}
          subtitle={`${summary.evaluatedSubjects} of ${summary.totalSubjects} graded`}
          icon={summary.status === 'All Clear' ? CheckCircle2 : AlertTriangle}
          color={summary.status === 'All Clear' ? 'emerald' : 'rose'}
        />
      </div>

      {/* Formal Marksheet Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Semester IV Grade Sheet
            </h2>
            <p className="text-xs text-slate-400">
              Department of {student.department} • Batch {student.batch}
            </p>
          </div>
          <span className="font-mono text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-100">
            Roll: {student.rollNo}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Course Code & Name</th>
                <th className="px-6 py-3.5 text-center">Credits</th>
                <th className="px-6 py-3.5 text-center">IA-1 (/25)</th>
                <th className="px-6 py-3.5 text-center">IA-2 (/25)</th>
                <th className="px-6 py-3.5 text-center">Midterm (/50)</th>
                <th className="px-6 py-3.5 text-center">Total Score</th>
                <th className="px-6 py-3.5 text-center">Grade</th>
                <th className="px-6 py-3.5 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportCard.map((item) => (
                <tr key={item.subjectId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {item.subjectCode}
                      </span>
                      <span className="font-bold text-slate-900">{item.subjectName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-center font-semibold text-slate-600">
                    {item.credits}
                  </td>
                  <td className="px-6 py-3.5 text-center font-bold text-slate-800">
                    {item.ia1 ? (
                      <span className="inline-flex items-center gap-1">
                        {item.ia1.marksObtained}
                        <span className="text-[10px] text-slate-400 font-normal">({item.ia1.grade})</span>
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-center font-bold text-slate-800">
                    {item.ia2 ? (
                      <span className="inline-flex items-center gap-1">
                        {item.ia2.marksObtained}
                        <span className="text-[10px] text-slate-400 font-normal">({item.ia2.grade})</span>
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-center font-bold text-slate-800">
                    {item.midterm ? (
                      <span className="inline-flex items-center gap-1">
                        {item.midterm.marksObtained}
                        <span className="text-[10px] text-slate-400 font-normal">({item.midterm.grade})</span>
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    {item.totalMax > 0 ? (
                      <span className="font-extrabold text-slate-900">
                        {item.totalObtained} / {item.totalMax}{' '}
                        <span className="text-[10px] text-slate-500 font-normal">
                          ({item.percentage}%)
                        </span>
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    {item.totalMax > 0 ? (
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-extrabold ${
                          item.overallGrade === 'A+' || item.overallGrade === 'A'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.overallGrade === 'B' || item.overallGrade === 'C'
                            ? 'bg-blue-100 text-blue-800'
                            : item.overallGrade === 'D' || item.overallGrade === 'E'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.overallGrade} ({item.gradePoint} pts)
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    {item.totalMax > 0 ? (
                      item.status === 'PASS' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> PASS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          <AlertTriangle className="w-3 h-3" /> FAIL
                        </span>
                      )
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">In Progress</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyMarks;
