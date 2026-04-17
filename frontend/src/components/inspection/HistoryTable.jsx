import SeverityBadge from './SeverityBadge';

export default function HistoryTable({ inspections, onView }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-y border-teal-100 bg-teal-50/40 text-[10px] font-bold text-teal-800 uppercase tracking-widest">
            <th className="px-6 py-4">Ref ID</th>
            <th className="px-6 py-4">Product Template</th>
            <th className="px-6 py-4">Date / Time</th>
            <th className="px-6 py-4 text-center">Status</th>
            <th className="px-6 py-4">Score</th>
            <th className="px-6 py-4">Severity</th>
            <th className="px-6 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-teal-50">
          {inspections.map((row) => (
            <tr key={row.id} className="hover:bg-teal-50/20 transition-colors group">
              <td className="px-6 py-4 text-xs font-bold text-slate-400 group-hover:text-slate-900 transition-colors uppercase font-serif">{row.id}</td>
              <td className="px-6 py-4">
                <div className="text-sm font-bold text-slate-900">{row.templateName}</div>
                <div className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">{row.category}</div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600 font-medium whitespace-nowrap">
                {new Date(row.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </td>
              <td className="px-6 py-4 text-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${row.status === 'pass' ? 'bg-teal-100 text-teal-800' : 'bg-red-100 text-red-800'}`}>
                  {row.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm font-bold text-slate-900">{Number(row.anomalyScore).toFixed(2) + "%"}</td>
              <td className="px-6 py-4">
                <SeverityBadge level={row.severity} />
              </td>
              <td className="px-6 py-4 text-right">
                <button 
                  onClick={() => onView && onView(row)}
                  className="px-4 py-2 text-xs font-bold text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-900 hover:text-white transition-all shadow-sm active:scale-95"
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
          {inspections.length === 0 && (
            <tr>
              <td colSpan="7" className="px-6 py-12 text-center text-sm text-slate-400 italic">
                No inspection logs available in the current database view.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

