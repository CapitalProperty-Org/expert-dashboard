import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

interface PasswordStepProps {
  email: string;
  onBack: () => void;
}

const PasswordStep = ({ email, onBack }: PasswordStepProps) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            await login(email, password);
            navigate('/');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Enter password</h2>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={email} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500" readOnly />
                </div>
                <div>
                    <div className="flex justify-between items-center mb-1">
                         <label className="block text-sm font-medium text-gray-700">Password</label>
                         <a href="#" className="text-sm text-violet-600 hover:underline">Forgot Password</a>
                    </div>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" required />
                </div>
                
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex items-center gap-4 pt-2">
                    <button type="button" onClick={onBack} className="p-3 text-gray-600 hover:text-gray-900" disabled={isSubmitting}>
                        <ArrowLeft />
                    </button>
                    <button type="submit" className="w-full bg-red-500 text-white font-semibold py-3 rounded-lg disabled:bg-red-300" disabled={!password || isSubmitting}>
                        {isSubmitting ? 'Signing In...' : 'Sign In'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PasswordStep;