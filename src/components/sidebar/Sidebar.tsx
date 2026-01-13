import SidebarContent from './SidebarContent';
import SidebarLogo from '../common/SidebarLogo';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex-col fixed inset-y-0 hidden lg:flex">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <SidebarLogo />
        </div>
      </div>
      <SidebarContent />
    </aside>
  );
};

export default Sidebar;