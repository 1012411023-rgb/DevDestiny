export default function CategoryCard({ category, onClick }) {
  return (
    <div 
      className="rounded-2xl border border-teal-100 bg-white p-6 shadow-sm hover:border-teal-200 hover:shadow-md transition-all flex flex-col h-full group"
    >
      <div className="mb-4">
        <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-900 transition-colors">{category.name}</h3>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">{category.shortDescription}</p>
      </div>
      
      <div className="flex-1 mb-6">
        <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Common Defects</span>
        <ul className="mt-3 space-y-2">
          {category.commonDefects.map((defect, idx) => (
            <li key={idx} className="text-sm text-slate-600 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-200 mr-2 group-hover:bg-teal-400 transition-colors"></span>
              {defect}
            </li>
          ))}
        </ul>
      </div>
      
      <button 
        onClick={() => onClick(category)}
        className="w-full inline-flex items-center justify-center rounded-xl bg-teal-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 shadow-sm transition-all active:scale-[0.98]"
      >
        View Templates
      </button>
    </div>
  );
}

