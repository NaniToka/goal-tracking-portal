import { Route, Navigate } from 'react-router-dom';
import GuestRoute from './GuestRoute';
import AuthLayout from '../layouts/AuthLayout';
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';

/**
 * Public authentication routes (guest-only)
 */
export function AuthRoutes() {
  return (
    <Route
      element={
        <GuestRoute>
          <AuthLayout />
        </GuestRoute>
      }
    >
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth" element={<Navigate to="/login" replace />} />
    </Route>
  );
}
