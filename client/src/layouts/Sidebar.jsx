import { NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const navByRole = {
  employee: [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/goals', label: 'My Goals', icon: '🎯' },
    { to: '/achievements', label: 'Achievements', icon: '📈' },
  ],
  manager: [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/team-goals', label: 'Team Goals', icon: '👥' },
    { to: '/reports', label: 'Reports', icon: '📋' },
  ],
  admin: [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/users', label: 'Manage Users', icon: '👤' },
    { to: '/completion', label: 'Completion Tracking', icon: '✅' },
    { to: '/audit-logs', label: 'Audit Logs', icon: '📝' },
    { to: '/reports', label: 'Reports', icon: '📋' },
  ],
};

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = navByRole[user?.role] || [];

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    navigate('/login', { replace: true });
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 text-white transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-slate-700 px-6">
          <span className="text-2xl">🎯</span>
          <div>
            <h1 className="text-sm font-bold">Goal Portal</h1>
            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <span>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-700 p-4">
          <div className="mb-3 px-3">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
