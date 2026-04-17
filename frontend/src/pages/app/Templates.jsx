import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTemplates } from '../../context/TemplateContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar, 
  FileText 
} from 'lucide-react';

export default function Templates() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  
  const { templates } = useTemplates();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState(initialCategory);

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterCategory === '' || t.category === filterCategory)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-10">
        <div>
          <h1 className="font-mono text-3xl font-bold text-white tracking-tight uppercase">Product Library</h1>
          <p className="text-sm text-slate-500 mt-2 font-mono tracking-widest uppercase">
            Active Configurations: <span className="text-brand-primary">{templates.length} Units</span>
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => navigate('/create-template')}
          className="uppercase tracking-widest font-bold"
        >
          <Plus size={18} className="mr-2" />
          Initialize New Template
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Filter by product name or serial number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-md pl-10 pr-4 py-2.5 text-sm text-white focus:border-brand-primary outline-none font-mono"
          />
        </div>
        <select 
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-md px-4 py-2.5 text-sm text-white focus:border-brand-primary outline-none font-mono uppercase tracking-widest"
        >
          <option value="">All Domains</option>
          <option value="Textile">Textile</option>
          <option value="Ceramic">Ceramic</option>
          <option value="Metal">Metal</option>
        </select>
        <Button variant="secondary" size="md">
          <Filter size={16} className="mr-2" />
          Advanced
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} padding={false} hover={true} className="flex flex-col group border-slate-700/50">
            <div className="p-6 border-b border-slate-700 flex justify-between items-start">
              <div className="w-10 h-10 rounded bg-slate-700/50 flex items-center justify-center text-slate-400 group-hover:text-brand-primary transition-colors">
                <FileText size={20} />
              </div>
              <button className="text-slate-500 hover:text-white transition-colors">
                <MoreVertical size={16} />
              </button>
            </div>
            
            <div className="p-6 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="neutral" size="sm" className="bg-slate-900">{template.category}</Badge>
                <Badge variant={template.status === 'ready' ? 'success' : 'warning'} size="sm">
                  {template.status}
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-white mb-4 group-hover:text-brand-primary transition-colors uppercase tracking-tight">{template.name}</h3>
              
              <div className="space-y-3 mt-6">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 uppercase tracking-widest">Calibration Set</span>
                  <span className="text-slate-300 font-bold">{template.referenceImageCount} / 20 Images</span>
                </div>
                <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-primary transition-all duration-500" 
                    style={{ width: `${(template.referenceImageCount / 20) * 100}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono uppercase mt-4">
                  <Calendar size={12} />
                  Last Modified: {new Date(template.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-900/30 border-t border-slate-700 flex gap-2">
              <Button 
                variant={template.status === 'ready' ? 'primary' : 'secondary'} 
                size="sm" 
                fullWidth={true}
                className="uppercase tracking-widest text-[10px]"
                onClick={() => navigate(template.status === 'ready' ? '/inspection' : '/calibration')}
              >
                {template.status === 'ready' ? 'Run Inspection' : 'Calibrate Engine'}
              </Button>
            </div>
          </Card>
        ))}

        {/* Empty State / Add New */}
        <button 
          onClick={() => navigate('/create-template')}
          className="border-2 border-dashed border-slate-700 rounded-lg p-8 flex flex-col items-center justify-center text-slate-500 hover:border-brand-primary/50 hover:text-brand-primary transition-all group min-h-[300px]"
        >
          <div className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center mb-4 group-hover:border-brand-primary/30 group-hover:bg-brand-primary/5 transition-all">
            <Plus size={24} />
          </div>
          <span className="font-mono text-xs uppercase tracking-[0.2em] font-bold">Register New Material</span>
        </button>
      </div>
    </div>
  );
}
