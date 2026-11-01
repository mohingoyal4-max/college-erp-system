import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { BookOpen, CalendarCheck, Award, Users, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const AssignedClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const res = await api.get('/faculty/my-classes');
        if (res.data.success) {
          setClasses(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load classes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Assigned Teaching Schedule</h1>
          <p className="text-xs text-slate-500">Curriculum courses and classroom batches under your instruction</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading assigned classes...
          </div>
        ) : classes.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            No course assignments found.
          </div>
        ) : (
          classes.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-primary-50 text-primary-700 border border-primary-100">
                    {item.subject.code}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    Section {item.section}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">{item.subject.name}</h3>
                <p className="text-xs text-slate-500 mb-4">
                  {item.subject.department.name} • Semester {item.subject.semester}
                </p>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Type</span>
                    <strong className="text-slate-800">{item.subject.type}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Credits</span>
                    <strong className="text-slate-800">{item.subject.credits}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Year</span>
                    <strong className="text-slate-800">{item.academicYear}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
                <Link
                  to={`/faculty/take-attendance?subjectId=${item.subject.id}&section=${item.section}&semester=${item.subject.semester}`}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center shadow-xs transition"
                >
                  Take Attendance
                </Link>
                <Link
                  to={`/faculty/enter-marks?subjectId=${item.subject.id}&section=${item.section}`}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs text-center transition"
                >
                  Enter Marks
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AssignedClasses;
