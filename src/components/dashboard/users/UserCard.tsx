// src/components/dashboard/users/UserCard.tsx
// src/components/dashboard/users/UserCard.tsx
import type { User as UserType } from '../../../pages/Users';
import { User as UserIcon } from 'lucide-react';
import UserActionMenu from './UserActionMenu';

interface UserCardProps {
    user: UserType;
    refreshUsers: () => void;
}

const UserCard = ({ user, refreshUsers }: UserCardProps) => {
    return (
        <div className="bg-white border border-gray-200/80 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <UserIcon size={20} className="text-gray-400" />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 text-sm">{`${user.first_name} ${user.last_name}`}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                </div>
                <UserActionMenu userId={user.id} currentStatus={user?.status} onStatusChange={refreshUsers} />
            </div>

            <div className="border-t pt-3 space-y-2">
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Role</span>
                    <span className="font-medium text-gray-800">{user.role.name}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user?.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Verification</span>
                    <span className={`capitalize font-medium ${user.agent.verification?.status === 'incomplete' ? 'text-yellow-600' : 'text-green-600'}`}>
                        {user.agent.verification?.status}
                    </span>
                 </div>
            </div>
        </div>
    );
};

export default UserCard;