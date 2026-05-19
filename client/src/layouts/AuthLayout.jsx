import { Outlet, Link } from 'react-router-dom';

const FEATURES = [
  'Role-based dashboards for Employee, Manager & HR',
  'Goal approval workflows with inline manager edits',
  'Quarterly achievement tracking & progress formulas',
  'CSV/Excel reports, analytics & audit logging',
];

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Brand panel */}
      <aside className="relative hidden w-[45%] overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-indigo-900 lg:flex lg:flex-col">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-400/40 blur-3xl" />
        </div>

        <div className="relative flex flex-1 flex-col justify-between p-12 xl:p-16">
          <div>
            <Link to="/login" className="inline-flex items-center gap-3 text-white">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-2xl backdrop-blur">
                🎯
              </span>
              <span className="text-lg font-bold tracking-tight">Goal Tracking Portal</span>
            </Link>
            <h1 className="mt-14 text-3xl font-bold leading-tight text-white xl:text-4xl">
              Align goals. Track progress. Deliver results.
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-brand-100">
              Enterprise goal setting and quarterly performance management for modern teams.
            </p>
          </div>

          <ul className="space-y-3 text-sm text-brand-100">
            {FEATURES.map((text) => (
              <li key={text} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs text-white">
                  ✓
                </span>
                {text}
              </li>
            ))}
          </ul>

          <p className="text-xs text-brand-200/80">© {new Date().getFullYear()} Goal Tracking Portal</p>
        </div>
      </aside>

      {/* Auth form panel */}
      <main className="flex flex-1 flex-col">
        <div className="flex items-center justify-between px-6 py-4 lg:hidden">
          <Link to="/login" className="flex items-center gap-2 font-bold text-brand-700">
            <span className="text-xl">🎯</span>
            Goal Portal
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
