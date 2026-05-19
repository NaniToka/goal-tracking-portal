import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../hooks/useAuth';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col lg:pl-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl hidden sm:inline-block">🎯</span>
              <h1 className="text-lg font-semibold text-slate-800 hidden sm:block">
                Goal Tracking Portal
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 text-right">
              <div>
                <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-red-600 transition-colors"
              aria-label="Logout"
              title="Sign out"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
