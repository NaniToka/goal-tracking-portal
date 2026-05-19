export default function EmptyState({ icon = '📭', title = 'No data', message, action }) {
  return (
    <div className="card flex flex-col items-center justify-center py-16 text-center">
      <span className="text-4xl">{icon}</span>
      <h3 className="mt-4 text-lg font-semibold text-slate-800">{title}</h3>
      {message && <p className="mt-2 max-w-sm text-sm text-slate-500">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
