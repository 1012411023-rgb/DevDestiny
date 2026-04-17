export default function HeatmapPreviewCard({ imageUrl, anomalyScore }) {
  // A mock representation of a heatmap overlay
  const hasAnomaly = anomalyScore > 20;

  return (
    <div className="rounded-2xl border border-teal-100 bg-white p-6 shadow-sm">
      <h3 className="text-xs font-bold text-teal-700 uppercase tracking-widest mb-6 uppercase">Spatial Anomaly Heatmap</h3>
      
      <div className="relative aspect-video rounded-2xl bg-teal-50/50 overflow-hidden border border-teal-100 flex items-center justify-center group shadow-inner">
        {imageUrl ? (
          <>
            <img src={imageUrl} alt="Inspection material" className="w-full h-full object-cover" />
            {hasAnomaly && (
              <div className="absolute inset-0 bg-red-500/10 mix-blend-multiply flex items-center justify-center">
                <div className="w-1/3 h-1/3 bg-red-600/40 blur-3xl rounded-full animate-pulse"></div>
              </div>
            )}
            <div className="absolute top-4 right-4 bg-teal-900/90 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-teal-700/50 shadow-lg">
              Model Diagnostic View
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
             <div className="w-12 h-12 rounded-full border-2 border-dashed border-teal-200"></div>
             <div className="text-teal-900/40 text-xs font-bold uppercase tracking-widest font-serif">Awaiting inspection image...</div>
          </div>
        )}
      </div>
    </div>
  );
}

