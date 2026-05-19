import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const year = new Date().getFullYear();

  useEffect(() => {
    adminAPI
      .getDashboard({ year, quarter: 'Q1' })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [year]);

  if (loading) return <LoadingSpinner className="py-20" />;

  const { stats, progressData } = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-slate-500">Organization-wide overview — FY {year}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={stats?.totalUsers ?? 0} icon="👤" />
        <StatCard title="Employees" value={stats?.employees ?? 0} icon="🧑‍💼" />
        <StatCard title="Managers" value={stats?.managers ?? 0} icon="👔" />
        <StatCard title="Avg Progress" value={`${stats?.avgProgress ?? 0}%`} color="purple" icon="📊" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h3 className="font-semibold mb-4">Completion by Status</h3>
          <div className="space-y-2">
            {stats?.completionStats &&
              Object.entries(stats.completionStats).map(([key, val]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="capitalize text-slate-600">{key.replace(/_/g, ' ')}</span>
                  <span className="font-semibold">{val}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4">Top Progress</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {(progressData || []).slice(0, 8).map((p, i) => (
              <div key={i} className="flex justify-between text-sm border-b border-slate-50 py-2">
                <span>{p.employee}</span>
                <span className="font-medium text-brand-600">{p.progress}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
