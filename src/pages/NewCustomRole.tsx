import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomSelect from '../components/ui/CustomSelect';
import PermissionsList from '../components/dashboard/permissions/PermissionsList';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// تعريف الواجهات
interface BaseRole {
    id: number;
    name: string;
}

interface PermissionRule {
    permission: { id: number; name: string; group: { name: string; } };
    assigned: boolean;
    editable: boolean;
}

const FormField = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        {children}
    </div>
);

const NewCustomRole = () => {
    const navigate = useNavigate();

    const [roleName, setRoleName] = useState('');
    const [baseRoles, setBaseRoles] = useState<BaseRole[]>([]);
    const [selectedBaseRoleId, setSelectedBaseRoleId] = useState<{ value: string | number; label: string } | null>(null);
    const [permissionRules, setPermissionRules] = useState<PermissionRule[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());
    
    const [loadingBaseRoles, setLoadingBaseRoles] = useState(true);
    const [loadingPermissions, setLoadingPermissions] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 1. جلب الأدوار الأساسية (لا تغيير هنا)
    useEffect(() => {
        const fetchBaseRoles = async () => {
            setLoadingBaseRoles(true);
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/roles`);
                setBaseRoles(response.data);
            } catch (err: unknown) {
                console.error("Failed to load base roles:", err);
                setError("Failed to load base roles.");
            } finally {
                setLoadingBaseRoles(false);
            }
        };
        fetchBaseRoles();
    }, []);

    // 2. جلب قواعد الصلاحيات وتعيين الحالة الأولية بشكل صحيح
    useEffect(() => {
        if (!selectedBaseRoleId) {
            setPermissionRules([]);
            return;
        }

        const fetchPermissionRules = async () => {
            setLoadingPermissions(true);
            setError(null);
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/permissions-matrix/roles/${selectedBaseRoleId.value}/custom-role-creation-rules`);
                const rules: PermissionRule[] = response.data;
                setPermissionRules(rules);

                // ## هذا هو المنطق الجديد والصحيح لتعيين الحالة الأولية ##
                const initialSelected = new Set<number>();
                rules.forEach(rule => {
                    // أضف الصلاحية إلى القائمة فقط إذا كانت ممنوحة (assigned)
                    // **و** غير قابلة للتعديل (NOT editable)
                    if (rule.assigned && !rule.editable) {
                        initialSelected.add(rule.permission.id);
                    }
                    // الصلاحيات القابلة للتعديل (editable: true) ستبدأ دائمًا غير محددة
                });
                setSelectedPermissions(initialSelected);

            } catch (err: unknown) {
                console.error("Failed to load permissions for the selected role:", err);
                setError("Failed to load permissions for the selected role.");
            } finally {
                setLoadingPermissions(false);
            }
        };
        fetchPermissionRules();
    }, [selectedBaseRoleId]);

    const handlePermissionChange = (permissionId: number, isSelected: boolean) => {
        setSelectedPermissions(prev => {
            const newSet = new Set(prev);
            if (isSelected) newSet.add(permissionId);
            else newSet.delete(permissionId);
            return newSet;
        });
    };

    const handleToggleAllEditable = (shouldSelectAll: boolean) => {
        const editablePermissionIds = permissionRules
            .filter(rule => rule.editable)
            .map(rule => rule.permission.id);
        
        setSelectedPermissions(prev => {
            const newSet = new Set(prev);
            if (shouldSelectAll) {
                editablePermissionIds.forEach(id => newSet.add(id));
            } else {
                editablePermissionIds.forEach(id => newSet.delete(id));
            }
            return newSet;
        });
    };

    const baseRoleOptions = useMemo(() => 
        baseRoles.map(role => ({ value: role.id.toString(), label: role.name })),
    [baseRoles]);

    // الآن التحقق يعتمد فقط على اختيار دور أساسي (اسم الدور اختياري)
    const isFormValid = selectedBaseRoleId;

    const handleSave = async () => {
        if (!isFormValid) {
            setError("Please select a base role first.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        // 1. (هذه هي الخطوة الأهم) إنشاء الـ Body للطلب:
        // يجب أن يحتوي فقط على الصلاحيات التي كانت قابلة للتعديل وتم تحديدها
        const editablePermissionsToSave = Array.from(selectedPermissions)
            .filter(id => {
                const rule = permissionRules.find(r => r.permission.id === id);
                return rule && rule.editable;
            });

        try {
            // 2. إرسال طلب PUT إلى الـ endpoint الصحيح
            await axios.put(
                `${import.meta.env.VITE_BASE_URL}/api/permissions-matrix/roles/${selectedBaseRoleId.value}/editable-permissions`, 
                editablePermissionsToSave // Body الطلب هو مصفوفة من الأرقام
            );
            
            alert('Permissions updated successfully!');
            navigate('/roles-permissions');

        } catch (err: unknown) {
            const errorMessage = err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data ? String(err.response.data.message) : "Failed to update permissions.";
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <div className="space-y-6">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-4">
                    <ArrowLeft size={16} />
                    Back
                </button>
                <h1 className="text-2xl font-bold text-gray-800">New custom role</h1>

                <div className="bg-white border border-gray-200/80 rounded-lg p-8">
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-8">
                            <FormField label="Role name">
                                <input type="text" placeholder="e.g. Senior Agent" value={roleName} onChange={e => setRoleName(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" />
                            </FormField>
                            <FormField label="Base role">
                                <CustomSelect options={baseRoleOptions} placeholder="Choose base role" value={selectedBaseRoleId} onChange={setSelectedBaseRoleId} disabled={loadingBaseRoles} />
                            </FormField>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Name your role and select a Base role. Custom role will be based on the Base role you select.</p>
                        </div>

                        {loadingPermissions && <div className="flex justify-center py-8"><LoadingSpinner /></div>}
                        {error && !loadingPermissions && <p className="text-red-500 text-center py-4">{error}</p>}
                        
                        {permissionRules.length > 0 && !loadingPermissions && (
                            <PermissionsList 
                                permissions={permissionRules}
                                selectedPermissions={selectedPermissions}
                                onPermissionChange={handlePermissionChange}
                                onToggleAllEditable={handleToggleAllEditable}
                            />
                        )}

                        <div className="flex items-center gap-4 pt-4 border-t border-gray-200/80">
                            <button type="button" onClick={() => navigate(-1)} className="bg-white border border-gray-300 text-gray-700 font-semibold py-2.5 px-6 rounded-lg hover:bg-gray-100">Cancel</button>
                            <button type="button" onClick={handleSave} disabled={!isFormValid || isSubmitting || loadingPermissions} className="bg-red-600 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
                                {isSubmitting ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewCustomRole;