import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Bell, Menu, GraduationCap, ShieldCheck, Briefcase, Sparkles } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  const getRoleBadge = () => {
    const role = user?.role;
    const title = user?.roleDisplayName || role;

    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Administrator
          </span>
        );
      case 'FACULTY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <Briefcase className="w-3.5 h-3.5" />
            Faculty
          </span>
        );
      case 'STUDENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-700 border border-sky-200">
            <GraduationCap className="w-3.5 h-3.5" />
            Student
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            {title}
          </span>
        );
    }
  };

  const getUserSubtitle = () => {
    if (user?.role === 'STUDENT' && user.studentProfile) {
      return `Roll: ${user.studentProfile.rollNo} • Sem ${user.studentProfile.semester}`;
    }
    if (user?.role === 'FACULTY' && user.facultyProfile) {
      return `${user.facultyProfile.designation || 'Faculty'} • ${user.facultyProfile.employeeId}`;
    }
    if (user?.role === 'ADMIN') {
      return 'ERP Dean & Administrator';
    }
    return user?.roleDisplayName || 'Custom Institutional Role';
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-500 rounded-lg md:hidden hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-sky-400 text-white shadow-md shadow-primary-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Academia<span className="text-primary-600">Pro</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                ERP v2.6
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800">{user?.name}</span>
              {getRoleBadge()}
            </div>
            <span className="text-xs text-slate-500">{getUserSubtitle()}</span>
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors shadow-sm"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
