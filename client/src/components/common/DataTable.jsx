import EmptyState from './EmptyState';

/**
 * Reusable data table with empty state
 */
export default function DataTable({ columns, rows, emptyTitle = 'No records', emptyMessage }) {
  if (!rows?.length) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-slate-500">
            {columns.map((col) => (
              <th key={col.key} className="pb-3 pr-4 whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id || i} className="border-b border-slate-50 hover:bg-slate-50/50">
              {columns.map((col) => (
                <td key={col.key} className="py-3 pr-4">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
