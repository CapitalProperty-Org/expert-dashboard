import { Link } from 'react-router-dom';
import type { User } from '../../../pages/Users';
import UserActionMenu from './UserActionMenu';
import { User as UserIcon } from 'lucide-react';

const tableHeaders = ["Users", "Role", "Verification", "Status", "Actions"];

interface UsersTableProps {
    users: User[];
    refreshUsers: () => void;
}

const UsersTable = ({ users, refreshUsers }: UsersTableProps) => {
  if (users.length === 0) {
    return <div className="text-center p-8 bg-white rounded-lg border text-gray-500">No users found matching your criteria.</div>;
  }
  
  return (
    <div className="w-full bg-white border border-gray-200/80 rounded-lg overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 scrollbar-thumb-rounded-full">
      <table className="min-w-full w-full">
        <thead className="bg-gray-50/50">
          <tr className="border-b border-gray-200/80">
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">
                {`Users (${users.length})`}
            </th>
            {tableHeaders.slice(1).map((header) => (
              <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {users.map((user) => (
            <tr key={user.id} className="border-b last:border-b-0 border-gray-200/80">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <UserIcon size={20} className="text-gray-400" />
                    </div>
                    <div>
 <Link to={`/users/${user.id}`} className="text-sm font-semibold text-gray-800 hover:text-violet-600 hover:underline">
                            {`${user.first_name || ''} ${user.last_name || ''}`.trim()}
                        </Link>                        <p className="text-sm text-gray-500">{user.mobile}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.role?.name || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm capitalize font-medium">
                <span className={user.agent?.verification?.status === 'incomplete' ? 'text-yellow-600' : 'text-green-600'}>
                    {user.agent?.verification?.status || 'N/A'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium relative">
                <UserActionMenu userId={user.id} currentStatus={user.status} onStatusChange={refreshUsers} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;