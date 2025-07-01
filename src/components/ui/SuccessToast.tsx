import React, { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils'; // افترض وجود هذه الدالة

interface SuccessToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
}

const SuccessToast = ({ message, show, onClose }: SuccessToastProps) => {
    // إغلاق الرسالة تلقائيًا بعد 3 ثوانٍ
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    return (
        <div 
            className={cn(
                "fixed top-5 right-5 flex items-center gap-4 p-4 rounded-lg bg-white shadow-lg border border-gray-200 transition-transform duration-300 ease-in-out",
                show ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
            )}
            style={{ zIndex: 1000 }} // التأكد من أنها تظهر فوق كل شيء
        >
            <CheckCircle2 className="text-green-500 h-6 w-6 flex-shrink-0" />
            <p className="text-sm font-medium text-gray-700">{message}</p>
        </div>
    );
};

export default SuccessToast;