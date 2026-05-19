import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { goalsAPI } from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatLabel, statusColor } from '../../utils/validation';

export default function EmployeeDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const year = new Date().getFullYear();

  useEffect(() => {
    goalsAPI
      .getDashboard({ year, quarter: 'Q1' })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [year]);

  if (loading) return <LoadingSpinner className="py-20" />;

  const { stats, goalSheet } = data || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Dashboard</h1>
          <p className="text-slate-500">FY {year} goal overview</p>
        </div>
        <Link to="/goals" className="btn-primary">
          Manage Goals
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Goals" value={stats?.totalGoals ?? 0} icon="🎯" />
        <StatCard
          title="Sheet Status"
          value={formatLabel(stats?.status)}
          color={stats?.status === 'approved' ? 'green' : 'amber'}
          icon="📋"
        />
        <StatCard
          title="Weightage Used"
          value={`${stats?.weightageUsed ?? 0}%`}
          subtitle="Must equal 100% to submit"
          icon="⚖️"
        />
        <StatCard
          title="Q1 Progress"
          value={`${stats?.overallProgress ?? 0}%`}
          color="purple"
          icon="📈"
        />
      </div>

      <div className="card">
        <h3 className="font-semibold text-slate-900">Quick actions</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/goals" className="btn-secondary">
            {goalSheet?.status === 'draft' ? 'Create / Edit Goals' : 'View Goals'}
          </Link>
          {stats?.status === 'approved' && (
            <Link to="/achievements" className="btn-primary">
              Update Q1 Achievements
            </Link>
          )}
        </div>
        {goalSheet?.status && (
          <p className="mt-4">
            Status:{' '}
            <span className={`badge ${statusColor(goalSheet.status)}`}>
              {formatLabel(goalSheet.status)}
            </span>
            {goalSheet.isLocked && (
              <span className="ml-2 badge bg-slate-100 text-slate-600">Locked</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
