import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import TransactionsEmptyState from '../components/dashboard/TransactionsEmptyState';
import { Link } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface Transaction {
    id: string;
    agent: { name: string; photo: string };
    listingDetails: { title: string; location: string; reference: string; image: string };
    transactionValue: string;
    claimedOn: string;
    status: string;
}

const Transactions = () => {
    const [activeTab, setActiveTab] = useState('transactions');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasData, setHasData] = useState(false);

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/transactions`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { tab: activeTab }
                });
                setTransactions(data);
                setHasData(data.length > 0);
            } catch (error) {
                console.error('Failed to fetch transactions', error);
                setTransactions([]);
                setHasData(false);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [activeTab]);

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
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12">
                                            <div className="flex items-center justify-center">
                                                <LoadingSpinner />
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <img className="h-8 w-8 rounded-full object-cover mr-3" src={tx.agent.photo} alt={tx.agent.name} />
                                                    <div className="text-sm font-medium text-gray-900">{tx.agent.name}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <img className="h-10 w-10 rounded object-cover mr-3" src={tx.listingDetails.image || 'https://via.placeholder.com/50'} alt="Listing" />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{tx.listingDetails.title}</div>
                                                        <div className="text-xs text-gray-500">{tx.listingDetails.reference}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {tx.transactionValue}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {tx.claimedOn}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    {tx.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Empty State will be shown here */}
                    {!loading && !hasData && (
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