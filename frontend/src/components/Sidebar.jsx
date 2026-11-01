import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  BookOpen,
  CalendarCheck,
  Award,
  BellRing,
  ClipboardList,
  FileSpreadsheet,
  GraduationCap,
  ShieldCheck,
  User,
  X,
  Sparkles,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role;
  const permissions = user?.permissions || [];

  const getLinks = () => {
    if (role === 'ADMIN') {
      return [
        { label: 'Overview', to: '/admin', icon: LayoutDashboard },
        { label: 'Students', to: '/admin/students', icon: Users },
        { label: 'Faculty Directory', to: '/admin/faculty', icon: UserCheck },
        { label: 'Departments', to: '/admin/departments', icon: Building2 },
        { label: 'Subjects & Curriculum', to: '/admin/subjects', icon: BookOpen },
        { label: 'Attendance Records', to: '/admin/attendance', icon: CalendarCheck },
        { label: 'Marks & Results', to: '/admin/marks', icon: Award },
        { label: 'Role & Permissions', to: '/admin/roles', icon: ShieldCheck },
        { label: 'Campus Notices', to: '/admin/notices', icon: BellRing },
      ];
    }

    if (role === 'FACULTY') {
      return [
        { label: 'Faculty Dashboard', to: '/faculty', icon: LayoutDashboard },
        { label: 'Mark Attendance', to: '/faculty/take-attendance', icon: CalendarCheck },
        { label: 'Attendance History', to: '/faculty/attendance-history', icon: ClipboardList },
        { label: 'Enter Exam Marks', to: '/faculty/enter-marks', icon: Award },
        { label: 'Class Marksheets', to: '/faculty/subject-marks', icon: FileSpreadsheet },
        { label: 'Assigned Classes', to: '/faculty/classes', icon: BookOpen },
      ];
    }

    if (role === 'STUDENT') {
      return [
        { label: 'Student Dashboard', to: '/student', icon: LayoutDashboard },
        { label: 'My Attendance', to: '/student/attendance', icon: CalendarCheck },
        { label: 'My Grades & Report', to: '/student/marks', icon: Award },
        { label: 'Enrolled Courses', to: '/student/courses', icon: BookOpen },
        { label: 'My Profile', to: '/student/profile', icon: User },
      ];
    }

    // Dynamic Links for Custom Roles (HOD, EXAM_CONTROLLER, LIBRARIAN, etc.)
    const customLinks = [{ label: 'Dashboard', to: '/portal', icon: LayoutDashboard }];

    if (permissions.includes('view_students')) {
      customLinks.push({ label: 'Students Directory', to: '/admin/students', icon: Users });
    }
    if (permissions.includes('view_faculty')) {
      customLinks.push({ label: 'Faculty Directory', to: '/admin/faculty', icon: UserCheck });
    }
    if (permissions.includes('view_attendance') || permissions.includes('manage_attendance')) {
      customLinks.push({ label: 'Attendance Logs', to: '/admin/attendance', icon: CalendarCheck });
    }
    if (permissions.includes('view_marks') || permissions.includes('manage_marks')) {
      customLinks.push({ label: 'Marks & Results', to: '/admin/marks', icon: Award });
    }
    if (permissions.includes('view_departments')) {
      customLinks.push({ label: 'Departments', to: '/admin/departments', icon: Building2 });
    }
    if (permissions.includes('view_subjects')) {
      customLinks.push({ label: 'Curriculum', to: '/admin/subjects', icon: BookOpen });
    }
    if (permissions.includes('view_notices')) {
      customLinks.push({ label: 'Campus Notices', to: '/admin/notices', icon: BellRing });
    }

    return customLinks;
  };

  const links = getLinks();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 md:top-16 z-40 h-full md:h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-4">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 md:hidden">
            <span className="text-sm font-bold text-slate-800">Navigation</span>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {user?.roleDisplayName || `${role} Portal`}
          </div>

          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={
                    link.to === '/admin' ||
                    link.to === '/faculty' ||
                    link.to === '/student' ||
                    link.to === '/portal'
                  }
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100/60'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-primary-600' : 'text-slate-400'
                        }`}
                      />
                      <span>{link.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar footer badge */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 m-3 rounded-2xl border">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <div>
              <p className="text-xs font-semibold text-slate-800">Spring Term 2026</p>
              <p className="text-[11px] text-slate-500">Academic Year 2025-26</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
