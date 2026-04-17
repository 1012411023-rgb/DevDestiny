import { Bell, Search, User } from 'lucide-react';

export const Navbar = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* Removed Environment Text */}
      </div>

      <div className="flex items-center gap-6">
        {/* Search Mockup */}
        <div className="relative hidden lg:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search records or products..." 
            className="bg-gray-50 border border-gray-200 rounded-md pl-10 pr-4 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 outline-none transition-all w-64"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:text-gray-900 transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        
        <div className="w-8 h-8 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-500 pointer-events-none">
          <User size={18} />
        </div>
      </div>
    </header>
  );
};
