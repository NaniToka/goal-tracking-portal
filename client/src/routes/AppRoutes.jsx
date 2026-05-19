import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ProtectedRoute from './ProtectedRoute';
import { AuthRoutes } from './AuthRoutes';
import Layout from '../layouts/Layout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Unauthorized from '../pages/auth/Unauthorized';

import EmployeeDashboard from '../dashboard/employee/EmployeeDashboard';
import GoalSheet from '../dashboard/employee/GoalSheet';
import Achievements from '../dashboard/employee/Achievements';
import ManagerDashboard from '../dashboard/manager/ManagerDashboard';
import TeamGoals from '../dashboard/manager/TeamGoals';
import AdminDashboard from '../dashboard/admin/AdminDashboard';
import UserManagement from '../dashboard/admin/UserManagement';
import CompletionTracking from '../dashboard/admin/CompletionTracking';
import AuditLogs from '../dashboard/admin/AuditLogs';
import Reports from '../dashboard/Reports';

function RoleDashboard() {
  const { user } = useAuth();
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'manager') return <ManagerDashboard />;
  return <EmployeeDashboard />;
}

export default function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      {AuthRoutes()}

      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<RoleDashboard />} />

        <Route
          path="goals"
          element={
            <ProtectedRoute roles={['employee']}>
              <GoalSheet />
            </ProtectedRoute>
          }
        />
        <Route
          path="achievements"
          element={
            <ProtectedRoute roles={['employee']}>
              <Achievements />
            </ProtectedRoute>
          }
        />
        <Route
          path="team-goals"
          element={
            <ProtectedRoute roles={['manager', 'admin']}>
              <TeamGoals />
            </ProtectedRoute>
          }
        />
        <Route
          path="users"
          element={
            <ProtectedRoute roles={['admin']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="completion"
          element={
            <ProtectedRoute roles={['admin']}>
              <CompletionTracking />
            </ProtectedRoute>
          }
        />
        <Route
          path="audit-logs"
          element={
            <ProtectedRoute roles={['admin']}>
              <AuditLogs />
            </ProtectedRoute>
          }
        />
        <Route path="reports" element={<Reports />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
