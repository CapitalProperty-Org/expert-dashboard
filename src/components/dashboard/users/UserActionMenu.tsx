import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';
import axios from 'axios';

interface UserActionMenuProps {
    userId: number;
    currentStatus: 'active' | 'inactive';
    onStatusChange: () => void;
}

const UserActionMenu = ({ userId, currentStatus, onStatusChange }: UserActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleStatus = async () => {
    setIsSubmitting(true);
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
        await axios.patch(`${import.meta.env.VITE_BASE_URL}/api/users/${userId}/status`, {
            status: newStatus
        });
        onStatusChange(); 
    } catch (error) {
        console.error('Failed to update user status', error);
        alert('Could not update user status. Please try again.');
    } finally {
        setIsSubmitting(false);
        setIsOpen(false);
    }
  };

  const actionText = currentStatus === 'active' ? 'Deactivate' : 'Activate';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
        disabled={isSubmitting}
      >
        <MoreHorizontal size={20} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
          <ul className="py-1">
            <li>
              <button
                onClick={handleToggleStatus}
                disabled={isSubmitting}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : actionText}
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserActionMenu;