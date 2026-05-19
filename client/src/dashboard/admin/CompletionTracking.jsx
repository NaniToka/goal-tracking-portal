import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatLabel, statusColor } from '../../utils/validation';

export default function CompletionTracking() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const year = new Date().getFullYear();

  useEffect(() => {
    adminAPI
      .getDashboard({ year, quarter: 'Q1' })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [year]);

  const handleUnlock = async (sheetId) => {
    if (!confirm('Unlock this goal sheet for editing?')) return;
    try {
      await adminAPI.unlockSheet(sheetId);
      toast.success('Goal sheet unlocked');
      const res = await adminAPI.getDashboard({ year, quarter: 'Q1' });
      setData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Completion Tracking</h1>
      <p className="text-slate-500">Organization-wide goal completion — FY {year}</p>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="pb-3 pr-4">Employee</th>
              <th className="pb-3 pr-4">Department</th>
              <th className="pb-3 pr-4">Goals</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3 pr-4">Progress</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data?.progressData || []).map((row, i) => (
              <tr key={i} className="border-b border-slate-50">
                <td className="py-3 pr-4 font-medium">{row.employee}</td>
                <td className="py-3 pr-4">{row.department}</td>
                <td className="py-3 pr-4">{row.goalCount}</td>
                <td className="py-3 pr-4">
                  <span className={`badge ${statusColor(row.status)}`}>{formatLabel(row.status)}</span>
                </td>
                <td className="py-3 pr-4 font-medium text-brand-600">{row.progress}%</td>
                <td className="py-3 pr-4">
                  {row.status === 'approved' && (
                    <button
                      onClick={() => handleUnlock(row._id)}
                      className="text-sm text-amber-600 hover:underline"
                    >
                      Unlock
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
