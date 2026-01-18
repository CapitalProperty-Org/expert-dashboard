import { useState, useEffect } from 'react';
import { notificationSettingsData } from '../../../data/notificationSettingsData';
import NotificationToggle from './NotificationToggle';
import { fetchNotificationPreferences } from '../../../services/notificationService';
import type { NotificationPreference } from '../../../types';

const NotificationSettingsList = () => {
    const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        try {
            setLoading(true);
            const response = await fetchNotificationPreferences();
            setPreferences(response.data);
        } catch (error) {
            console.error('Error loading notification preferences:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPreferenceByTypeId = (typeId: number): NotificationPreference | undefined => {
        return preferences.find(pref => pref.typeId === typeId);
    };

    const handlePreferenceUpdate = (typeId: number, inApp: boolean, email: boolean) => {
        setPreferences(prev =>
            prev.map(pref =>
                pref.typeId === typeId
                    ? { ...pref, receiveInApp: inApp, receiveEmail: email }
                    : pref
            )
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {notificationSettingsData.map(section => (
                <div key={section.category} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800">{section.category}</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {section.groups.map((group) => (
                            <div key={group.subCategory} className="group-section">
                                <div className="px-6 py-3 bg-gray-50/50">
                                    <h4 className="text-sm font-bold text-gray-900">{group.subCategory}</h4>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {group.settings.map(setting => {
                                        const preference = getPreferenceByTypeId(setting.typeId);
                                        return (
                                            <div key={setting.label} className="flex justify-between items-center px-6 py-4 hover:bg-gray-50 transition-colors">
                                                <span className="text-sm text-gray-700 font-medium">{setting.label}</span>
                                                <NotificationToggle
                                                    typeId={setting.typeId}
                                                    initialInApp={preference?.receiveInApp ?? true}
                                                    initialEmail={preference?.receiveEmail ?? true}
                                                    onUpdate={handlePreferenceUpdate}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NotificationSettingsList;