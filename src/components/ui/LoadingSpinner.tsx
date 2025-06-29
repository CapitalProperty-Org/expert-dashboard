import React from 'react';

const LoadingSpinner = () => {
    return (
        <div className="flex-grow flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-t-violet-600 border-solid border-gray-200 rounded-full animate-spin"></div>
        </div>
    );
};

export default LoadingSpinner;