const ROLE_STYLES = {
  employee: 'bg-blue-100 text-blue-800 ring-blue-200',
  manager: 'bg-violet-100 text-violet-800 ring-violet-200',
  admin: 'bg-amber-100 text-amber-800 ring-amber-200',
};

export default function RoleBadge({ role }) {
  const style = ROLE_STYLES[role] || 'bg-slate-100 text-slate-700 ring-slate-200';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${style}`}>
      {role}
    </span>
  );
}
