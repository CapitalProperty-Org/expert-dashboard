import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import ErrorToast from '../../ui/ErrorToast';

const GoogleLoginButton = () => {
    const [showErrorToast, setShowErrorToast] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const loginGoogle = useGoogleLogin({
        flow: 'auth-code',
        onSuccess: async (codeResponse) => {
            try {
                // Send code to backend
                const { data } = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/auth/google`, {
                    code: codeResponse.code,
                });

                if (data.token) {
                    localStorage.setItem('token', data.token);
                    window.location.href = '/dashboard';
                }
            } catch (error: any) {
                console.error('Google Login Failed', error);
                const errorMessage = error.response?.data?.message || error.message || 'Google Login Failed';
                setErrorMessage(`Login Failed: ${errorMessage}`);
                setShowErrorToast(true);
            }
        },
        onError: (errorResponse) => {
            console.error('Google Login Failed', errorResponse);
        },
    });

    return (
        <>
            <button
                type="button"
                onClick={() => loginGoogle()}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-4"
            >
                <img
                    className="h-5 w-5 mr-2"
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google logo"
                />
                Continue with Google
            </button>
            {showErrorToast && (
                <ErrorToast
                    show={showErrorToast}
                    message={errorMessage}
                    onClose={() => setShowErrorToast(false)}
                />
            )}
        </>
    );
};

export default GoogleLoginButton;
