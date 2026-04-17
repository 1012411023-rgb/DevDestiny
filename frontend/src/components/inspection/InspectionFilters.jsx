export default function InspectionFilters({ categories, onFilterChange }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8 bg-teal-50/20 p-4 rounded-2xl border border-teal-50">
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <input 
          type="text" 
          placeholder="Filter by Ref ID or product name..." 
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="w-full rounded-xl border border-teal-100 pl-10 pr-4 py-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all placeholder:text-slate-300 font-medium"
        />
      </div>
      
      <div className="flex gap-4">
        <select 
          onChange={(e) => onFilterChange({ category: e.target.value })}
          className="min-w-[160px] rounded-xl border border-teal-100 px-4 py-2.5 text-sm bg-white focus:border-teal-500 outline-none font-bold text-slate-600 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10"
        >
          <option value="">Industry View</option>
          {categories.map(c => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
        
        <select 
          onChange={(e) => onFilterChange({ status: e.target.value })}
          className="min-w-[140px] rounded-xl border border-teal-100 px-4 py-2.5 text-sm bg-white focus:border-teal-500 outline-none font-bold text-slate-600 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10"
        >
          <option value="">Status Filter</option>
          <option value="pass">Pass Only</option>
          <option value="fail">Fail Only</option>
        </select>
      </div>
    </div>
  );
}

