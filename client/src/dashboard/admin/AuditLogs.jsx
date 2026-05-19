import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Card } from '../../components/ui';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI
      .getAuditLogs({ limit: 100 })
      .then((res) => setLogs(res.data.logs || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Audit Logs</h1>
        <p className="page-subtitle">All changes tracked after goal lock</p>
      </div>

      <Card padding="sm" className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Field</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No audit logs yet. Logs are created when locked goals are modified.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id}>
                  <td className="whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td>
                    {log.changedBy?.name}
                    <br />
                    <span className="text-xs text-slate-400">{log.changedBy?.role}</span>
                  </td>
                  <td className="capitalize">{log.action?.replaceAll('_', ' ')}</td>
                  <td className="text-slate-500">{log.field || '—'}</td>
                  <td>{log.description}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
