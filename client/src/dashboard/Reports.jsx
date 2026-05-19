import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { reportsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Button, Select, Card } from '../components/ui';
import { QUARTERS } from '../utils/validation';

export default function Reports() {
  const { user } = useAuth();
  const year = new Date().getFullYear();
  const [quarter, setQuarter] = useState('Q1');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAdminOrManager = ['admin', 'manager'].includes(user?.role);

  useEffect(() => {
    if (!isAdminOrManager) {
      setLoading(false);
      return;
    }
    reportsAPI
      .getAnalytics({ year, quarter })
      .then((res) => setAnalytics(res.data))
      .finally(() => setLoading(false));
  }, [year, quarter, isAdminOrManager]);

  const handleExport = async (format) => {
    try {
      const res = await reportsAPI.exportReport({ year, quarter, format });
      const blob = new Blob([res.data]);
      const url = globalThis.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `goals-report-${year}-${quarter}.${format === 'csv' ? 'csv' : 'xlsx'}`;
      a.click();
      globalThis.URL.revokeObjectURL(url);
      toast.success('Report downloaded');
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Planned vs actual progress — FY {year}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
            options={QUARTERS.map((q) => ({ value: q, label: q }))}
            className="w-auto"
          />
          <Button onClick={() => handleExport('xlsx')}>
            Export Excel
          </Button>
          <Button variant="secondary" onClick={() => handleExport('csv')}>
            Export CSV
          </Button>
        </div>
      </div>

      {isAdminOrManager && (
        <>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <h3 className="section-title mb-4">Progress by Department</h3>
                <div className="space-y-3">
                  {(analytics?.departmentChart || []).map((d) => (
                    <div key={d.department}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{d.department}</span>
                        <span className="font-medium">{d.avgProgress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-brand-500"
                          style={{ width: `${Math.min(d.avgProgress, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h3 className="section-title mb-4">Achievement Status Distribution</h3>
                <div className="space-y-2">
                  {analytics?.achievementStatus &&
                    Object.entries(analytics.achievementStatus).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="capitalize">{key.replaceAll('_', ' ')}</span>
                        <span className="font-semibold">{val}</span>
                      </div>
                    ))}
                </div>
              </Card>

              <Card className="lg:col-span-2">
                <h3 className="section-title mb-4">Planned vs Actual (Top 20)</h3>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Planned %</th>
                        <th>Actual %</th>
                        <th>Variance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(analytics?.plannedVsActual || []).map((row, i) => (
                        <tr key={row._id || i}>
                          <td>{row.name}</td>
                          <td>{row.planned}%</td>
                          <td className="font-medium text-brand-600">{row.actual}%</td>
                          <td className={row.actual - row.planned >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {Math.round((row.actual - row.planned) * 100) / 100}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </>
      )}

      {!isAdminOrManager && (
        <Card>
          <p className="text-slate-600">Use the export buttons above to download your personal goal report.</p>
        </Card>
      )}
    </div>
  );
}
