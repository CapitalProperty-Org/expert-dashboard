import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { NavItemType } from '../../types';

interface NavItemProps {
  item: NavItemType;
}

const NavItem = ({ item }: NavItemProps) => {
  const location = useLocation();
  const hasChildren = item.children && item.children.length > 0;

  const isParentActive = hasChildren && (item.children?.some(child => location.pathname === child.href) ?? false);
  const [isOpen, setIsOpen] = useState(isParentActive);

  if (!hasChildren) {
    const isActive = location.pathname === item.href;
    return (
      <Link
        to={item.href}
        className={cn(
          "flex items-center space-x-3 py-2.5 px-4 text-sm font-medium transition-colors",
          isActive ? "text-violet-700" : "text-gray-600 hover:bg-gray-100"
        )}
      >
        <item.icon className={cn("h-5 w-5", isActive ? "text-violet-600" : "text-gray-500")} />
        <span className="flex-1">{item.label}</span>
        {item.badge ? (
          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {item.badge}
          </span>
        ) : null}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between py-2.5 px-4 text-sm font-medium transition-colors",
          isParentActive ? "bg-violet-50 text-violet-700" : "text-gray-600 hover:bg-gray-100"
        )}
      >
        <div className="flex items-center space-x-3">
          <item.icon className={cn("h-5 w-5", isParentActive ? "text-violet-600" : "text-gray-500")} />
          <span>{item.label}</span>
        </div>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && (
        <div className="pt-1 pb-2 pl-5">
          <div className="space-y-1 border-l-2 border-gray-200">
            {item.children?.map((child) => {
              const isChildActive = location.pathname === child.href;
              return (
                <Link
                  key={child.href}
                  to={child.href}
                  className={cn(
                    "flex items-center space-x-4 py-2 pl-4 ml-[-2px] text-sm transition-colors",
                    isChildActive
                      ? "text-violet-800 font-semibold bg-violet-100 border-l-4 border-violet-600"
                      : "text-gray-500 hover:text-gray-800"
                  )}
                >
                  <child.icon className="h-4 w-4" />
                  <span>{child.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavItem;