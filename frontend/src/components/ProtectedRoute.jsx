import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'#666' }}>
      Loading...
    </div>
  );

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (adminOnly && !user.is_admin) return <Navigate to="/" replace />;

  return children;
}
