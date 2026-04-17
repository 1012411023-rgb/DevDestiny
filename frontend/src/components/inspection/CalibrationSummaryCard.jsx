export default function CalibrationSummaryCard({ imageCount, onCalibrate, isCalibrating, isCalibrated }) {
  const minRequired = 10;
  const isReady = imageCount >= minRequired;

  return (
    <div className="rounded-2xl border border-teal-100 bg-white p-6 shadow-sm overflow-hidden relative">
      {/* Decorative background element */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-teal-50 rounded-full opacity-50"></div>

      <div className="mb-6 relative z-10">
        <h3 className="text-lg font-bold text-slate-900">Calibration Progress</h3>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide font-medium">Training Data Requirement</p>
      </div>

      <div className="flex items-center justify-between py-6 border-y border-teal-50 mb-6 relative z-10">
        <div className="flex flex-col">
          <span className="text-3xl font-bold text-slate-900 leading-none">{imageCount}</span>
          <span className="text-[10px] text-teal-600 font-bold uppercase tracking-widest mt-1">Uploads</span>
        </div>
        <div>
          {isCalibrated ? (
            <span className="inline-flex items-center px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-[10px] font-bold uppercase tracking-widest">Calibrated</span>
          ) : isReady ? (
            <span className="inline-flex items-center px-3 py-1 bg-teal-900 text-white rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse">Ready</span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-widest">
              {minRequired - imageCount} Remaining
            </span>
          )}
        </div>
      </div>

      <button
        onClick={onCalibrate}
        disabled={!isReady || isCalibrating || isCalibrated}
        className={`w-full inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-bold shadow-sm transition-all active:scale-[0.98] relative z-10 ${
          !isReady || isCalibrated
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            : isCalibrating
            ? 'bg-teal-600 text-white shadow-teal-100'
            : 'bg-teal-900 text-white hover:bg-teal-800'
        }`}
      >
        {isCalibrating ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Calibrating...
          </>
        ) : isCalibrated ? 'Model Calibrated' : 'Initialize Calibration'}
      </button>
    </div>
  );
}

