import SeverityBadge from './SeverityBadge';

export default function ResultSummaryCard({ result }) {
  if (!result) return null;

  const isPass = result.status === 'pass';

  return (
    <div className="rounded-2xl border border-teal-100 bg-white p-8 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
      <div className={`absolute top-0 inset-x-0 h-1.5 ${isPass ? 'bg-teal-500' : 'bg-red-500'}`}></div>
      
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isPass ? 'bg-teal-50 text-teal-600' : 'bg-red-50 text-red-600'}`}>
        {isPass ? (
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        ) : (
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        )}
      </div>

      <h3 className={`text-3xl font-black mb-1 tracking-tight ${isPass ? 'text-teal-900' : 'text-red-900'}`}>{isPass ? 'PASS' : 'FAIL'}</h3>
      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-8">Report ID: {result.id}</p>

      <div className="w-full grid grid-cols-2 gap-4 text-left border-t border-teal-50 pt-6">
        <div>
          <span className="block text-[10px] text-teal-600 font-bold uppercase tracking-widest mb-1">Anomaly Score</span>
          <span className="block text-xl font-bold text-slate-900">{Number(result.anomalyScore).toFixed(2)}% <span className="text-sm text-slate-400 font-medium ml-1">/ 100%</span></span>
        </div>
        <div>
          <span className="block text-[10px] text-teal-600 font-bold uppercase tracking-widest mb-1">Risk Severity</span>
          <div className="mt-1">
            <SeverityBadge level={result.severity} />
          </div>
        </div>
      </div>
    </div>
  );
}

