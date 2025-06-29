import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import CustomSelect from '../components/ui/CustomSelect';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const FormField = ({ label, children, required = false }: { label: string, children: React.ReactNode, required?: boolean }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

const UserDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { roles, isLoading: isAuthLoading } = useAuth();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneCode: '971',
        phoneNumber: '',
        loginEmail: '',
        password: '',
        selectedRole: '',
    });

    const [loadingPage, setLoadingPage] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthLoading) {
            return;
        }

        const fetchUserData = async () => {
            setLoadingPage(true);
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/users/${id}`);
                
                let phoneCode = '971';
                let phoneNumber = '';
                if (data.mobile) {
                    if (data.mobile.startsWith('+971')) {
                        phoneCode = '971';
                        phoneNumber = data.mobile.substring(4);
                    } else {
                        phoneNumber = data.mobile.replace(/\D/g, '');
                    }
                }


                setFormData({
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    phoneCode: phoneCode,
                    phoneNumber: phoneNumber,
                    loginEmail: data.email || '',
                    selectedRole: data.role?.toString() || '', 
                    password: '',
                });

            } catch (err) {
                setError('Failed to load user data.');
                console.error(err);
            } finally {
                setLoadingPage(false);
            }
        };

        if (id) {
            fetchUserData();
        }
    }, [id, isAuthLoading]);

    const roleOptions = useMemo(() => 
        roles.map(role => ({ value: role.id.toString(), label: role.name })),
    [roles]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const isFormValid = formData.firstName && formData.phoneNumber && formData.loginEmail && formData.selectedRole;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) {
            setError("Please fill all required fields.");
            return;
        }
        
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updatedData: any = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phoneNumber: `+${formData.phoneCode}${formData.phoneNumber}`,
            loginEmail: formData.loginEmail,
            roleId: Number(formData.selectedRole),
        };
        
        if (formData.password) {
            updatedData.password = formData.password;
        }

        try {
            await axios.patch(`${import.meta.env.VITE_BASE_URL}/api/users/${id}`, updatedData);
            setSuccess('Changes saved successfully!');
            setFormData(prev => ({...prev, password: ''}));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.response?.data?.message || "An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isAuthLoading || loadingPage) {
        return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
    }

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <button onClick={() => navigate('/users')} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-4">
                    <ArrowLeft size={16} />
                    Back to Users
                </button>

                <form onSubmit={handleSubmit} className="bg-white border border-gray-200/80 rounded-lg p-8">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Edit User Details</h2>
                    
                    {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
                    {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">{success}</div>}
                    
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <FormField label="First Name" required>
                                <input name="firstName" type="text" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg text-sm" />
                            </FormField>
                            <FormField label="Last Name">
                                <input name="lastName" type="text" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg text-sm" />
                            </FormField>
                            <FormField label="Mobile Phone" required>
                                <div className="flex">
                                    <CustomSelect options={[{value: '971', label: '+971'}]} value={formData.phoneCode} onChange={value => setFormData(prev => ({...prev, phoneCode: value}))} placeholder="+971" className="w-24 rounded-r-none" />
                                    <input name="phoneNumber" type="tel" placeholder="50 123 4567" value={formData.phoneNumber} onChange={e => setFormData(prev => ({...prev, phoneNumber: e.target.value.replace(/\D/g, '')}))} className="w-full p-2.5 border border-l-0 rounded-r-lg text-sm" />
                                </div>
                            </FormField>
                            <FormField label="Login Email" required>
                                <input name="loginEmail" type="email" placeholder="Login Email" value={formData.loginEmail} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg text-sm" />
                            </FormField>
                             <FormField label="New Password">
                                <input name="password" type="password" placeholder="Leave blank to keep unchanged" value={formData.password} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg text-sm" />
                            </FormField>
                        </div>
                        <FormField label="Role" required>
                            <CustomSelect options={roleOptions} placeholder="Select a role" value={formData.selectedRole} onChange={value => setFormData(prev => ({...prev, selectedRole: value}))} />
                        </FormField>
                        <div>
                            <button type="submit" disabled={!isFormValid || isSubmitting} className="bg-red-600 text-white font-semibold py-2.5 px-6 rounded-lg transition-all duration-200 enabled:hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed">
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserDetails;