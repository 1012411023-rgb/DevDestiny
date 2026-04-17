export default function SeverityBadge({ level }) {
  let colors = 'bg-slate-100 text-slate-800';
  
  if (level === 'High') {
    colors = 'bg-red-50 text-red-700 border border-red-100';
  } else if (level === 'Medium') {
    colors = 'bg-amber-50 text-amber-700 border border-amber-100';
  } else if (level === 'Low') {
    colors = 'bg-teal-50 text-teal-700 border border-teal-100';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${colors}`}>
      {level}
    </span>
  );
}

