import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, FileText, Trash2, Archive } from 'lucide-react';

const ActionMenu = () => {
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

    // دالة افتراضية للحذف
    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this listing?')) {
            console.log('Deleting...');
            // هنا تضع منطق استدعاء API الحذف
            setIsOpen(false);
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
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
                            <button onClick={handleDelete} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700">
                                <Trash2 size={16} /> Delete
                            </button>
                        </li>
                        <li>
                            <button className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <Archive size={16} className="text-gray-500" /> Archive
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ActionMenu;