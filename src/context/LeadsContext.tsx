import React, { useState, useCallback, createContext, useContext } from 'react';
import axios from 'axios';

export interface Lead {
    id: number;
    fullName: string;
    mobile: string;
    email: string;
    createdAt: string;
    agent: { name: string };
    type: string;
    propertyType: string;
    status: string;
}

export interface Pagination {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
}

interface LeadsContextType {
    leads: Lead[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
    fetchLeads: (filters: { [key: string]: string | number | boolean }) => void;
}

const LeadsContext = createContext<LeadsContextType | null>(null);

export const LeadsProvider = ({ children }: { children: React.ReactNode }) => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLeads = useCallback(async (filters: { [key: string]: string | number | boolean }) => {
        setLoading(true);
        setError(null);
        try {
            const params: { [key: string]: string | number | boolean } = {};
            
             // direct filters
       if (filters.query) params.query = filters.query;
        if (filters.category) params.category = filters.category;
        if (filters.propertyType) params.propertyType = filters.propertyType;
        if (filters.type) params.type = filters.type;
        if (filters.agentId) params.agentId = filters.agentId;

        // createdAt direct keys for backend support
        if (filters.date_from) {
            params['filter[createdAt][from]'] = filters.date_from;
        }
        if (filters.date_to) {
            params['filter[createdAt][to]'] = filters.date_to;
        }
            
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/agent-opportunities`, { params });

            setLeads(response.data.data);
            setPagination(response.data.pagination);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch leads.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <LeadsContext.Provider value={{ leads, pagination, loading, error, fetchLeads }}>
            {children}
        </LeadsContext.Provider>
    );
};

export const useLeads = () => {
    const context = useContext(LeadsContext);
    if (!context) {
        throw new Error('useLeads must be used within a LeadsProvider');
    }
    return context;
};