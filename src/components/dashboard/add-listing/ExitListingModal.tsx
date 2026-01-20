import React from 'react';
import { X } from 'lucide-react';

interface ExitListingModalProps {
    isOpen: boolean;
    onExit: () => void;
    onCancel: () => void;
}

const ExitListingModal = ({
    isOpen,
    onExit,
    onCancel,
}: ExitListingModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
                onClick={onCancel}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm transform transition-all overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex flex-col items-center p-8 text-center bg-white">
                    <div className="mb-6 w-32 h-32 flex items-center justify-center">
                        <img
                            src="/exit.svg"
                            alt="Exit"
                            className="w-full h-full object-contain"
                        />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-8">
                        Are you sure you want to exit?
                    </h3>

                    <div className="w-full space-y-3">
                        <button
                            type="button"
                            onClick={onExit}
                            className="w-full py-3 px-4 text-sm font-bold text-violet-700 bg-white border border-violet-100 rounded-xl hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-200 transition-all uppercase tracking-wide"
                        >
                            Exit
                        </button>

                        <button
                            type="button"
                            onClick={onCancel}
                            className="w-full py-3 px-4 text-sm font-bold text-gray-500 bg-transparent rounded-xl hover:text-gray-700 transition-all"
                        >
                            Back to editing
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExitListingModal;
