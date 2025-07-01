import React, { useEffect } from 'react';
import { XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ErrorToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
}

const ErrorToast = ({ message, show, onClose }: ErrorToastProps) => {
    // إغلاق الرسالة تلقائيًا بعد 5 ثوانٍ
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    return (
        <div 
            className={cn(
                "fixed top-5 right-5 flex items-center gap-4 p-4 rounded-lg bg-white shadow-lg border border-gray-200 transition-transform duration-300 ease-in-out",
                show ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
            )}
            style={{ zIndex: 1000 }}
        >
            <XCircle className="text-red-500 h-6 w-6 flex-shrink-0" />
            <p className="text-sm font-medium text-gray-700">{message || 'An unexpected error occurred.'}</p>
        </div>
    );
};

export default ErrorToast;