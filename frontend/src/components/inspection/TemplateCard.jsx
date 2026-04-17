export default function TemplateCard({ template, onOpen }) {
  const isReady = template.status === 'ready';

  return (
    <div className="rounded-2xl border border-teal-100 bg-white p-6 shadow-sm flex flex-col hover:shadow-md transition-all border-l-4 border-l-teal-500">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-lg font-bold text-slate-900">{template.name}</h4>
          <p className="text-xs text-teal-600 font-medium uppercase tracking-wider mt-0.5">{template.category}</p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isReady ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-500'}`}>
          {isReady ? 'Ready' : 'Draft'}
        </span>
      </div>
      
      <div className="flex justify-between items-center py-4 border-y border-teal-50 my-4">
        <div>
          <span className="block text-xl font-bold text-slate-900">{template.referenceImageCount}</span>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Reference Images</span>
        </div>
        <div className="text-right">
          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider text-right mb-1">Last Updated</span>
          <span className="text-sm font-medium text-slate-700">{new Date(template.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="mt-2">
        <button 
          onClick={() => onOpen(template)}
          className={`w-full inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] ${
            isReady 
              ? 'bg-teal-900 text-white hover:bg-teal-800 shadow-sm' 
              : 'bg-white border border-teal-200 text-teal-800 hover:bg-teal-50'
          }`}
        >
          {isReady ? 'Open Template' : 'Complete Setup'}
        </button>
      </div>
    </div>
  );
}

