import React, { useState, useCallback, createContext, useContext } from 'react';
import axios from 'axios';

// تعريف الواجهات
export interface AgentData {
    agent_id: string;
    agent_name: string;
    profile_url: string;
    verification: number; // 0 or 1
    propertiesBlacklistedCount: number;
    attendedEnquiriesPercent: number;
    propertiesLiveCount: number;
    leadsCount: number;
    transactionsCount: number;
    ratingAverage: number;
    responseRate: number;
}

export interface Criterion {
    metricName: string;
    target: {
        rule: string;
        value: string;
        valueMin?: string;
        valueMax?: string;
    };
}

interface AgentInsightsContextType {
    agentsData: AgentData[];
    criteria: Criterion[];
    pagination: any;
    loading: boolean;
    error: string | null;
    fetchAgentStats: (filters: { [key: string]: any }) => void;
}

const AgentInsightsContext = createContext<AgentInsightsContextType | null>(null);

export const AgentInsightsProvider = ({ children }: { children: React.ReactNode }) => {
    const [agentsData, setAgentsData] = useState<AgentData[]>([]);
    const [criteria, setCriteria] = useState<Criterion[]>([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAgentStats = useCallback(async (filters: { [key: string]: any }) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams(filters);
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/agent-stats/agents`, { params });
            setAgentsData(response.data.data || []);
            setCriteria(response.data.criteria || []);
            setPagination(response.data.pagination || null);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to fetch agent stats.");
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <AgentInsightsContext.Provider value={{ agentsData, criteria, pagination, loading, error, fetchAgentStats }}>
            {children}
        </AgentInsightsContext.Provider>
    );
};

export const useAgentInsights = () => {
    const context = useContext(AgentInsightsContext);
    if (!context) {
        throw new Error('useAgentInsights must be used within an AgentInsightsProvider');
    }
    return context;
};