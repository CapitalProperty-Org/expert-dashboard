import { X, Mail, Smartphone } from 'lucide-react';
import { cn } from '../../../lib/utils';

// Simple Toggle Switch Component
const Toggle = ({ checked, onChange, disabled }: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
            "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2",
            checked ? "bg-indigo-600" : "bg-gray-200",
            disabled && "opacity-50 cursor-not-allowed"
        )}
    >
        <span
            className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                checked ? "translate-x-5" : "translate-x-0"
            )}
        />
    </button>
);

interface NotificationSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    typeId: number;
    inApp: boolean;
    email: boolean;
    onToggle: (type: 'inApp' | 'email', value: boolean) => void;
    loading?: boolean;
}

const NotificationSettingsModal = ({
    isOpen,
    onClose,
    inApp,
    email,
    onToggle,
    loading = false
}: NotificationSettingsModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg transform transition-all p-0 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Channels</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-6 space-y-6">
                    {/* Email Option */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Mail className="text-gray-600" size={20} />
                            <span className="font-medium text-gray-900">E-mail</span>
                        </div>
                        <Toggle
                            checked={email}
                            onChange={(checked) => onToggle('email', checked)}
                            disabled={loading}
                        />
                    </div>

                    {/* In-App Option */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Smartphone className="text-gray-600" size={20} />
                            <span className="font-medium text-gray-900">In-App</span>
                        </div>
                        <Toggle
                            checked={inApp}
                            onChange={(checked) => onToggle('inApp', checked)}
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 mt-2">
                    <button
                        onClick={onClose}
                        className="w-full py-3 px-4 bg-[#FF4B55] hover:bg-[#E63E48] text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF4B55]"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettingsModal;
