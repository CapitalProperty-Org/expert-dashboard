import React from 'react';
import AgentInsightsTable from '../components/agent-insights/AgentInsightsTable';
import { AgentInsightsProvider } from '../context/AgentInsightsContext';

const AgentInsights = () => {
    return (
        <AgentInsightsProvider>
            <div className="p-6 space-y-6 bg-white min-h-screen">
                <h1 className="text-2xl font-bold text-gray-800">Agent Insights</h1>
                <AgentInsightsTable />
            </div>
        </AgentInsightsProvider>
    );
};

export default AgentInsights;