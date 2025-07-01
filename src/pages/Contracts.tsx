import React, { useState, useEffect } from 'react';
import { Search, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import ContractsTable from '../components/dashboard/ContractsTable';
import { useContracts, ContractsProvider } from '../context/ContractsContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useDebounce } from '../hooks/useDebounce';

const ContractsComponent = () => {
    const { contracts, loading, error, fetchContracts } = useContracts();
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 500);

    useEffect(() => {
        // افترض أن رقم الحساب ثابت، يمكنك جلبه من AuthContext
        fetchContracts('11441', debouncedSearch);
    }, [debouncedSearch, fetchContracts]);
    
    const renderContent = () => {
        if (loading) return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
        if (error) return <div className="text-center text-red-500 py-16">{error}</div>;
        if (contracts.length === 0) return <div className="text-center text-gray-500 py-16">No contracts found.</div>;
        return <ContractsTable contracts={contracts} />;
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="p-4 sm:p-6 md:p-8 space-y-4 lg:space-y-6 bg-gray-50 flex-shrink-0 z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <h1 className="text-2xl font-bold text-gray-800">Contracts</h1>
                    <Link to="/request-statement">
                        <button className="w-full lg:w-auto bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md flex items-center justify-center gap-2 text-sm">
                            <FileText size={16} /> Request statement
                        </button>
                    </Link>
                </div>
                
                <div className="relative w-full lg:max-w-xs">
                    <input type="text" placeholder="Search by contract number" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white pl-4 pr-10 py-2.5 border rounded-lg text-sm" />
                    <button className="absolute inset-y-0 right-0 flex items-center justify-center w-12 border-l bg-gray-50 rounded-r-lg hover:bg-gray-100">
                      <Search size={18} className="text-gray-500" />
                    </button>
                </div>
            </div>

            <div className="px-4 sm:px-6 md:px-8 flex-grow overflow-y-auto pb-4">
                {renderContent()}
            </div>
        </div>
    );
};

// Wrapper Component لاستخدام الـ Provider
const Contracts = () => (
    <ContractsProvider>
        <ContractsComponent />
    </ContractsProvider>
);

export default Contracts;