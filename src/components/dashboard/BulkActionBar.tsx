import React, { useState } from 'react';
import { X, Eye, EyeOff, ThumbsUp, ChevronUp, ChevronsRight, Archive, Ban } from 'lucide-react';

interface BulkActionBarProps {
    selectedCount: number;
    isDraftMode: boolean;
    onDeselectAll: () => void;
    onPublish: () => void;
    onUnpublish: () => void;
    onArchive: () => void;
    onReject: () => void;
    onReassignClick: () => void;
    onApprove: () => void;
}

const BulkActionBar = ({ selectedCount, isDraftMode, onDeselectAll, onPublish, onUnpublish, onArchive, onReject, onReassignClick, onApprove }: BulkActionBarProps) => {
    const [isMoreMenuOpen, setMoreMenuOpen] = useState(false);

    return (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-auto max-w-[90vw] bg-gray-800 text-white rounded-full shadow-lg flex items-center gap-2 px-3 py-2 z-40">
            <button onClick={onDeselectAll} className="p-2 hover:bg-gray-700 rounded-full"><X size={20}/></button>
            <span className="font-semibold text-sm px-2">{selectedCount} Selected</span>
            <div className="w-px h-6 bg-gray-600"></div>
            
            {isDraftMode ? (
                <button onClick={onPublish} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-700 rounded-md text-sm whitespace-nowrap"><Eye size={16}/> Publish</button>
            ) : (
                <button onClick={onUnpublish} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-700 rounded-md text-sm whitespace-nowrap"><EyeOff size={16}/> Unpublish</button>
            )}

            <button onClick={onApprove} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-700 rounded-md text-sm whitespace-nowrap"><ThumbsUp size={16}/> Approve</button>
            
            <div className="relative">
                <button onClick={() => setMoreMenuOpen(!isMoreMenuOpen)} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-700 rounded-md text-sm whitespace-nowrap"><ChevronUp size={16}/> More</button>
                {isMoreMenuOpen && (
                    <div className="absolute bottom-full mb-2 right-0 bg-gray-800 border border-gray-700 rounded-md shadow-lg w-40">
                        <ul className="py-1">
                            <li><button onClick={() => { onReject(); setMoreMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-700"><Ban size={16}/> Reject</button></li>
                            <li><button onClick={() => { onReassignClick(); setMoreMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-700"><ChevronsRight size={16}/> Reassign</button></li>
                            <li><button onClick={() => { onArchive(); setMoreMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-700"><Archive size={16}/> Archive</button></li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BulkActionBar;