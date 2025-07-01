import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import TransactionsEmptyState from '../components/dashboard/TransactionsEmptyState';
import { Link } from 'react-router-dom';

const Transactions = () => {
    const [activeTab, setActiveTab] = useState('transactions');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [hasData, _setHasData] = useState(false); // Set to true to see a table later

    const tabs = ['Transactions', 'Approved', 'Pending', 'Rejected'];
    const tableHeaders = ["Agent", "Listing Details", "Transaction Value", "Claimed On", "Status"];

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Header Section (Non-scrollable) */}
            <div className="p-4 sm:p-6 md:p-8 space-y-4 lg:space-y-6 bg-gray-50 flex-shrink-0 z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
                    <Link to="/claim-transaction">
                           <button className="w-full lg:w-auto bg-red-600 text-white font-semibold py-3 lg:py-2 px-4 rounded-md flex items-center justify-center gap-2 text-sm">
                        <Plus size={16} />
                        Claim Transaction
                    </button>
                    </Link>
             
                </div>

                <div className="relative w-full lg:max-w-xs">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Agent name" className="w-full bg-white pl-10 pr-4 py-2.5 border rounded-lg text-sm" />
                </div>

                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab.toLowerCase())}
                                className={cn(
                                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                                    activeTab === tab.toLowerCase()
                                        ? 'border-violet-500 text-violet-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Content Section (Scrollable) */}
            <div className="px-4 sm:px-6 md:px-8 flex-grow overflow-y-auto pb-4">
                <div className="w-full bg-white border border-gray-200/80 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full w-full">
                            <thead>
                                <tr className="border-b border-gray-200/80 bg-gray-50/50">
                                    {tableHeaders.map((header) => (
                                        <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                        </table>
                    </div>
                    {/* Empty State will be shown here */}
                    {!hasData && (
                        <div className="flex items-center justify-center">
                            <TransactionsEmptyState />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Transactions;