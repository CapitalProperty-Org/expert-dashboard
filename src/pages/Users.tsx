import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CustomSelect from '../components/ui/CustomSelect';
import UsersTable from '../components/dashboard/users/UsersTable';
import { useDebounce } from '../hooks/useDebounce';
import UserCard from '../components/dashboard/users/UserCard';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner'; // <-- استيراد
import NoResultsFound from '../components/ui/NoResultsFound'; // <-- استيراد

export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  mobile: string;
  status: 'active' | 'inactive';
  role: Role;
  agent: {
    verification: {
      status: string;
    };
  };
}

const Users = () => {
    const { isLoading: isAuthLoading } = useAuth();

    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState<{ value: string | number; label: string } | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<{ value: string | number; label: string } | null>(null);

    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    const effectRan = useRef(false);
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isAuthLoading) {
            return;
        }

        if (effectRan.current === true) {
            return;
        }

        const fetchInitialData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [usersResponse, rolesResponse] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_BASE_URL}/api/users`),
                    axios.get(`${import.meta.env.VITE_BASE_URL}/api/roles`)
                ]);
                setUsers(usersResponse.data);
                setRoles(rolesResponse.data);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                if (err.response?.status === 401) {
                    setError('Authorization failed. Please try logging in again.');
                } else {
                    setError('Failed to fetch initial data. Please try again.');
                }
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();

        return () => {
            effectRan.current = true;
        };
    }, [isAuthLoading]); 

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const fetchFilteredUsers = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams();
                if (debouncedSearchQuery) params.append('query', debouncedSearchQuery);
                if (selectedRole) params.append('role', selectedRole.value.toString());
                if (selectedStatus) params.append('status', selectedStatus.value.toString());
                    console.log("params" , params)
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/users?${params.toString()}`);
                setUsers(response.data);
            } catch (err) {
                setError('Failed to fetch users. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchFilteredUsers();
    }, [debouncedSearchQuery, selectedRole, selectedStatus]);

    const handleRefresh = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (debouncedSearchQuery) params.append('query', debouncedSearchQuery);
            if (selectedRole) params.append('role', selectedRole.value.toString());
            if (selectedStatus) params.append('status', selectedStatus.value.toString());
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/users?${params.toString()}`);
            setUsers(response.data);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setError('Could not refresh users.');
        } finally {
            setLoading(false);
        }
    };
    
    const roleOptions = useMemo(() => 
        roles.map(role => ({ value: role.id.toString(), label: role.name })),
    [roles]);

    const statusOptions = [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
    ];

    const renderContent = () => {
        if (loading) {
            return <LoadingSpinner />;
        }
        if (error) {
            return <div className="flex-grow flex items-center justify-center text-red-600">{error}</div>;
        }
        if (users.length === 0) {
            return <NoResultsFound />;
        }
        return (
            <>
                <div className="hidden lg:block">
                   <UsersTable users={users} refreshUsers={handleRefresh} />
                </div>
                <div className="block lg:hidden space-y-4">
                   {users.map(user => <UserCard key={user.id} user={user} refreshUsers={handleRefresh} />)}
                </div>
            </>
        );
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="p-4 sm:p-6 md:p-8 space-y-4 lg:space-y-6 bg-gray-50 flex-shrink-0 z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <h1 className="text-2xl font-bold text-gray-800">Users</h1>
                    <div className="flex items-center gap-2">
                        <Link to="/add-new-user">
                            <button className="w-full lg:w-auto bg-red-600 text-white font-semibold py-3 lg:py-2.5 px-4 rounded-md flex items-center justify-center gap-2 text-sm">
                                <Plus size={16} />Create a new user
                            </button>
                        </Link>
                    </div>
                </div>
                
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:justify-between">
                    <div className="relative w-full lg:max-w-xs">
                        <input type="text" placeholder="Search by Name, Email, Mobile" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white pl-4 pr-10 py-2.5 border rounded-lg text-sm" />
                        <button className="absolute inset-y-0 right-0 flex items-center justify-center w-12 border-l bg-gray-50 rounded-r-lg hover:bg-gray-100">
                            <Search size={18} className="text-gray-500" />
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 lg:w-48">
                            <CustomSelect options={[{ value: '', label: 'Any role' }, ...roleOptions]} placeholder="Any role" value={selectedRole} onChange={setSelectedRole} />
                        </div>
                        <div className="flex-1 lg:w-48">
                            <CustomSelect options={[{ value: '', label: 'Any status' }, ...statusOptions]} placeholder="Any status" value={selectedStatus} onChange={setSelectedStatus} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 sm:px-6 md:px-8 flex-grow overflow-y-auto pb-4 flex flex-col">
                {renderContent()}
            </div>
        </div>
    );
};

export default Users;