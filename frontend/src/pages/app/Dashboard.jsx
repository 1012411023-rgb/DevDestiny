import { useTemplates } from '../../context/TemplateContext';
import { useInspection } from '../../context/InspectionContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Box, 
  TrendingUp, 
  History 
} from 'lucide-react';

const StatCard = ({ title, value, subtext, icon: Icon, trend }) => (
  <Card padding={true} hover={true} className="bg-white border-gray-200">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-xs text-gray-400 mt-1">{subtext}</p>
      </div>
      <div className="p-2 rounded bg-gray-50 text-gray-500 border border-gray-100">
        <Icon size={18} />
      </div>
    </div>
    {trend && (
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
        <TrendingUp size={12} className="text-green-600" />
        <span className="text-xs text-green-600 font-medium">+{trend}% improved</span>
      </div>
    )}
  </Card>
);


export default function Dashboard() {
  const { templates } = useTemplates();
  const { history } = useInspection();

  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    fetch(`http://${window.location.hostname}:5005/api/stats/passfail`)
      .then(res => res.json())
      .then(data => {
        setPieData([
          { name: 'Pass', value: data.passed, color: '#10b981' },
          { name: 'Fail', value: data.failed, color: '#ef4444' }
        ]);
      })
      .catch(err => console.error(err));
  }, []);


  const activeTemplates = templates.filter(t => t.status === 'ready').length;
  const passRate = history.length > 0 
    ? Math.round((history.filter(h => h.status === 'pass').length / history.length) * 100)
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-2">Overview of products, models, and recent inspections</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded border border-gray-200 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm font-medium text-gray-700">System Online</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Inspections" 
          value={history.length} 
          subtext="Last 24 Hours" 
          icon={Search} 
        />
        <StatCard 
          title="Avg Pass Rate" 
          value={history.length === 0 ? "—" : `${passRate}%`} 
          subtext="Historical Metrics" 
          icon={CheckCircle2} 
          trend={history.length === 0 ? null : 2.4}
        />
        <StatCard 
          title="Active Templates" 
          value={activeTemplates} 
          subtext={`${templates.length} Total in Library`} 
          icon={Box} 
        />
        <StatCard 
          title="Anomalies Tracked" 
          value={history.filter(h => h.status === 'fail').length} 
          subtext="Requires Immediate Review" 
          icon={AlertTriangle} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Inspections Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <History size={18} className="text-blue-600" />
              Recent Inspections
            </h2>
          </div>
          
          <Card padding={false} className="overflow-hidden bg-white border border-gray-200">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.slice(0, 5).map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-gray-500">{row.id.split('-')[1]}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{row.templateName}</div>
                      <div className="text-xs text-gray-400">{row.category}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={row.status === 'pass' ? 'success' : 'danger'} size="sm">
                        {row.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                      {Number(row.anomalyScore).toFixed(2) + "%"}
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">No inspections yet. Run your first inspection to see results.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>

        
        {/* Quick Actions / Integration Info */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-900">Inspection Overview</h2>
          <Card className="border border-gray-200 p-6 bg-white">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">Pass / Fail Trend</h4>
            <div className="h-64 w-full">
              {pieData.length > 0 && (pieData[0].value + pieData[1].value) > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : pieData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400">Loading...</div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-center px-4">No inspection data yet to display chart.</div>
              )}
            </div>
          </Card>
          
          <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>

          <Card className="bg-blue-50 border-blue-100 p-8 flex flex-col items-center text-center">
             <div className="w-16 h-16 rounded bg-white flex items-center justify-center text-blue-600 mb-6 shadow-sm border border-blue-50">
                <Box size={32} />
             </div>
             <h3 className="text-lg font-bold text-gray-900 mb-2">Add New Product</h3>
             <p className="text-sm text-gray-500 mb-8">Upload images and train a custom model for a new product.</p>
             <button 
               className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md transition-all shadow-md flex items-center justify-center gap-2"
               onClick={() => window.location.href = '/add-product'}  
             >
                Start Setup
             </button>
          </Card>

          <Card className="border border-gray-200 p-6 bg-white">
             <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">System Status</h4>
             <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                   <span className="text-gray-600">Camera Feed</span>
                   <span className="text-green-600 font-medium">Ready</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                   <span className="text-gray-600">Backend Server</span>
                   <span className="text-green-600 font-medium">Online</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                   <span className="text-gray-600">Storage</span>
                   <span className="text-gray-900 font-medium">12 GB used</span>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
