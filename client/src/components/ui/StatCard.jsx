export default function StatCard({ title, value, subtitle, icon, color = 'brand' }) {
  const colors = {
    brand: 'bg-brand-50 text-brand-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="card flex items-start gap-4">
      {icon && (
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${colors[color]}`}>
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}
