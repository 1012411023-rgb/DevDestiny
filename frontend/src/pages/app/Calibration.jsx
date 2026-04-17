import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTemplates } from '../../context/TemplateContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Loader } from '../../components/ui/Loader';
import { 
  Upload, 
  CheckCircle2, 
  Trash2, 
  Play, 
  Info, 
  ShieldCheck 
} from 'lucide-react';

export default function Calibration() {
  const navigate = useNavigate();
  const { templates, updateTemplateStatus } = useTemplates();
  const [images, setImages] = useState([]);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [isCalibrated, setIsCalibrated] = useState(false);

  const handleFileDrop = (e) => {
    e.preventDefault();
    const newFiles = Array.from(e.target.files || e.dataTransfer.files);
    setImages(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))]);
  };

  const handleCalibrate = () => {
    setIsCalibrating(true);
    // Mock calibration logic
    setTimeout(() => {
      setIsCalibrating(false);
      setIsCalibrated(true);
      // Update template state (assume we pick the first draft for demo)
      const draft = templates.find(t => t.status === 'draft');
      if (draft) updateTemplateStatus(draft.id, 'ready', images.length);
    }, 4000);
  };

  return (
    <div className="space-y-10 pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-10">
        <div>
          <h1 className="font-mono text-3xl font-bold text-white tracking-tight uppercase">Neural Calibration</h1>
          <p className="text-sm text-slate-500 mt-2 font-mono tracking-widest uppercase">
            Step 02 / <span className="text-brand-primary">Feature Extraction</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={isCalibrated ? 'success' : 'warning'} size="md">
            {isCalibrated ? 'Model Synchronized' : 'Pending Training Data'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Workspace: Image Repository */}
        <div className="lg:col-span-2 space-y-8">
           <Card padding={false} className="overflow-hidden border border-slate-700 bg-slate-900/30">
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className="p-16 border-2 border-dashed border-slate-700 hover:border-brand-primary/30 hover:bg-brand-primary/5 transition-all text-center group flex flex-col items-center cursor-pointer"
              >
                 <Upload size={48} className="text-slate-600 mb-6 group-hover:text-brand-primary transition-colors duration-300" />
                 <h3 className="font-mono text-lg font-bold text-white uppercase tracking-tight mb-2">Initialize Golden Reference Repository </h3>
                 <p className="text-xs text-slate-500 font-mono tracking-widest uppercase max-w-sm mb-8">Upload 10 &mdash; 20 faultless samples to establish baseline parameters.</p>
                 <input 
                    type="file" 
                    multiple 
                    className="hidden" 
                    id="file-upload" 
                    onChange={handleFileDrop}
                 />
                 <label htmlFor="file-upload">
                    <Button variant="secondary" className="uppercase tracking-widest font-bold">Query Hardware Storage</Button>
                 </label>
              </div>

              {images.length > 0 && (
                <div className="p-8 bg-slate-800/20">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
                     <h4 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest">Buffer Queue ({images.length} Units)</h4>
                     <button onClick={() => setImages([])} className="text-[10px] font-bold text-status-fail hover:text-white uppercase tracking-widest opacity-60 hover:opacity-100 transition-all font-mono">Purge Queue</button>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {images.map((img, idx) => (
                      <div key={idx} className="aspect-square relative group rounded border border-slate-700 overflow-hidden bg-slate-900">
                        <img src={img} alt="Ref" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-60 group-hover:opacity-100" />
                        <button 
                          onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 p-1 bg-status-fail rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
           </Card>
        </div>

        {/* Console: Control Panel */}
        <div className="space-y-8">
          <Card className="space-y-8 bg-slate-800 border-slate-600 shadow-2xl">
             <div className="space-y-3">
                <h3 className="font-mono text-sm font-bold text-white uppercase tracking-widest border-b border-slate-700 pb-3">Training Protocol</h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-500 uppercase tracking-tight">Status</span>
                      <span className={`font-bold ${isCalibrating ? 'text-brand-primary' : isCalibrated ? 'text-status-pass' : 'text-status-anomaly'}`}>
                        {isCalibrating ? 'PROCESSING...' : isCalibrated ? 'SYNCHRONIZED' : 'IDLE'}
                      </span>
                   </div>
                   <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-500 uppercase tracking-tight">Data Points</span>
                      <span className="text-slate-100 font-bold tracking-widest">{images.length} Samples</span>
                   </div>
                   <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-500 uppercase tracking-tight">Latency Check</span>
                      <span className="text-slate-400 font-bold italic tracking-tighter">&lt; 15ms</span>
                   </div>
                </div>
             </div>

             {isCalibrating && (
                <Loader message="Synchronizing Neural Weights..." />
             )}

             <div className="pt-4 space-y-4">
                <Button 
                   variant="primary" 
                   fullWidth={true} 
                   loading={isCalibrating} 
                   disabled={images.length < 10 || isCalibrated}
                   onClick={handleCalibrate}
                   className="uppercase tracking-widest font-black py-6 shadow-xl shadow-blue-900/30"
                >
                   <Play size={18} className="mr-2" />
                   Initiate Engine Train
                </Button>
                
                {isCalibrated && (
                   <Button 
                      variant="secondary" 
                      fullWidth={true} 
                      onClick={() => navigate('/inspection')}
                      className="uppercase tracking-widest font-bold border-status-pass text-status-pass bg-status-pass/5 hover:bg-status-pass hover:text-white"
                   >
                      <ShieldCheck size={18} className="mr-2" />
                      Commit Model & Run Test
                   </Button>
                )}
             </div>

             <div className="p-4 bg-slate-900/50 border border-slate-700 rounded flex gap-3 mt-4">
                <Info size={16} className="text-brand-primary shrink-0" />
                <p className="text-[10px] text-slate-500 font-mono leading-relaxed uppercase tracking-tight font-400">Model accuracy peaks between 15 &mdash; 20 samples. Ensure all reference images represent valid factory-standard units.</p>
             </div>
          </Card>

          <Card className="bg-slate-900 border-slate-800 p-6">
             <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Neural Guideline</h4>
             <ul className="space-y-4">
                {[
                  'Maintain uniform shadowless lighting.',
                  'Align product against a hardware jig.',
                  'Expose 100% of the relevant surface.',
                  'Target resolution minimum: 720p.'
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                     <span className="font-mono text-[10px] text-brand-primary font-bold">0{i+1}</span>
                     <span className="text-[11px] text-slate-400 font-mono uppercase tracking-tight">{tip}</span>
                  </li>
                ))}
             </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
