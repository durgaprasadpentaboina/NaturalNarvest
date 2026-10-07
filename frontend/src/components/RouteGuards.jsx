import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from './Spinner';
import EmptyState from './EmptyState';

export function ProtectedRoute({ children }) {
  const { user, initializing } = useAuth();
  const location = useLocation();
  if (initializing) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return children;
}

export function AdminRoute({ children }) {
  const { user, initializing, isAdmin } = useAuth();
  const location = useLocation();
  if (initializing) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!isAdmin) return <EmptyState icon={ShieldAlert} title="Admins only" message="This area is for store administrators. Your account does not have access." actionLabel="Back to shop" actionTo="/" />;
  return children;
}
