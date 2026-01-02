import React from 'react';
import { X, AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    secondaryLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    onSecondary?: () => void;
    type?: 'warning' | 'info' | 'danger';
}

const ConfirmModal = ({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    secondaryLabel,
    onConfirm,
    onCancel,
    onSecondary,
    type = 'warning'
}: ConfirmModalProps) => {
    if (!isOpen) return null;

    const typeConfig = {
        warning: {
            icon: <AlertCircle className="text-amber-500" size={24} />,
            btnClass: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
        },
        info: {
            icon: <AlertCircle className="text-blue-500" size={24} />,
            btnClass: 'bg-violet-600 hover:bg-violet-700 focus:ring-violet-500',
        },
        danger: {
            icon: <AlertCircle className="text-red-500" size={24} />,
            btnClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        }
    };

    const config = typeConfig[type];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
                onClick={onCancel}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-50 rounded-lg">
                                {config.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                        </div>
                        <button
                            onClick={onCancel}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="mt-4">
                        <p className="text-gray-600 leading-relaxed font-medium">
                            {message}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 px-6 py-4 bg-gray-50/50">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all"
                    >
                        {cancelLabel}
                    </button>

                    {secondaryLabel && onSecondary && (
                        <button
                            type="button"
                            onClick={onSecondary}
                            className="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-200 transition-all font-bold"
                        >
                            {secondaryLabel}
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all shadow-lg ${config.btnClass}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
