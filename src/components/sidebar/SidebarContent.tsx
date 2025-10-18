import {
  LayoutDashboard, List, BarChart, FileText, Landmark,
  Handshake, Users, Bell, GraduationCap, LifeBuoy, Settings, Archive,
  Inbox,
  Gift,
  Shield,
  Users2Icon,
  ExternalLink
} from 'lucide-react';
import UserProfile from './UserProfile';
import NavItem from './NavItem';
import CreditsStatus from './CreditsStatus';
import type { NavItemType } from '../../types';

const SidebarContent = () => {
  const navItems: NavItemType[] = [
    {
      label: 'Dashboard', href: '#', icon: LayoutDashboard,
      children: [
        { label: 'Listing Performance', href: '/', icon: BarChart },
        { label: 'Lead Insights', href: '/lead-insights', icon: BarChart },
        { label: 'Agent Insights', href: '/agent-insights', icon: BarChart },
      ]
    },
    {
      label: 'Listings', href: '#', icon: List,
      children: [
        { label: 'Listings Management', href: '/listings-management', icon: List },
        { label: 'Listings Archive', href: '/listings-archive', icon: Archive },
        { label: 'CTS Listings', href: '/cts-listings', icon: List },
        { label: 'Listings Settings', href: '/listings-settings', icon: Settings },
      ]
    },
 {
      label: 'Leads', href: '#', icon: Users,
      children: [
        { label: 'Leads received', href: '/leads-management', icon: Inbox },
        { label: 'Regular Leads', href: '/leads-regular-management', icon: Inbox },
      ]
    },
    { label: 'Transactions', href: '/transactions', icon: FileText },
    { label: 'Community Top Spot', href: '/community-top-spot', icon: Landmark },
 {
      label: 'Contracts & Payments', href: '#', icon: Handshake,
      children: [
        { label: 'Contracts', href: '/contracts', icon: FileText },
        { label: 'Payments', href: '/payments', icon: FileText }, 
      ]
    },    
 {
      label: 'Credits', href: '#', icon: Handshake,
      children: [
        { label: 'Credit Usage History', href: '/credit-usage-history', icon: FileText },
        { label: 'Credit Returns', href: '/credit-returns', icon: Gift }, 
      ]
    },    
 {
      label: 'Users & Roles', href: '#', icon: Users2Icon,
      children: [
        { label: 'Users', href: '/users', icon: Users2Icon },
        { label: 'Roles & Permissions', href: '/roles-permissions', icon: Shield },
      ]
    },  
    { label: 'Security', href: '/security', icon: Shield },
    { label: 'Notifications', href: '/notifications', icon: Bell }, // <-- تحديث الرابط
    { label: 'PF Academy', href: '#', icon: GraduationCap },
    { label: 'Support', href: '#', icon: LifeBuoy },
  ];

  return (
    <>
      <UserProfile />
      <nav className="flex-1 overflow-y-auto py-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {navItems.map((item, index) => (
          <NavItem key={index} item={item} />
        ))}
      </nav>
      <div className="mt-auto border-t border-gray-200">
        <div className="p-4">
          <select className="w-full p-2 border border-gray-300 rounded-md text-sm">
            <option>English</option>
            <option>العربية</option>
          </select>
        </div>
        <CreditsStatus />
        <div className="p-4 border-t border-gray-200 space-y-2">
          <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-sm text-gray-600 hover:text-gray-900">
            <ExternalLink size={20} />
            <span>Back to Website</span>
          </a>
          <a href="#" className="flex items-center space-x-3 text-sm text-gray-600 hover:text-gray-900">
            <LifeBuoy size={20} />
            <span>Help Center</span>
          </a>
        </div>
      </div>
    </>
  );
};

export default SidebarContent;