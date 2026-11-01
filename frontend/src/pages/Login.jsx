import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  GraduationCap,
  ShieldCheck,
  Briefcase,
  UserCheck,
  AlertTriangle,
  ArrowRight,
  Lock,
  Mail,
  UserPlus,
  Sparkles,
  BookOpen,
  X,
  Chrome,
  Eye,
  EyeOff,
} from 'lucide-react';

// Google Icon SVG component
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const Login = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('STUDENT');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);

  // Gmail modal state
  const [showGmailModal, setShowGmailModal] = useState(false);
  const [gmailAddress, setGmailAddress] = useState('');
  const [gmailName, setGmailName] = useState('');
  const [gmailRole, setGmailRole] = useState('STUDENT');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register, googleAuth, quickLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch available roles for registration dropdown
    const fetchRoles = async () => {
      try {
        const res = await api.get('/roles');
        if (res.data.success && res.data.data.length > 0) {
          setAvailableRoles(res.data.data);
          setRegRole(res.data.data[2]?.name || 'STUDENT'); // default to STUDENT
          setGmailRole(res.data.data[2]?.name || 'STUDENT');
        }
      } catch (e) {
        // Fallback default roles
        const defaults = [
          { name: 'ADMIN', displayName: 'Administrator' },
          { name: 'FACULTY', displayName: 'Faculty Member' },
          { name: 'STUDENT', displayName: 'Student' },
          { name: 'HOD', displayName: 'Head of Department (HOD)' },
          { name: 'EXAM_CONTROLLER', displayName: 'Controller of Examinations' },
        ];
        setAvailableRoles(defaults);
      }
    };
    fetchRoles();
  }, []);

  const handleRedirect = (role) => {
    if (role === 'ADMIN') navigate('/admin');
    else if (role === 'FACULTY') navigate('/faculty');
    else if (role === 'STUDENT') navigate('/student');
    else navigate('/portal');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      handleRedirect(res.user.role);
    } else {
      setError(res.message);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const res = await register(regName, regEmail, regPassword, regRole);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(`Account created! Welcome, ${res.user.name}. Redirecting...`);
      setTimeout(() => handleRedirect(res.user.role), 1200);
    } else {
      setError(res.message);
    }
  };

  const handleQuickLogin = async (roleType) => {
    setError('');
    setIsSubmitting(true);
    const res = await quickLogin(roleType);
    setIsSubmitting(false);

    if (res.success) {
      handleRedirect(res.user.role);
    } else {
      setError(res.message);
    }
  };

  const handleGmailSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const emailVal = gmailAddress.toLowerCase().trim();
    const nameVal = gmailName.trim() || emailVal.split('@')[0];

    const res = await googleAuth(emailVal, nameVal, gmailRole);
    setIsSubmitting(false);

    if (res.success) {
      setShowGmailModal(false);
      setSuccessMsg(`Welcome, ${res.user.name}! Signed in via Gmail.`);
      setTimeout(() => handleRedirect(res.user.role), 1000);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex flex-col justify-center py-10 sm:px-6 lg:px-8 px-4 text-slate-100">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-sky-400 text-white shadow-xl shadow-blue-500/25 mb-4">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Academia<span className="text-blue-400">Pro</span> ERP
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Integrated College ERP System — Students, Faculty, Attendance, Marks & Custom Roles
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-xl">
        {/* Quick Demo Logins */}
        <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700/80 mb-5 shadow-lg">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
            <span>⚡ 1-Click Demo Logins</span>
            <span className="text-[10px] text-blue-400 font-medium">Instant evaluation</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              disabled={isSubmitting}
              className="p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-200 text-xs font-semibold transition text-left"
            >
              <div className="font-bold flex items-center gap-1.5 mb-0.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Admin
              </div>
              <div className="text-purple-400 text-[10px]">admin@erp.edu</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('faculty')}
              disabled={isSubmitting}
              className="p-2.5 rounded-xl bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/30 text-blue-200 text-xs font-semibold transition text-left"
            >
              <div className="font-bold flex items-center gap-1.5 mb-0.5">
                <Briefcase className="w-3.5 h-3.5" /> Faculty
              </div>
              <div className="text-blue-400 text-[10px]">faculty.cs@erp.edu</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('student_good')}
              disabled={isSubmitting}
              className="p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-200 text-xs font-semibold transition text-left"
            >
              <div className="font-bold flex items-center gap-1.5 mb-0.5">
                <GraduationCap className="w-3.5 h-3.5" /> Student A
              </div>
              <div className="text-emerald-400 text-[10px]">student1@erp.edu</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('student_low')}
              disabled={isSubmitting}
              className="p-2.5 rounded-xl bg-orange-950/40 hover:bg-orange-900/60 border border-orange-500/30 text-orange-200 text-xs font-semibold transition text-left"
            >
              <div className="font-bold flex items-center gap-1.5 mb-0.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Student B
              </div>
              <div className="text-orange-400 text-[10px]">Shortage Warning</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('hod')}
              disabled={isSubmitting}
              className="p-2.5 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-200 text-xs font-semibold transition text-left"
            >
              <div className="font-bold flex items-center gap-1.5 mb-0.5">
                <UserCheck className="w-3.5 h-3.5" /> HOD
              </div>
              <div className="text-indigo-400 text-[10px]">hod.cs@erp.edu</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('exam')}
              disabled={isSubmitting}
              className="p-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-200 text-xs font-semibold transition text-left"
            >
              <div className="font-bold flex items-center gap-1.5 mb-0.5">
                <BookOpen className="w-3.5 h-3.5" /> Exam Ctrl
              </div>
              <div className="text-rose-400 text-[10px]">exam@erp.edu</div>
            </button>
          </div>

          {/* Gmail Quick Login */}
          <div className="mt-3 pt-3 border-t border-slate-700/60">
            <button
              type="button"
              onClick={() => handleQuickLogin('gmail_admin')}
              disabled={isSubmitting}
              className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition flex items-center gap-2"
            >
              <GoogleIcon />
              <span>Login as <strong>mohingoyal45@gmail.com</strong> (Admin)</span>
            </button>
          </div>
        </div>

        {/* Main Auth Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-7 text-slate-800">
          {/* Tabs */}
          <div className="flex rounded-xl overflow-hidden mb-6 border border-slate-200">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2.5 text-sm font-semibold transition ${
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Lock className="w-4 h-4 inline mr-1.5" />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2.5 text-sm font-semibold transition ${
                mode === 'register'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              <UserPlus className="w-4 h-4 inline mr-1.5" />
              Add Account / Role
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <p className="text-xs text-emerald-700 font-medium">{successMsg}</p>
            </div>
          )}

          {mode === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com or @gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-medium">OR</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Gmail Sign In Button */}
              <button
                type="button"
                onClick={() => { setShowGmailModal(true); setError(''); }}
                className="w-full py-2.5 px-4 rounded-xl border-2 border-slate-200 hover:border-blue-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm flex items-center justify-center gap-2.5 transition"
              >
                <GoogleIcon />
                <span>Continue with Gmail / Google Account</span>
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 mb-2">
                <p className="text-xs text-blue-700 font-medium">
                  ✅ Supports any email — <strong>@gmail.com</strong>, @yahoo.com, @erp.edu, or custom domain.
                  The role you select will define your access level in the system.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Mohin Goyal"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="mohin@gmail.com or mohin@erp.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Choose Your Role *
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {availableRoles.map((r) => (
                    <option key={r.name} value={r.name}>
                      {r.displayName} ({r.name})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Custom roles (HOD, Exam Controller, etc.) can be configured from Admin panel.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Set Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Account & Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Gmail option in register too */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-medium">OR</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              <button
                type="button"
                onClick={() => { setShowGmailModal(true); setError(''); }}
                className="w-full py-2.5 px-4 rounded-xl border-2 border-slate-200 hover:border-blue-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm flex items-center justify-center gap-2.5 transition"
              >
                <GoogleIcon />
                <span>Register with Gmail / Google</span>
              </button>
            </form>
          )}

          {/* Switch mode link */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              {mode === 'login' ? (
                <>
                  Need to add a custom role or new account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(''); }}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Create account
                  </button>
                </>
              ) : (
                <>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); }}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Sign in here
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-4">
          AcademiaPro ERP &copy; {new Date().getFullYear()} — Powered by React + Node.js + SQLite
        </p>
      </div>

      {/* Gmail Sign-In Modal */}
      {showGmailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm relative">
            <button
              type="button"
              onClick={() => { setShowGmailModal(false); setError(''); }}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shadow-sm">
                <GoogleIcon />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Sign in with Gmail</h3>
                <p className="text-xs text-slate-500">Auto-registers if first time</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-red-700 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleGmailSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Gmail Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={gmailAddress}
                    onChange={(e) => setGmailAddress(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Enter any Gmail or email. New accounts are created automatically.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Your Name <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={gmailName}
                  onChange={(e) => setGmailName(e.target.value)}
                  placeholder="Leave blank to use email username"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Role (for new accounts)
                </label>
                <select
                  value={gmailRole}
                  onChange={(e) => setGmailRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {availableRoles.map((r) => (
                    <option key={r.name} value={r.name}>
                      {r.displayName}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  If this Gmail is already registered, your existing role is used.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <GoogleIcon />
                    <span>Continue with Gmail</span>
                  </>
                )}
              </button>
            </form>

            <p className="mt-4 text-[10px] text-slate-400 text-center">
              mohingoyal45@gmail.com is pre-registered as Admin
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
