import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/sidebar/Sidebar';
import MobileSidebar from '../components/sidebar/MobileSidebar';
// import FloatingActionButton from '../components/ui/FloatingActionButton';
import { Menu } from 'lucide-react';

const DashboardLayout = () => {
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={() => setMobileSidebarOpen(false)} 
      />

      <div className="flex-1 lg:ml-64 flex flex-col w-full min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex justify-end items-center p-4 border-b border-gray-200 bg-white sticky top-0 z-40">
          <button onClick={() => setMobileSidebarOpen(true)} className="p-2 -mr-2">
            <Menu size={24} className="text-gray-600" />
          </button>
        </header>

        <main className="flex-grow flex flex-col">
          <Outlet />
        </main>
      </div>

      {/* <FloatingActionButton /> */}
    </div>
  );
};

export default DashboardLayout;