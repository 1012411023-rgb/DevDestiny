import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Boxes, 
  Search, 
  History, 
  Settings, 
  CreditCard, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const NavItem = ({ to, icon: Icon, label, collapsed }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-150 group
      ${isActive 
        ? 'bg-blue-50 text-blue-600 font-medium' 
        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 font-medium'
      }
    `}
  >
    <Icon size={20} className="shrink-0" />
    {!collapsed && <span className="text-sm truncate">{label}</span>}
    {collapsed && (
      <div className="absolute left-full ml-2 px-2 py-1 bg-white text-gray-800 text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-gray-200">
        {label}
      </div>
    )}
  </NavLink>
);

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';

  return (
    <aside className={`
      bg-white border-r border-gray-200 flex flex-col transition-all duration-300 relative
      ${collapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Brand Header */}
      <div className="p-6 border-b border-gray-200 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center shrink-0">
          <Boxes size={20} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold text-gray-900 truncate">DevDestany</h1>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto overflow-x-hidden">
        <p className={`px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ${collapsed ? 'text-center' : ''}`}>
          {collapsed ? '—' : 'Menu'}
        </p>
        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} />
        <NavItem to="/add-product" icon={Boxes} label="Add New Product" collapsed={collapsed} />
        <NavItem to="/inspection" icon={Search} label="Inspect Product" collapsed={collapsed} />
        
        <div className="my-6 border-t border-gray-200" />
        
        <p className={`px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ${collapsed ? 'text-center' : ''}`}>
           {collapsed ? '—' : 'Account'}
        </p>
        <NavItem to="/billing" icon={CreditCard} label="Billing" collapsed={collapsed} />
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50/50">
        <div className={`flex items-center gap-3 rounded-lg p-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
             {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={logout} className="text-gray-400 hover:text-red-600 transition-colors">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 shadow-md transition-all z-40"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
};
