import React from 'react';
import { Check, X } from 'lucide-react';

// تعريف الواجهات للبيانات
interface PermissionInfo {
    permission: {
        id: number;
        name: string;
        group: {
            name: string;
        };
    };
    assigned: boolean;
    editable: boolean;
}

interface PermissionsListProps {
    permissions: PermissionInfo[];
    selectedPermissions: Set<number>;
    onPermissionChange: (permissionId: number, isSelected: boolean) => void;
    onToggleAllEditable: (shouldSelectAll: boolean) => void;
}

// أيقونات العرض
const Checkmark = () => <Check size={20} className="text-green-600" />;
const Crossmark = () => <X size={20} className="text-red-500" />;
const EditableCheckbox = ({ checked, onChange, indeterminate = false }: { checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, indeterminate?: boolean }) => {
    const ref = React.useRef<HTMLInputElement>(null!);
    React.useEffect(() => {
        ref.current.indeterminate = indeterminate;
    }, [indeterminate]);

    return (
        <input 
            ref={ref}
            type="checkbox" 
            checked={checked}
            onChange={onChange}
            className="h-4 w-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500 cursor-pointer" 
        />
    );
};


const PermissionsList = ({ permissions, selectedPermissions, onPermissionChange, onToggleAllEditable }: PermissionsListProps) => {
    
    const groupedPermissions = permissions.reduce((acc, item) => {
        const category = item.permission.group.name;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {} as { [key: string]: PermissionInfo[] });

    const editablePermissions = permissions.filter(p => p.editable);
    const numEditable = editablePermissions.length;
    const numSelectedEditable = editablePermissions.filter(p => selectedPermissions.has(p.permission.id)).length;

    const isAllSelected = numEditable > 0 && numSelectedEditable === numEditable;
    const isIndeterminate = numSelectedEditable > 0 && numSelectedEditable < numEditable;

    const renderPermissionStatus = (item: PermissionInfo) => {
        if (item.editable) {
            return (
                <EditableCheckbox 
                    checked={selectedPermissions.has(item.permission.id)}
                    onChange={(e) => onPermissionChange(item.permission.id, e.target.checked)}
                />
            );
        }
        return item.assigned ? <Checkmark /> : <Crossmark />;
    };

    return (
        <div className="border border-gray-200/80 rounded-lg bg-white mt-8">
            <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-md font-bold text-gray-800">List Of Permissions</h3>
                <div className="w-6 text-center">
                    {numEditable > 0 && (
                        <EditableCheckbox
                            checked={isAllSelected}
                            indeterminate={isIndeterminate}
                            onChange={(e) => onToggleAllEditable(e.target.checked)}
                        />
                    )}
                </div>
            </div>
            {Object.entries(groupedPermissions).map(([category, items]) => (
                <div key={category}>
                    <div className="bg-gray-100/60 p-4 border-b">
                        <h4 className="font-bold text-sm text-gray-900">{category}</h4>
                    </div>
                    <ul>
                        {items.map(item => (
                            <li key={item.permission.id} className="flex justify-between items-center p-4 border-b last:border-b-0">
                                <span className="text-sm text-gray-600">{item.permission.name}</span>
                                <div className="w-6 text-center">
                                  {renderPermissionStatus(item)}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default PermissionsList;