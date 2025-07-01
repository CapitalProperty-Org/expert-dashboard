import React, { useState, useEffect } from 'react';
import { Search, FileText, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import PaymentsTable from '../components/dashboard/PaymentsTable';
import { usePayments, PaymentsProvider } from '../context/PaymentsContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useDebounce } from '../hooks/useDebounce';

const PaymentsComponent = () => {
    const { unpaidInvoices, paidInvoices, loading, error, fetchInvoices } = usePayments();
    const [activeTab, setActiveTab] = useState<'unpaid' | 'paid'>('unpaid');
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 500);

    useEffect(() => {
        // افترض أن رقم الحساب ثابت، يمكنك جلبه من AuthContext إذا لزم الأمر
        fetchInvoices('166036', debouncedSearch);
    }, [debouncedSearch, fetchInvoices]);
    
    const invoicesToShow = activeTab === 'unpaid' ? unpaidInvoices : paidInvoices;

    const renderContent = () => {
        if (loading) return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
        if (error) return <div className="text-center text-red-500 py-16">{error}</div>;
        if (invoicesToShow.length === 0) return <div className="text-center text-gray-500 py-16">No invoices found.</div>;
        return <PaymentsTable invoices={invoicesToShow} />;
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="p-4 sm:p-6 md:p-8 space-y-4 lg:space-y-6 bg-gray-50 flex-shrink-0 z-10">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
                    <div className="flex flex-col lg:items-end gap-2">
                        <button className="w-full lg:w-auto bg-white border border-gray-300 text-violet-600 font-semibold py-2 px-4 rounded-md flex items-center justify-center gap-2 text-sm"><Lightbulb size={16} /> Suggest an improvement</button>
                        <Link to="/request-statement"><button className="w-full lg:w-auto bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md flex items-center justify-center gap-2 text-sm"><FileText size={16} /> Request statement</button></Link>
                    </div>
                </div>
                
                <div className="relative w-full lg:max-w-xs">
                    <input type="text" placeholder="Search by contract number" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white pl-4 pr-10 py-2.5 border rounded-lg text-sm" />
                    <button className="absolute inset-y-0 right-0 flex items-center justify-center w-12 border-l bg-gray-50 rounded-r-lg hover:bg-gray-100"><Search size={18} className="text-gray-500" /></button>
                </div>
                
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button onClick={() => setActiveTab('unpaid')} className={cn("whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm", activeTab === 'unpaid' ? "border-violet-500 text-violet-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300")}>
                            Unpaid Invoices ({unpaidInvoices.length})
                        </button>
                        <button onClick={() => setActiveTab('paid')} className={cn("whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm", activeTab === 'paid' ? "border-violet-500 text-violet-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300")}>
                            Paid Invoices ({paidInvoices.length})
                        </button>
                    </nav>
                </div>
            </div>

            <div className="px-4 sm:px-6 md:px-8 flex-grow overflow-y-auto pb-4">
                {renderContent()}
            </div>
        </div>
    );
};

// Wrapper Component لاستخدام الـ Provider
const Payments = () => (
    <PaymentsProvider>
        <PaymentsComponent />
    </PaymentsProvider>
);

export default Payments;