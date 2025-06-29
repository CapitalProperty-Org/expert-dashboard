import React, { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import PermissionsTable from '../components/dashboard/permissions/PermissionsTable';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// تعريف الواجهات للبيانات القادمة من الـ API
interface Role {
    id: number;
    name: string;
    roleKey: string;
}

interface Permission {
    id: number;
    name: string;
    group: {
        id: number;
        name: string;
    };
}

export interface MatrixData {
    roles: Role[];
    groupedPermissions: { [category: string]: Permission[] };
    permissionSet: Set<string>;
}

const RolesAndPermissions = () => {
    const [matrixData, setMatrixData] = useState<MatrixData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPermissionsMatrix = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/permissions-matrix`);
                const { roles, permissions, rolePermissions } = response.data;


                const permissionSet = new Set<string>(
                    rolePermissions.map((rp: { roleId: number; permissionId: number; }) => `${rp.roleId}-${rp.permissionId}`)
                );

                const groupedPermissions: { [category: string]: Permission[] } = {};
                permissions.forEach((permission: Permission) => {
                    const category = permission.group.name;
                    if (!groupedPermissions[category]) {
                        groupedPermissions[category] = [];
                    }
                    groupedPermissions[category].push(permission);
                });

                // 3. تخزين البيانات المعالجة في الحالة
                setMatrixData({
                    roles,
                    groupedPermissions,
                    permissionSet
                });

            } catch (err) {
                setError('Failed to fetch permissions matrix. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPermissionsMatrix();
    }, []);

    const renderContent = () => {
        if (loading) {
            return <div className="flex justify-center mt-16"><LoadingSpinner /></div>;
        }
        if (error) {
            return <div className="text-center mt-16 text-red-600">{error}</div>;
        }
        if (!matrixData) {
            return <div className="text-center mt-16 text-gray-500">No data available.</div>;
        }
        return <PermissionsTable 
                    roles={matrixData.roles} 
                    groupedPermissions={matrixData.groupedPermissions} 
                    permissionSet={matrixData.permissionSet} 
                />;
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Header Section */}
            <div className="p-4 sm:p-6 md:p-8 space-y-4 bg-gray-50 flex-shrink-0 z-20">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">Roles & Permissions</h1>
                    <Link to="/add-new-custom-role">
                        <button className="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md flex items-center gap-2 text-sm">
                            <Plus size={16} />
                            Add Custom Role
                        </button>
                    </Link>
                </div>
                 <p className="text-sm text-gray-600">
                    Permissions available for default roles. <a href="#" className="text-violet-600 underline">Create a custom role</a> to upgrade the capabilities of a default role. <a href="#" className="text-violet-600 underline">Learn more</a>
                </p>
            </div>

            {/* Content Section */}
            <div className="px-4 sm:px-6 md:px-8 flex-grow overflow-y-auto pb-4">
                 {renderContent()}
            </div>
        </div>
    );
};

export default RolesAndPermissions;