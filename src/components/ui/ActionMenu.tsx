import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, FileText, Trash2, Archive } from 'lucide-react';
import axios from 'axios';
import { useConfirmationModal } from '../../hooks/useConfirmationModal'; // <-- استيراد الـ Hook

interface ActionMenuProps {
    listingId: string;
    onActionComplete: () => void;
}

const ActionMenu = ({ listingId, onActionComplete }: ActionMenuProps) => {
    const { openModal, ConfirmationModalComponent } = useConfirmationModal();
    const [isOpen, setIsOpen] = useState(false);
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

    const handleAction = async (action: 'archive' | 'delete') => {
        const endpoint = action === 'delete' 
            ? `${import.meta.env.VITE_BASE_URL}/api/listings/listings/${listingId}` 
            : `${import.meta.env.VITE_BASE_URL}/api/listings/listings/${listingId}/archive`;
            
        const method = action === 'delete' ? 'delete' : 'post';

        try {
            await axios[method](endpoint);
            alert(`Listing ${action}d successfully!`);
            onActionComplete();
        } catch (error) {
            alert(`Failed to ${action} listing.`);
            console.error(`Error performing ${action}:`, error);
        }
    };

    const confirmArchive = () => {
        setIsOpen(false); // إغلاق القائمة قبل فتح المودال
        openModal({
            title: 'Are you sure you want to archive this listing?',
            description: 'This listing will be moved to the archive and will no longer be visible.',
            confirmText: 'Archive',
            onConfirm: () => handleAction('archive'),
        });
    };

    const confirmDelete = () => {
        setIsOpen(false); // إغلاق القائمة قبل فتح المودال
        openModal({
            title: 'Are you sure you want to delete this listing?',
            description: 'This action cannot be undone. All data for this listing will be permanently removed.',
            confirmText: 'Delete',
            isDestructive: true,
            onConfirm: () => handleAction('delete'),
        });
    };

    return (
        <>
            <div className="relative" ref={menuRef}>
                <button
                    onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                    className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none"
                >
                    <MoreHorizontal size={20} />
                </button>
                {isOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                        <ul className="py-1">
                            <li>
                                <button className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <FileText size={16} className="text-gray-500" /> Create PDF
                                </button>
                            </li>
                            <li>
                                <button onClick={confirmArchive} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <Archive size={16} className="text-gray-500" /> Archive
                                </button>
                            </li>
                            <li>
                                <button onClick={confirmDelete} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700">
                                    <Trash2 size={16} /> Delete
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
            {ConfirmationModalComponent}
        </>
    );
};

export default ActionMenu;