import { useState, useEffect } from 'react';
import { CheckSquare, Settings } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { updateNotificationPreferences } from '../../../services/notificationService';
import NotificationSettingsModal from './NotificationSettingsModal';

interface NotificationToggleProps {
    typeId: number;
    initialInApp?: boolean;
    initialEmail?: boolean;
    onUpdate?: (typeId: number, inApp: boolean, email: boolean) => void;
}

const NotificationToggle = ({ typeId, initialInApp = true, initialEmail = true, onUpdate }: NotificationToggleProps) => {
    const [inAppActive, setInAppActive] = useState(initialInApp);
    const [emailActive, setEmailActive] = useState(initialEmail);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        setInAppActive(initialInApp);
        setEmailActive(initialEmail);
    }, [initialInApp, initialEmail]);

    const handleToggle = async (type: 'inApp' | 'email', value: boolean) => {
        try {
            setLoading(true);

            // Calculate new state based on what's being changed
            const newInApp = type === 'inApp' ? value : inAppActive;
            const newEmail = type === 'email' ? value : emailActive;

            const updateData = {
                data: [{
                    typeId,
                    receiveInApp: newInApp,
                    receiveEmail: newEmail,
                    receiveSMS: false, // Default to false for now
                    receivePush: false  // Default to false for now
                }]
            };

            await updateNotificationPreferences(updateData);

            setInAppActive(newInApp);
            setEmailActive(newEmail);

            if (onUpdate) {
                onUpdate(typeId, newInApp, newEmail);
            }
        } catch (error) {
            console.error('Error updating notification preference:', error);
            // State reverts automatically because we only update local state on success 
            // (or we could explicitly revert here if we updated optimistically)
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => handleToggle('inApp', !inAppActive)}
                disabled={loading}
                className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                title="Toggle In-App Notification"
            >
                <div className={cn(
                    "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                    inAppActive
                        ? "bg-violet-600 border-violet-600"
                        : "border-gray-300 bg-white"
                )}>
                    {inAppActive && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </div>
            </button>

            <button
                onClick={() => setIsModalOpen(true)}
                disabled={loading}
                className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 text-gray-400 hover:text-gray-600"
                title="Configure Channels"
            >
                <Settings size={18} />
            </button>

            <NotificationSettingsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                typeId={typeId}
                inApp={inAppActive}
                email={emailActive}
                onToggle={handleToggle}
                loading={loading}
            />
        </div>
    );
};

export default NotificationToggle;