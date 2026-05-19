import RoleBadge from './RoleBadge';

export const DEMO_ACCOUNTS = [
  { role: 'employee', label: 'Employee', email: 'employee@company.com', password: 'Demo@123' },
  { role: 'manager', label: 'Manager', email: 'manager@company.com', password: 'Demo@123' },
  { role: 'admin', label: 'Admin / HR', email: 'admin@company.com', password: 'Demo@123' },
];

export default function DemoAccounts({ onSelect }) {
  return (
    <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Quick demo access
      </p>
      <p className="mt-1 text-xs text-slate-400">Password for all: Demo@123</p>
      <ul className="mt-3 space-y-2">
        {DEMO_ACCOUNTS.map((acc) => (
          <li key={acc.email}>
            <button
              type="button"
              onClick={() => onSelect(acc)}
              className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-sm shadow-sm transition hover:border-brand-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
            >
              <span className="flex items-center gap-2">
                <RoleBadge role={acc.role} />
                <span className="font-medium text-slate-800">{acc.label}</span>
              </span>
              <span className="truncate text-xs text-slate-400">{acc.email}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
