export const Card = ({ 
  children, 
  className = '', 
  padding = true, 
  hover = false,
  interactive = false
}) => {
  return (
    <div className={`
      bg-white border border-gray-200 rounded-lg shadow-sm
      ${padding ? 'p-6' : ''}
      ${hover ? 'hover:border-gray-300 transition-colors' : ''}
      ${interactive ? 'cursor-pointer active:scale-[0.99] transition-all' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};
