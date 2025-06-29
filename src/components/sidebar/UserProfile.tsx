import { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, User as UserIcon, Briefcase, Gem, LogOut } from 'lucide-react';
import { useAuth, useLogout } from '../../context/AuthContext';

const UserProfile = () => {
    const [isOpen, setIsOpen] = useState(false);
        const [isLoggingOut, setIsLoggingOut] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
   const { user } = useAuth(); // جلب بيانات المستخدم
    const logout = useLogout(); 

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [containerRef]);

     const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed", error);
            alert("Could not log out. Please try again.");
            setIsLoggingOut(false);
        }
    };

    return (
        <div ref={containerRef} className="w-full text-left border-b border-gray-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between p-4 hover:bg-gray-50 focus:outline-none"
            >
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                        <UserIcon size={20} />
                    </div>
                    <div>
                        <p className="font-semibold text-sm text-gray-800">{user?.email}</p>
                        <p className="text-xs text-gray-500">{user?.legacyRole}</p>
                    </div>
                </div>
                {isOpen ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
            </button>
            
            {isOpen && (
                <div className="w-full bg-white absolute">
                    <div className="px-1 py-1">
                        <a href="#" className="group flex w-full items-center rounded-md px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700">
                            <UserIcon className="mr-3 h-5 w-5 text-gray-500 group-hover:text-violet-700" /> User Profile
                        </a>
                        <a href="#" className="group flex w-full items-center rounded-md px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700">
                            <Briefcase className="mr-3 h-5 w-5 text-gray-500 group-hover:text-violet-700" /> Company Profile
                        </a>
                        <a href="#" className="group flex w-full items-center rounded-md px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700">
                            <Gem className="mr-3 h-5 w-5 text-gray-500 group-hover:text-violet-700" /> PF Partner Program
                        </a>
                        <div className="my-1 h-px bg-gray-200" />
                        <button 
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="group flex w-full items-center rounded-md px-4 py-2.5 text-sm text-left text-gray-700 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-50"
                        >
                            <LogOut className="mr-3 h-5 w-5 text-gray-500 group-hover:text-violet-700" /> 
                            {isLoggingOut ? 'Logging out...' : 'Logout'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;