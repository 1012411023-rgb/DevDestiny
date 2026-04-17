import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Global Backdrop Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-0" 
           style={{ backgroundImage: 'linear-gradient(#d1d5db 1px, transparent 1px), linear-gradient(90deg, #d1d5db 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <Sidebar />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-8">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
