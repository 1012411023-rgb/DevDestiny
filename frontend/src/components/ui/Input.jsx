export const Input = ({ 
  label, 
  error, 
  helperText, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700 px-1">
          {label}
        </label>
      )}
      <input
        className={`
          bg-white border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-900 
          placeholder-gray-400 outline-none transition-all
          focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20
          disabled:opacity-60 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
        `}
        {...props}
      />
      {error ? (
        <span className="text-xs text-red-500 px-1">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-gray-500 px-1">{helperText}</span>
      ) : null}
    </div>
  );
};
