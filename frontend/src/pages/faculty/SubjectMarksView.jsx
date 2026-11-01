import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import { Award, BookOpen, TrendingUp, CheckCircle, FileSpreadsheet } from 'lucide-react';

const SubjectMarksView = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClassIndex, setSelectedClassIndex] = useState(0);

  const [marksData, setMarksData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (classes.length === 0) return;
    const currentClass = classes[selectedClassIndex];
    if (!currentClass) return;

    const fetchMarks = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/marks/subject/${currentClass.subject.id}`, {
          params: { section: currentClass.section },
        });
        if (res.data.success) {
          setMarksData(res.data);
        }
      } catch (err) {
        console.error('Failed to load marks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, [classes, selectedClassIndex]);

  const analytics = marksData?.analytics || {};
  const studentMarks = marksData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Class Marksheet</h1>
          <p className="text-xs text-slate-500">Comprehensive subject performance scorecard for all enrolled students</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
          Select Assigned Course
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Evaluations Done"
          value={analytics.totalEvaluated || 0}
          subtitle="Tests recorded"
          icon={Award}
          color="blue"
        />
        <StatCard
          title="Overall Average"
          value={analytics.average !== undefined ? `${analytics.average}` : '—'}
          subtitle="Mean class score"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Pass Percentage"
          value={analytics.passPercentage !== undefined ? `${analytics.passPercentage}%` : '—'}
          subtitle="Passing threshold (≥40%)"
          icon={CheckCircle}
          color={analytics.passPercentage >= 75 ? 'emerald' : 'amber'}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Student Scores Summary</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Roll No</th>
                <th className="px-6 py-3.5">Student Name</th>
                <th className="px-6 py-3.5 text-center">IA-1 (/25)</th>
                <th className="px-6 py-3.5 text-center">IA-2 (/25)</th>
                <th className="px-6 py-3.5 text-center">Midterm (/50)</th>
                <th className="px-6 py-3.5 text-right">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading marksheet...
                  </td>
                </tr>
              ) : studentMarks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                    No scores recorded yet.
                  </td>
                </tr>
              ) : (
                studentMarks.map((item) => {
                  const ia1 = item.marks?.find((m) => m.examType === 'IA1');
                  const ia2 = item.marks?.find((m) => m.examType === 'IA2');
                  const mid = item.marks?.find((m) => m.examType === 'MIDTERM');

                  return (
                    <tr key={item.studentId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-3.5 font-mono font-bold text-slate-800">
                        {item.rollNo}
                      </td>
                      <td className="px-6 py-3.5 font-bold text-slate-900">{item.name}</td>
                      <td className="px-6 py-3.5 text-center font-bold text-slate-800">
                        {ia1 ? (
                          <span className="inline-flex items-center gap-1">
                            {ia1.marksObtained}
                            <span className="text-[10px] text-slate-400 font-normal">({ia1.grade})</span>
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-center font-bold text-slate-800">
                        {ia2 ? (
                          <span className="inline-flex items-center gap-1">
                            {ia2.marksObtained}
                            <span className="text-[10px] text-slate-400 font-normal">({ia2.grade})</span>
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-center font-bold text-slate-800">
                        {mid ? (
                          <span className="inline-flex items-center gap-1">
                            {mid.marksObtained}
                            <span className="text-[10px] text-slate-400 font-normal">({mid.grade})</span>
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right text-slate-500">
                        {ia1?.remarks || mid?.remarks || 'Good standing'}
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

export default SubjectMarksView;
