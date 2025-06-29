import React from 'react';
import { Search } from 'lucide-react';

const NoResultsFound = () => {
    return (
        <div className="flex-grow flex flex-col items-center justify-center text-center">
            <div className="p-4 bg-gray-100 rounded-full">
                <Search size={32} className="text-gray-400" />
            </div>
            <p className="mt-4 font-semibold text-gray-600">No results found</p>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
        </div>
    );
};

export default NoResultsFound;