import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { managerAPI } from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function ManagerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const year = new Date().getFullYear();

  useEffect(() => {
    managerAPI
      .getDashboard({ year, quarter: 'Q1' })
      .then((res) => setStats(res.data.stats))
      .finally(() => setLoading(false));
  }, [year]);

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manager Dashboard</h1>
          <p className="text-slate-500">Team performance overview — FY {year}</p>
        </div>
        <Link to="/team-goals" className="btn-primary">
          Review Team Goals
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Team Size" value={stats?.teamSize ?? 0} icon="👥" />
        <StatCard title="Pending Approval" value={stats?.pendingApproval ?? 0} color="amber" icon="⏳" />
        <StatCard title="Approved" value={stats?.approved ?? 0} color="green" icon="✅" />
        <StatCard title="Avg Team Progress" value={`${stats?.avgProgress ?? 0}%`} color="purple" icon="📈" />
      </div>
    </div>
  );
}
