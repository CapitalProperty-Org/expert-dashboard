import  { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import AgentListEmptyState from '../components/dashboard/AgentListEmptyState';
import { AgentInsightsProvider, useAgentInsights } from '../context/AgentInsightsContext';
import AgentRow from '../components/dashboard/AgentRow';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useDebounce } from '../hooks/useDebounce';

const tableHeaders = [
    "Agent", "Verified", "Non-Compliant Properties", "Attended Enquiries",
    "Live Properties", "Leads", "Transactions", "Avg. Rating", "Response Rate"
];

const AgentInsightsComponent = () => {
    const { agentsData, criteria, loading, error, fetchAgentStats } = useAgentInsights();
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 500);

    useEffect(() => {
        fetchAgentStats({ query: debouncedSearch });
    }, [debouncedSearch, fetchAgentStats]);

    const renderContent = () => {
        if (loading) return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
        if (error) return <div className="text-center text-red-500 py-16">{error}</div>;
        if (agentsData.length === 0) return <AgentListEmptyState />;
        
        return agentsData.map(agent => <AgentRow key={agent.agent_id} agent={agent} criteria={criteria} />);
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Agent Insights</h1>
            <div className="bg-gray-100 p-3 rounded-md text-sm">
                <p className="text-gray-700"><strong>SuperAgent Report</strong> <a href="#" className="text-blue-600 underline">Learn more about SuperAgent criteria</a></p>
                <p className="text-xs text-gray-500 mt-1">Data for the previous day</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 flex justify-end border-b border-gray-200">
                    <div className="relative w-full max-w-xs">
                        <input type="text" placeholder="Search by agent name" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-4 pr-10 py-2 border rounded-md" />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"><Search size={18} /></div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <div className="grid grid-cols-9 min-w-[1000px] bg-gray-50/50">
                        {tableHeaders.map((header, index) => (
                            <div key={header} className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase ${index === 0 ? 'col-span-1 text-left' : 'text-center'}`}>
                                {header}
                            </div>
                        ))}
                    </div>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

const AgentInsights = () => (
    <AgentInsightsProvider>
        <AgentInsightsComponent />
    </AgentInsightsProvider>
);

export default AgentInsights;