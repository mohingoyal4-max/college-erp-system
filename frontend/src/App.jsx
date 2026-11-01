import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentsList from './pages/admin/StudentsList';
import FacultyList from './pages/admin/FacultyList';
import DepartmentsList from './pages/admin/DepartmentsList';
import SubjectsList from './pages/admin/SubjectsList';
import AdminAttendance from './pages/admin/AdminAttendance';
import AdminMarks from './pages/admin/AdminMarks';
import NoticesPage from './pages/admin/NoticesPage';
import RoleManagement from './pages/admin/RoleManagement';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import TakeAttendance from './pages/faculty/TakeAttendance';
import ViewAttendance from './pages/faculty/ViewAttendance';
import EnterMarks from './pages/faculty/EnterMarks';
import SubjectMarksView from './pages/faculty/SubjectMarksView';
import AssignedClasses from './pages/faculty/AssignedClasses';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyAttendance from './pages/student/MyAttendance';
import MyMarks from './pages/student/MyMarks';
import MyCourses from './pages/student/MyCourses';
import StudentProfile from './pages/student/StudentProfile';

// Custom Role Portal
import CustomPortalDashboard from './pages/custom/CustomPortalDashboard';

// Helper Root Redirect
const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user?.role === 'FACULTY') return <Navigate to="/faculty" replace />;
  if (user?.role === 'STUDENT') return <Navigate to="/student" replace />;

  return <Navigate to="/portal" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login & Register Route */}
          <Route path="/login" element={<Login />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Custom Role Portal Route */}
          <Route
            path="/portal"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CustomPortalDashboard />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<StudentsList />} />
            <Route path="faculty" element={<FacultyList />} />
            <Route path="departments" element={<DepartmentsList />} />
            <Route path="subjects" element={<SubjectsList />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="marks" element={<AdminMarks />} />
            <Route path="roles" element={<RoleManagement />} />
            <Route path="notices" element={<NoticesPage />} />
          </Route>

          {/* Faculty Routes */}
          <Route
            path="/faculty"
            element={
              <ProtectedRoute allowedRoles={['FACULTY']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<FacultyDashboard />} />
            <Route path="take-attendance" element={<TakeAttendance />} />
            <Route path="attendance-history" element={<ViewAttendance />} />
            <Route path="enter-marks" element={<EnterMarks />} />
            <Route path="subject-marks" element={<SubjectMarksView />} />
            <Route path="classes" element={<AssignedClasses />} />
          </Route>

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="attendance" element={<MyAttendance />} />
            <Route path="marks" element={<MyMarks />} />
            <Route path="courses" element={<MyCourses />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>

          {/* 404 Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
