import { X } from 'lucide-react';
import SidebarContent from './SidebarContent';
import SidebarLogo from '../common/SidebarLogo';
import { cn } from '../../lib/utils';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSidebar = ({ isOpen, onClose }: MobileSidebarProps) => {
  return (
    <div className={cn("fixed inset-0 z-50 lg:hidden", !isOpen && "pointer-events-none")}>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black transition-opacity",
          isOpen ? "opacity-50" : "opacity-0"
        )}
      />
      {/* Sidebar Panel */}
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-full max-w-xs bg-white flex flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <SidebarLogo />
          </div>
          <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-gray-100">
            <X size={24} className="text-gray-600" />
          </button>
        </div>
        <SidebarContent />
      </div>
    </div>
  );
};

export default MobileSidebar;