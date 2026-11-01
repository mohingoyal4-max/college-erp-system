import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Loading AcademiaPro ERP...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles) {
    const isAllowedRole = allowedRoles.includes(user.role);
    const isCustomRole = !['ADMIN', 'FACULTY', 'STUDENT'].includes(user.role);
    
    // Custom roles are allowed to access modules if allowedRoles includes 'ADMIN'
    const isCustomAllowed = isCustomRole && allowedRoles.includes('ADMIN');

    if (!isAllowedRole && !isCustomAllowed) {
      if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
      if (user.role === 'FACULTY') return <Navigate to="/faculty" replace />;
      if (user.role === 'STUDENT') return <Navigate to="/student" replace />;
      return <Navigate to="/portal" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
