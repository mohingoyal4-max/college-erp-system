import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { BookOpen, User, Mail, Award, Clock } from 'lucide-react';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await api.get('/students/my-subjects');
        if (res.data.success) {
          setCourses(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load enrolled courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Registered Curriculum Courses</h1>
          <p className="text-xs text-slate-500">Academic syllabus, assigned instructors, and course credits</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading enrolled courses...
          </div>
        ) : courses.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            No enrolled courses found for your department and semester.
          </div>
        ) : (
          courses.map((course) => {
            const facultyAssignment = course.assignments && course.assignments[0];

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded bg-primary-50 text-primary-700 border border-primary-100">
                      {course.code}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      Sem {course.semester}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                    {course.name}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                    <span>
                      <strong className="text-slate-800">{course.credits}</strong> Credits
                    </span>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                      {course.type}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Course Instructor
                  </span>
                  {facultyAssignment ? (
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                        {facultyAssignment.faculty?.user?.name?.charAt(0) || 'F'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {facultyAssignment.faculty?.user?.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {facultyAssignment.faculty?.user?.email}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Instructor pending assignment</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MyCourses;
