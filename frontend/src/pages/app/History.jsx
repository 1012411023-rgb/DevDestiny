import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  ChevronRight, 
  Trash2 
} from 'lucide-react';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { history, setCurrentResult } = useInspection();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredHistory = history.filter(item => 
    (item.id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     item.templateName?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === 'all' || item.status === filterStatus)
  );

  const handleViewDetails = (item) => {
    setCurrentResult(item);
    navigate('/results');
  };

  return (
    <div className="space-y-10 pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-10">
        <div>
          <h1 className="font-mono text-3xl font-bold text-white tracking-tight uppercase">Audit Logs</h1>
          <p className="text-sm text-slate-500 mt-2 font-mono tracking-widest uppercase">
            Total Operational Records: <span className="text-white">{history.length}</span>
          </p>
        </div>
        <Button variant="secondary" className="uppercase font-bold tracking-widest text-[11px]">
          <Download size={14} className="mr-2" />
          Export Historical Data (.CSV)
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by Diagnostic ID or Template..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-md pl-10 pr-4 py-2.5 text-sm text-white focus:border-brand-primary outline-none font-mono"
          />
        </div>
        <div className="flex gap-4">
           <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-md px-4 py-2.5 text-sm text-white focus:border-brand-primary outline-none font-mono uppercase tracking-widest"
           >
              <option value="all">Status: All</option>
              <option value="pass">Status: Pass Only</option>
              <option value="fail">Status: Fail Only</option>
           </select>
           <Button variant="secondary">
              <Filter size={16} className="mr-2" />
              Advanced Filters
           </Button>
        </div>
      </div>

      {/* Audit Table */}
      <Card padding={false} className="overflow-hidden border border-slate-700 bg-slate-900/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800 border-b border-slate-700 font-mono">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">ID / Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inference Target</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Score</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Laboratory Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4">
                       <div className="font-mono text-xs text-white font-bold tracking-widest">{row.id}</div>
                       <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono mt-1 uppercase">
                          <Calendar size={10} />
                          {new Date(row.timestamp).toLocaleDateString()} &mdash; {new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="text-sm font-bold text-white uppercase tracking-tight">{row.templateName}</div>
                       <div className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.1em]">{row.category}</div>
                    </td>
                    <td className="px-6 py-4">
                       <Badge variant={row.status === 'pass' ? 'success' : 'danger'} size="sm" className="px-3">
                          {row.status}
                       </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <div className="font-mono text-sm font-bold text-slate-300">{Number(row.anomalyScore).toFixed(2) + "%"}</div>
                       <div className={`text-[8px] font-bold uppercase tracking-widest ${row.severity === 'High' ? 'text-status-fail' : 'text-slate-500'}`}>{row.severity} RISK</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewDetails(row)}
                            className="bg-slate-800 hover:bg-brand-primary/20 text-slate-400 hover:text-white uppercase tracking-widest text-[9px] border border-slate-700"
                          >
                             Review Audit
                             <ChevronRight size={12} className="ml-1" />
                          </Button>
                          <button className="p-2 text-slate-700 hover:text-status-fail transition-colors">
                             <Trash2 size={14} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-slate-500 font-mono text-xs uppercase tracking-widest">
                     No diagnostics matched current query criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination Mockup */}
      <div className="flex items-center justify-center gap-4 py-8">
         <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Record Navigation:</span>
         <div className="flex gap-1">
            {[1, 2, 3, 4].map(i => (
              <button key={i} className={`w-8 h-8 rounded border ${i === 1 ? 'border-brand-primary bg-brand-primary/10 text-white' : 'border-slate-700 text-slate-500'} font-mono text-xs hover:border-brand-primary transition-all`}>
                {i}
              </button>
            ))}
         </div>
      </div>
    </div>
  );
}
