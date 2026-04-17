import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInspection } from '../../context/InspectionContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
   CheckCircle2,
   AlertCircle,
   Download,
   Map,
   RefreshCw,
   FileText
} from 'lucide-react';
import { api } from '../../services/api';

export default function Results() {
   const navigate = useNavigate();
   const { currentResult, updateInspection } = useInspection();
   const [stats, setStats] = useState({ total_scanned: 0, total_approved: 0, total_defective: 0 });
   const [isOverriding, setIsOverriding] = useState(false);
   const [isDownloading, setIsDownloading] = useState(false);

   useEffect(() => {
      if (currentResult && currentResult.templateId) {
         api.getStats(currentResult.templateId).then(data => {
            setStats(data);
         }).catch(err => {
            console.error('Failed to load stats:', err);
         });
      }
   }, [currentResult]);

   const handleOverride = async () => {
      if (!currentResult || !currentResult.id) return;
      setIsOverriding(true);
      try {
         const data = await api.overrideStatus(currentResult.id);
         if (data.status === 'success') {
            updateInspection({
               ...currentResult,
               status: 'pass',
               severity: 'Low',
               likelyIssue: 'Consistent Surface (Manual Override)'
            });
            const newStats = await api.getStats(currentResult.templateId);
            setStats(newStats);
         }
      } catch (err) {
         console.error('Failed to override status:', err);
         alert('Failed to override: ' + err.message);
      } finally {
         setIsOverriding(false);
      }
   };

   const handleDownloadReport = async () => {
      if (!currentResult || !currentResult.id) return;
      setIsDownloading(true);
      try {
         await api.downloadReport(currentResult.id);
      } catch (err) {
         console.error('Failed to download report:', err);
         alert('Failed to download report: ' + err.message);
      } finally {
         setIsDownloading(false);
      }
   };

   if (!currentResult) {
      return (
         <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400">
               <FileText size={32} />
            </div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">No scan results to display. Run an inspection first.</p>
            <Button variant="primary" onClick={() => navigate('/inspection')}>Inspect a Product</Button>
         </div>
      );
   }

   const isPass = currentResult.status === 'pass';

   return (
      <div className="space-y-10 pb-12 animate-in fade-in duration-500">
         {/* Result Header */}
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-10">
            <div>
               <Badge variant={isPass ? 'success' : 'danger'} size="sm" className="mb-4">
                  Scan ID: {currentResult.id}
               </Badge>
               <h1 className="text-3xl font-bold text-gray-900">Scan Results</h1>
               <p className="text-sm text-gray-500 mt-2">
                  Product: <span className="font-semibold text-gray-800">{currentResult.templateName}</span> &mdash; {currentResult.category}
               </p>
            </div>
            <div className="flex gap-3">
               <Button 
                  variant="secondary" 
                  className="font-semibold bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={handleDownloadReport}
                  loading={isDownloading}
               >
                  <Download size={16} className="mr-2" />
                  Download Full Report (PDF)
               </Button>
               <Button variant="primary" onClick={() => navigate('/inspection')} className="font-semibold bg-blue-600 hover:bg-blue-700 text-white px-8">
                  <RefreshCw size={16} className="mr-2" />
                  Scan Another
               </Button>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Heatmap Area */}
            <div className="lg:col-span-8 space-y-6">
               <Card padding={false} className="border border-gray-200 bg-gray-50 overflow-hidden relative shadow-sm">
                  <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
                     <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <Map size={16} className="text-blue-600" />
                        Pixel Heatmap Overlay
                     </h3>
                  </div>

                  <div className="aspect-video relative group bg-gray-100">
                     {currentResult.serverRef ? (
                        <img
                           src={currentResult.serverRef.startsWith('data:image') || currentResult.serverRef.startsWith('http') ? currentResult.serverRef : `http://localhost:5005/uploads/${currentResult.serverRef}`}
                           alt="Sample Analysis"
                           className="w-full h-full object-contain p-4 transition-transform duration-700"
                        />
                     ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                           <p className="text-sm text-gray-400">Loading Image...</p>
                        </div>
                     )}

                     {/* Simulated Anomaly Heatmap (SVG circles) */}
                     {!isPass && (
                        <div className="absolute inset-0 opacity-60 pointer-events-none">
                           <div className="absolute top-[30%] left-[45%] w-32 h-32 bg-red-500/40 rounded-full blur-2xl animate-pulse" />
                           <div className="absolute top-[35%] left-[50%] w-16 h-16 bg-red-600/60 rounded-full blur-xl" />
                           <div className="absolute top-[28%] left-[42%] w-24 h-24 bg-red-500/30 rounded-full blur-3xl animate-pulse duration-3000" />
                        </div>
                     )}

                     {/* Grid Overlay */}
                     <div className="absolute inset-0 pointer-events-none opacity-10 border-[20px] border-transparent"
                        style={{ backgroundImage: 'linear-gradient(#2563eb 1px, transparent 1px), linear-gradient(90deg, #2563eb 1px, transparent 1px)', backgroundSize: '10% 10%' }} />

                     {/* Tracking labels */}
                     {!isPass && (
                        <div className="absolute top-[32%] left-[52%] p-2 bg-white/90 border border-red-500 text-gray-900 rounded text-xs font-semibold shadow-md inline-flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-red-500" /> Defect Detected
                        </div>
                     )}
                  </div>
               </Card>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-white border-gray-200">
                     <h4 className="text-sm font-bold text-gray-900 mb-6 border-b border-gray-100 pb-3">Defect Problem Report</h4>
                     <div className="space-y-6">
                        <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 rounded flex items-center justify-center ${isPass ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} border ${isPass ? 'border-green-200' : 'border-red-200'}`}>
                              {isPass ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                           </div>
                           {!isPass && (
                              <Button
                                 variant="secondary"
                                 size="sm"
                                 className="ml-auto text-[10px] py-1 border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100"
                                 onClick={handleOverride}
                                 loading={isOverriding}
                              >
                                 Force Pass (Manual Override)
                              </Button>
                           )}
                           <div>
                              <p className={`text-xl font-bold tracking-tight ${isPass ? 'text-green-600' : 'text-red-600'}`}>
                                 {isPass ? 'PASS' : 'FAIL'}
                              </p>
                           </div>
                        </div>

                        <div className="space-y-2">
                           <div className="flex justify-between text-sm font-medium">
                              <span className="text-gray-500">Anomaly Score</span>
                              <span className={isPass ? 'text-green-600' : 'text-red-600'}>{Number(currentResult.anomalyScore).toFixed(2) + "%"}</span>
                           </div>
                           <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                 className={`h-full transition-all duration-1000 ${isPass ? 'bg-green-500' : 'bg-red-500'}`}
                                 style={{ width: Number(currentResult.anomalyScore).toFixed(2) + "%" }}
                              />
                           </div>
                        </div>
                     </div>
                  </Card>

                  <Card className="bg-white border-gray-200">
                     <h4 className="text-sm font-bold text-gray-900 mb-6 border-b border-gray-100 pb-3">Scan Summary</h4>
                     <div className="space-y-4 text-sm">
                        <div className="flex justify-between border-b border-gray-50 pb-2">
                           <span className="text-gray-500">Total Scanned Today</span>
                           <span className="text-gray-900 font-bold">{stats.total_scanned}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-2">
                           <span className="text-gray-500">Total Approved</span>
                           <span className="text-green-600 font-bold">{stats.total_approved}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-2">
                           <span className="text-gray-500">Total Defective</span>
                           <span className="text-red-600 font-bold">{stats.total_defective}</span>
                        </div>
                     </div>
                  </Card>
               </div>

               <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                  {!isPass && (
                     <Button
                        variant="secondary"
                        onClick={handleOverride}
                        className="font-semibold bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                        loading={isOverriding}
                     >
                        Mark as Pass instead of Fail
                     </Button>
                  )}
                  <Button variant="secondary" onClick={() => navigate('/')} className="px-10 font-semibold bg-white border-gray-300 text-gray-700 hover:bg-gray-50">Back to Dashboard</Button>
                  <Button variant="primary" onClick={() => navigate('/inspection')} className="px-10 font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md">Run New Inspection</Button>
               </div>
            </div>
         </div>
      </div>
   );
}
