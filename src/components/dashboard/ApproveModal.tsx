import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface ApproveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApprove: () => void;
    selectedCount: number;
    isApproving: boolean;
}

const ApproveModal = ({ isOpen, onClose, onApprove, selectedCount, isApproving }: ApproveModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div 
                className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col p-8 text-center"
                onClick={e => e.stopPropagation()}
            >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-600" />
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 mb-2">Approve Listings</h2>
                <p className="text-sm text-gray-600 mb-6">
                    You are about to approve {selectedCount} listing(s). This action will mark the listings as approved and they will be visible to users.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-left">
                            <p className="text-sm font-medium text-blue-800">What happens next?</p>
                            <p className="text-xs text-blue-600 mt-1">
                                Approved listings will be published and visible to potential buyers/renters. 
                                Make sure all information is accurate before approving.
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-center gap-4">
                    <button 
                        onClick={onClose} 
                        disabled={isApproving} 
                        className="bg-white border border-gray-300 text-gray-700 font-semibold py-2.5 px-6 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onApprove} 
                        disabled={isApproving}
                        className="bg-green-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300"
                    >
                        {isApproving ? 'Approving...' : 'Approve Listings'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApproveModal;
