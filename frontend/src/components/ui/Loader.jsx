export const Loader = ({ 
  size = 'md', 
  centered = false,
  message,
  className = ''
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className={`${sizes[size]} border-2 border-slate-700 border-t-brand-primary rounded-full animate-spin`} />
      {message && <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">{message}</span>}
    </div>
  );

  if (centered) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[200px]">
        {content}
      </div>
    );
  }

  return content;
};
