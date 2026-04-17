import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTemplates } from '../../context/TemplateContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
  ArrowLeft, 
  Save, 
  Settings2, 
  AlertCircle 
} from 'lucide-react';

export default function CreateTemplate() {
  const navigate = useNavigate();
  const { addTemplate } = useTemplates();
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Textile',
    description: '',
    tolerance: 'Medium (Standard)',
    priority: 'Normal'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addTemplate(formData);
    navigate('/templates');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 text-slate-500 hover:text-white transition-colors border border-slate-700 rounded hover:bg-slate-800"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-mono text-2xl font-bold text-white uppercase tracking-tight">Template Initialization</h1>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-1">Configuring <span className="text-brand-primary">Neural Signature</span></p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Input 
              label="Product Reference Name" 
              placeholder="e.g., Heavy Denim Type-04" 
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              helperText="Unique identifier for internal audit logs"
            />
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-500 text-slate-400 uppercase tracking-widest px-1">
                Manufacturing Domain
              </label>
              <select 
                className="bg-slate-700 border border-slate-600 rounded-md px-4 py-3 text-sm text-white focus:border-brand-primary outline-none font-mono"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Textile">Textile / Fabric</option>
                <option value="Ceramic">Ceramic Tile</option>
                <option value="Metal">Metal Surface</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-500 text-slate-400 uppercase tracking-widest px-1">
              Operational Context / Description
            </label>
            <textarea 
              className="bg-slate-700 border border-slate-600 rounded-md px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-brand-primary h-32 transition-all"
              placeholder="Specify weave patterns, glaze types, or surface treatment specifications..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-500 text-slate-400 uppercase tracking-widest px-1">
                Detection Sensitivity
              </label>
              <select 
                className="bg-slate-700 border border-slate-600 rounded-md px-4 py-3 text-sm text-white focus:border-brand-primary outline-none font-mono"
                value={formData.tolerance}
                onChange={(e) => setFormData({ ...formData, tolerance: e.target.value })}
              >
                <option value="High (Strict)">High (Strict) — Minor Deviations Flagged</option>
                <option value="Medium (Standard)">Medium (Standard) — Default</option>
                <option value="Low (Permissive)">Low (Permissive) — Critical Only</option>
              </select>
            </div>
            
            <div className="p-4 bg-slate-900/50 border border-slate-700 rounded flex gap-3">
               <AlertCircle size={16} className="text-slate-500 shrink-0" />
               <p className="text-[10px] text-slate-500 font-mono leading-relaxed uppercase">Neural tolerance can be adjusted post-calibration. Highly reflective surfaces (Metal) typically require Standard sensitivity.</p>
            </div>
          </div>
        </Card>

        {/* Technical Specs Card */}
        <Card className="bg-slate-900 border-dashed border-slate-700">
           <div className="flex items-center gap-3 mb-6">
              <Settings2 size={18} className="text-brand-primary" />
              <h3 className="font-mono text-sm font-bold text-white uppercase tracking-widest">Protocol Metadata</h3>
           </div>
           
           <div className="space-y-4">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-tight">
                 <span className="text-slate-500">Few-Shot Engine Version</span>
                 <span className="text-slate-300 italic">v4.2.0-stable</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-tight">
                 <span className="text-slate-500">Hardware Acceleration</span>
                 <span className="text-status-pass font-bold">Enabled (NVIDIA Tesla)</span>
              </div>
           </div>
        </Card>

        <div className="flex items-center justify-end gap-4 pt-4">
          <Button 
            variant="secondary" 
            type="button" 
            onClick={() => navigate(-1)}
            className="uppercase font-bold tracking-widest"
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            className="uppercase font-bold tracking-widest px-8"
          >
            <Save size={18} className="mr-2" />
            Commit Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
