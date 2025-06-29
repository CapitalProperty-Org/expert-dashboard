import React from 'react';
import { Check, X } from 'lucide-react';

const Checkmark = () => <Check size={20} className="text-green-600 mx-auto" />;
const Crossmark = () => <X size={20} className="text-red-500 mx-auto" />;

// تعريف الواجهات مرة أخرى لضمان وضوح الكود
interface Role {
    id: number;
    name: string;
    roleKey: string;
}

interface Permission {
    id: number;
    name: string;
}

interface PermissionsTableProps {
    roles: Role[];
    groupedPermissions: { [category: string]: Permission[] };
    permissionSet: Set<string>;
}

const PermissionsTable = ({ roles, groupedPermissions, permissionSet }: PermissionsTableProps) => {
    return (
        <div className="w-full bg-white border border-gray-200/80 rounded-lg overflow-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 scrollbar-thumb-rounded-full">
            <table className="min-w-full w-full border-collapse">
                <thead className="sticky top-0 bg-gray-50/95 backdrop-blur-sm z-20">
                    <tr className="border-b border-gray-200/80">
                        <th scope="col" className="sticky left-0 bg-gray-50/95 px-6 py-4 text-left text-sm font-bold text-gray-800 z-30 w-64">
                            List of Permissions
                        </th>
                        {roles.map((role) => (
                            <th key={role.id} scope="col" className="px-6 py-4 text-center text-sm font-bold text-gray-800 whitespace-nowrap">
                                {role.name}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white">
                    {/* استخدام Object.entries للمرور على الفئات المجمعة */}
                    {Object.entries(groupedPermissions).map(([category, permissions]) => (
                        <React.Fragment key={category}>
                            {/* Category Row */}
                            <tr className="bg-gray-100/60">
                                <td colSpan={roles.length + 1} className="sticky left-0 bg-gray-100/60 px-6 py-3 text-left text-sm font-bold text-gray-900 z-10">
                                    {category}
                                </td>
                            </tr>
                            {/* Permission Rows */}
                            {permissions.map((permission) => (
                                <tr key={permission.id} className="border-b last:border-b-0 border-gray-200/80">
                                    <td className="sticky left-0 bg-white px-6 py-4 whitespace-nowrap text-sm text-gray-600 z-10 hover:bg-gray-50">
                                        {permission.name}
                                    </td>
                                    {/* التحقق من الصلاحية لكل دور باستخدام الـ Set */}
                                    {roles.map((role) => (
                                        <td key={`${permission.id}-${role.id}`} className="px-6 py-4 text-center">
                                            {permissionSet.has(`${role.id}-${permission.id}`) ? <Checkmark /> : <Crossmark />}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PermissionsTable;