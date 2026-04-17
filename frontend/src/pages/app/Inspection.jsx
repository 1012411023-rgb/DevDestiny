import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTemplates } from '../../context/TemplateContext';
import { useInspection } from '../../context/InspectionContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Loader } from '../../components/ui/Loader';
import { Camera, Monitor, Upload, Cpu, Zap, ArrowRight, Info } from 'lucide-react';
import NeuralViewport from '../../components/app/NeuralViewport';
import { api } from '../../services/api';

export default function Inspection() {
   const navigate = useNavigate();
   const { templates } = useTemplates();
   const { runNewInspection, setCurrentResult, addInspection } = useInspection();

   const [products, setProducts] = useState([]);
   const [selectedProductId, setSelectedProductId] = useState('');
   const [image, setImage] = useState(null);
   const [isInspecting, setIsInspecting] = useState(false);
   const [isWebcamActive, setIsWebcamActive] = useState(false);
   const [error, setError] = useState(null);
   const [isLoadingProducts, setIsLoadingProducts] = useState(true);

   useEffect(() => {
      async function loadProducts() {
         try {
            const data = await api.getProducts();
            const productList = data.products || [];
            setProducts(productList);
            if (productList.length > 0) {
               setSelectedProductId(productList[0]);
            }
         } catch (err) {
            console.error(err);
         } finally {
            setIsLoadingProducts(false);
         }
      }
      loadProducts();
   }, []);

   const handleFileDrop = (e) => {
      e.preventDefault();
      const file = e.target.files?.[0] || e.dataTransfer.files?.[0];
      if (file) {
         setError(null);
         setImage(file);
      }
   };

   const handleRunInspection = async () => {
      if (!image || !selectedProductId) return;

      setIsInspecting(true);
      setError(null);

      try {
         // 1. Send the image to real AI Inference (ResNet + PaDiM)
         const inference = await api.inspect(selectedProductId, image);

         const pass = inference.pass;

         addInspection({
            id: inference.id,
            templateId: selectedProductId,
            templateName: selectedProductId,
            category: 'Unknown Category',
            status: pass ? 'pass' : 'fail',
            anomalyScore: inference.anomaly_score.toFixed(1),
            severity: pass ? 'Low' : 'High',
            likelyIssue: pass ? "No defect found." : "Surface Discontinuity / Material Anomaly",
            // Convert heatmap to a data URI for native rendering in frontend Result view
            serverRef: `data:image/png;base64,${inference.heatmap_base64}`
         });

         navigate('/results');
      } catch (err) {
         setError('Neural Link Severed: ' + (err.message || 'Failed to analyze sample.'));
      } finally {
         setIsInspecting(false);
      }
   };

   return (
      <div className="space-y-10 pb-12 animate-in fade-in duration-500">
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-10">
            <div>
               <h1 className="text-3xl font-bold text-gray-900">Inspect Product</h1>
               <p className="text-sm text-gray-500 mt-2">Upload an image to test against a registered product model.</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-green-600">
               <Zap size={14} className="fill-green-600" />
               System Ready
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
               <Card className="bg-white border-gray-200">
                  <div className="flex flex-col md:flex-row gap-8">
                     <div className="flex-1 space-y-6">
                        <div className="flex flex-col gap-1.5">
                           <label className="text-sm font-medium text-gray-700">Select Product Model</label>
                           <select
                              className="w-full bg-white border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-900 focus:border-blue-500 outline-none"
                              value={selectedProductId}
                              onChange={(e) => setSelectedProductId(e.target.value)}
                              disabled={isLoadingProducts || products.length === 0}
                           >
                              {isLoadingProducts && <option value="">Loading products...</option>}
                              {!isLoadingProducts && products.map(p => (
                                 <option key={p} value={p}>{p}</option>
                              ))}
                              {!isLoadingProducts && products.length === 0 && <option value="">No calibrated products found</option>}
                           </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div
                              onClick={() => setIsWebcamActive(true)}
                              className="p-4 bg-gray-50 border border-gray-200 rounded-md flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-100 transition-all border-dashed"
                           >
                              <Camera size={24} className="text-gray-500" />
                              <span className="text-xs font-medium text-gray-600">Use Webcam</span>
                           </div>
                           <div
                              onClick={() => setIsWebcamActive(true)}
                              className="p-4 bg-gray-50 border border-gray-200 rounded-md flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-100 transition-all border-dashed"
                           >
                              <Monitor size={24} className="text-gray-500" />
                              <span className="text-xs font-medium text-gray-600">Stream Feed</span>
                           </div>
                        </div>
                     </div>
                     <div className="hidden md:block w-px bg-gray-200" />
                     <div className="w-full md:w-1/3 flex flex-col justify-center gap-4">
                        <div className="flex items-center justify-between text-sm">
                           <span className="text-gray-500">Inference Engine</span>
                           <span className="text-blue-600 font-medium">Visual Intelligence Core v1.0</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                           <span className="text-gray-500">Analysis Mode</span>
                           <span className="text-orange-500 font-medium">Adaptive Feature Mapping</span>
                        </div>
                     </div>
                  </div>
               </Card>

               {error && <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-md">{error}</div>}

               {isWebcamActive ? (
                  <NeuralViewport
                     onClose={() => setIsWebcamActive(false)}
                     isInspecting={isInspecting}
                     onCapture={async (file, onResult) => {
                        setIsInspecting(true);
                        try {
                           const result = await runNewInspection(file, selectedProductId);
                           onResult(result);
                        } catch (err) {
                           console.error("Frame evaluation failed:", err);
                        } finally {
                           setIsInspecting(false);
                        }
                     }}
                     onLiveFrame={async (file, onResult) => {
                        try {
                           const result = await api.inspect(selectedProductId, file, true);
                           onResult(result);
                        } catch (err) {
                           console.error("Live frame evaluation failed:", err);
                        }
                     }}
                  />
               ) : !image ? (
                  <Card padding={false} className="overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50">
                     <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleFileDrop}
                        onClick={() => document.getElementById('sample-upload').click()}
                        className="p-20 text-center flex flex-col items-center group cursor-pointer"
                     >
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all border border-gray-200 group-hover:border-blue-200 mb-6 shadow-sm">
                           <Upload size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Upload Test Product</h3>
                        <p className="text-sm text-gray-500 mb-8">Drop image to test the model</p>
                        <input type="file" id="sample-upload" className="hidden" onChange={handleFileDrop} />
                        <Button type="button" variant="secondary" className="px-10 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50" onClick={(e) => { e.stopPropagation(); document.getElementById('sample-upload').click(); }}>Select Image</Button>
                     </div>
                  </Card>
               ) : (
                  <div className="space-y-6">
                     <div className="aspect-video w-full rounded-lg border border-gray-200 bg-gray-50 overflow-hidden relative group shadow-sm">
                        <img src={URL.createObjectURL(image)} alt="Preview" className="w-full h-full object-contain p-4 transition-transform duration-700" />
                     </div>

                     <Button variant="primary" fullWidth={true} className="py-4 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md" loading={isInspecting} onClick={handleRunInspection}>
                        <Cpu size={20} className="mr-3" />
                        {isInspecting ? "Processing Inference Matrix..." : "Inspect Model & Generate Hitmap"}
                     </Button>
                  </div>
               )}
            </div>

            <div className="lg:col-span-4 space-y-6">
               <Card className="bg-white border-gray-200">
                  <h4 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
                     <Info size={18} className="text-blue-600" />
                     System Intake Layer
                  </h4>
                  <div className="space-y-6">
                     <div>
                        <div className="flex justify-between mb-2">
                           <span className="text-sm text-gray-500">Pipeline Stage</span>
                           <span className="text-sm text-blue-900 font-medium">Feature Alignment Phase</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                           <div className="w-[100%] h-full bg-blue-500" />
                        </div>
                     </div>
                     <div className="space-y-3">
                        <p className="text-sm text-gray-500 leading-relaxed">
                           Upload target test subjects after the "Add Product" module has fitted our distribution metrics to determine deviance from standard visual qualities.
                        </p>
                     </div>
                  </div>
               </Card>
            </div>
         </div>
      </div>
   );
}
