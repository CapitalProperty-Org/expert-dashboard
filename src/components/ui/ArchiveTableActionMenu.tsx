import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Edit2, Eye, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useConfirmationModal } from '../../hooks/useConfirmationModal';
import ErrorToast from './ErrorToast';
import SuccessToast from './SuccessToast';

interface ArchiveTableActionMenuProps {
    listingId: string;
    onActionComplete: () => void;
}

const ArchiveTableActionMenu = ({ listingId, onActionComplete }: ArchiveTableActionMenuProps) => {
    const { openModal, ConfirmationModalComponent } = useConfirmationModal();
    const [isOpen, setIsOpen] = useState(false);
    const [showErrorToast, setShowErrorToast] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
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

    const handleUnarchive = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_BASE_URL}/api/listings/listings/${listingId}/unarchive`);
            setShowSuccessToast(true);
            onActionComplete();
        } catch (error) {
            setErrorMessage('Failed to unarchive listing.');
            setShowErrorToast(true);
            console.error('Error unarchiving:', error);
        }
    };

    const confirmUnarchive = () => {
        setIsOpen(false);
        openModal({
            title: 'Are you sure you want to unarchive this listing?',
            description: 'Listing will appear under the Listings Management tab.',
            confirmText: 'Submit',
            onConfirm: handleUnarchive,
        });
    };
    
    // يمكنك إضافة منطق الحذف هنا بنفس طريقة ActionMenu إذا أردت

    return (
        <>
            <div className="relative" ref={menuRef}>
                <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none">
                    <MoreHorizontal size={20} />
                </button>
                {isOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                        <ul className="py-1">
                            <li>
                                <button className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <Edit2 size={16} /> Edit
                                </button>
                            </li>
                            <li>
                                <button onClick={confirmUnarchive} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <Eye size={16} /> Unarchive
                                </button>
                            </li>
                            <li>
                                <button className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                    <Trash2 size={16} /> Delete
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
            {ConfirmationModalComponent}
            
            {showErrorToast && (
                <ErrorToast 
                    show={showErrorToast}
                    message={errorMessage} 
                    onClose={() => setShowErrorToast(false)} 
                />
            )}
            
            {showSuccessToast && (
                <SuccessToast 
                    show={showSuccessToast}
                    message="Listing unarchived successfully!" 
                    onClose={() => setShowSuccessToast(false)} 
                />
            )}
        </>
    );
};

export default ArchiveTableActionMenu;