import React, { useState, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomSelect from '../components/ui/CustomSelect';
import { useAuth } from '../context/AuthContext';

const FormField = ({ label, children, required = false }: { label: string, children: React.ReactNode, required?: boolean }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

const AddNewUser = () => {
    const navigate = useNavigate();
    const { roles } = useAuth(); 
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneCode, setPhoneCode] = useState('971');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loginEmail, setLoginEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const roleOptions = useMemo(() => 
        roles.map(role => ({ value: role.id.toString(), label: role.name })),
    [roles]);

    const isFormValid = firstName && phoneNumber && loginEmail && password && selectedRole;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) {
            setError("Please fill all required fields.");
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        const fullPhoneNumber = `+${phoneCode}${phoneNumber}`;

        const userData = {
            firstName,
            lastName,
            phoneNumber: fullPhoneNumber,
            loginEmail,
            roleId: Number(selectedRole),
            password,
        };

        try {
            await axios.post(`${import.meta.env.VITE_BASE_URL}/api/users`, userData);
            setSuccess('User created successfully! Redirecting...');
            
            setFirstName('');
            setLastName('');
            setPhoneNumber('');
            setLoginEmail('');
            setPassword('');
            setSelectedRole(null);

            setTimeout(() => navigate('/users'), 2000); 

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "An unexpected error occurred.";
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <div className="  space-y-6">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-4">
                    <ArrowLeft size={16} />
                    Back
                </button>

                <form onSubmit={handleSubmit} className="bg-white border border-gray-200/80 rounded-lg p-8">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Add a New User</h2>
                    
                    {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
                    {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">{success}</div>}
                    
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <FormField label="First Name" required>
                                <input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" />
                            </FormField>
                            <FormField label="Last Name">
                                <input type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" />
                            </FormField>
                            <FormField label="Mobile Phone" required>
                                <div className="flex">
                                    <CustomSelect 
                                        options={[{value: '971', label: '+971'}]}
                                        value={phoneCode}
                                        onChange={setPhoneCode}
                                        placeholder="+971"
                                        className="w-24 rounded-r-none"
                                    />
                                    <input type="tel" placeholder="50 123 4567" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))} className="w-full p-2.5 border border-l-0 rounded-r-lg text-sm" />
                                </div>
                            </FormField>
                            <FormField label="Login Email" required>
                                <input type="email" placeholder="Login Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" />
                            </FormField>
                             <FormField label="Password" required>
                                <input type="password" placeholder="Set a password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" />
                            </FormField>
                        </div>
                        <FormField label="Role" required>
                            <CustomSelect options={roleOptions} placeholder="Select a role" value={selectedRole || ''} onChange={setSelectedRole} />
                        </FormField>
                        <div>
                            <button 
                                type="submit"
                                disabled={!isFormValid || isSubmitting}
                                className="bg-red-600 text-white font-semibold py-2.5 px-6 rounded-lg transition-all duration-200 enabled:hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Sending...' : 'Send invitation'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddNewUser;