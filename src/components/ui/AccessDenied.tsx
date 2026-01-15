import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AccessDeniedProps {
    message?: string;
    onGoBack?: () => void;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ message, onGoBack }) => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        if (onGoBack) {
            onGoBack();
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
            <div className="bg-violet-50 p-4 rounded-full mb-6 relative">
                <ShieldAlert size={64} className="text-violet-600" />
                <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-3">Access Denied</h2>

            <p className="text-gray-500 max-w-md mb-8 text-lg leading-relaxed">
                {message || "Sorry, it looks like you don't have permission to view this page. Please contact your administrator or return to the dashboard."}
            </p>

            <button
                onClick={handleGoBack}
                className="px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
            >
                Go Back to Dashboard
            </button>
        </div>
    );
};

export default AccessDenied;
