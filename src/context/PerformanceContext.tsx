import React, { useState, useCallback, createContext, useContext } from 'react';
import axios from 'axios';

// تعريف الواجهات
export interface OverviewStats {
    leads: number;
    live_listings: number;
    published_listings: number;
    listings_clicks: number;
    listings_impressions: number;
    credits_spent: number;
    lpl: number; // Leads Per Listing
    [key: string]: any; // للسماح بالوصول الديناميكي
}

interface PerformanceContextType {
    stats: OverviewStats | null;
    loading: boolean;
    error: string | null;
    fetchStats: (filters: { [key: string]: any }) => void;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

export const PerformanceProvider = ({ children }: { children: React.ReactNode }) => {
    const [stats, setStats] = useState<OverviewStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async (filters: { [key: string]: any }) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams(filters);
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/overview`, { params });
            setStats(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to fetch overview stats.");
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <PerformanceContext.Provider value={{ stats, loading, error, fetchStats }}>
            {children}
        </PerformanceContext.Provider>
    );
};

export const usePerformance = () => {
    const context = useContext(PerformanceContext);
    if (!context) {
        throw new Error('usePerformance must be used within a PerformanceProvider');
    }
    return context;
};