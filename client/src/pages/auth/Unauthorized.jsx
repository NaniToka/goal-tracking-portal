import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import RoleBadge from '../../components/auth/RoleBadge';

export default function Unauthorized() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6">
      <div className="card max-w-md w-full text-center">
        <span className="text-5xl">🔒</span>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Access denied</h1>
        <p className="mt-2 text-sm text-slate-500">
          Your account does not have permission to view this page.
        </p>
        {user && (
          <p className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-600">
            Signed in as <strong>{user.name}</strong>
            <RoleBadge role={user.role} />
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/dashboard" className="btn-primary">
            Go to dashboard
          </Link>
          <button type="button" onClick={logout} className="btn-secondary">
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
