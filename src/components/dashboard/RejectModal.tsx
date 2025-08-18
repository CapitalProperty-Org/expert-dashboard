import React from 'react';
import { Ban, AlertCircle } from 'lucide-react';

interface RejectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReject: () => void;
    selectedCount: number;
    isRejecting: boolean;
}

const RejectModal = ({ isOpen, onClose, onReject, selectedCount, isRejecting }: RejectModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div 
                className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col p-8 text-center"
                onClick={e => e.stopPropagation()}
            >
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Ban size={32} className="text-red-600" />
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 mb-2">Reject Listings</h2>
                <p className="text-sm text-gray-600 mb-6">
                    You are about to reject {selectedCount} listing(s). This action will mark the listings as rejected and return them to draft status.
                </p>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="text-left">
                            <p className="text-sm font-medium text-red-800">What happens next?</p>
                            <p className="text-xs text-red-600 mt-1">
                                Rejected listings will be returned to draft status and assigned back to the agent. 
                                The agent will need to address the issues before resubmitting.
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-center gap-4">
                    <button 
                        onClick={onClose} 
                        disabled={isRejecting} 
                        className="bg-white border border-gray-300 text-gray-700 font-semibold py-2.5 px-6 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onReject} 
                        disabled={isRejecting}
                        className="bg-red-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300"
                    >
                        {isRejecting ? 'Rejecting...' : 'Reject Listings'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RejectModal;
