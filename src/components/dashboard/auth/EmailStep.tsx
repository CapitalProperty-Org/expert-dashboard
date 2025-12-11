import { Check } from 'lucide-react';
import { useState } from 'react';
import GoogleIcon from './GoogleIcon';

interface EmailStepProps {
  onNext: (email: string) => void;
}

const EmailStep = ({ onNext }: EmailStepProps) => {
    const [email, setEmail] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email && acceptedTerms) {
            onNext(email);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Welcome back!</h2>
                <p className="text-sm text-gray-500 mt-1">Provide your email address.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" required />
                </div>
                <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setAcceptedTerms(!acceptedTerms)} className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${acceptedTerms ? 'bg-violet-600 border-violet-600' : 'border-gray-300'}`}>
                        {acceptedTerms && <Check size={14} className="text-white" />}
                    </button>
                    <p className="text-sm text-gray-600">I acknowledge and accept the <a href="#" className="text-violet-600 underline">Terms&Conditions</a></p>
                </div>
                <button type="submit" disabled={!email || !acceptedTerms} className="w-full bg-red-500 text-white font-semibold py-3 rounded-lg disabled:bg-red-300">
                    Next
                </button>
            </form>
            <div className="relative flex items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-sm text-gray-400">or</span>
                <div className="flex-grow border-t border-gray-200"></div>
            </div>
            <button className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-200">
                <GoogleIcon />
                Log in using Google Account
            </button>
        </div>
    );
};

export default EmailStep;