import React, { useState, useCallback, createContext, useContext } from 'react';
import axios from 'axios';

// تعريف الواجهات - محدثة لتتوافق مع الـ backend
export interface OverviewStats {
  number_of_days: number;
  leads: number;
  leads_featured: number;
  leads_premium: number;
  leads_standard: number;
  live_listings: number;
  live_listings_featured: number;
  live_listings_premium: number;
  live_listings_standard: number;
  published_listings: number;
  published_listings_featured: number;
  published_listings_premium: number;
  published_listings_standard: number;
  listings_clicks: number;
  listings_clicks_featured: number;
  listings_clicks_premium: number;
  listings_clicks_standard: number;
  listings_impressions: number;
  listings_impressions_featured: number;
  listings_impressions_premium: number;
  listings_impressions_standard: number;
  credits_spent: number;
  credits_spent_featured: number;
  credits_spent_premium: number;
  credits_spent_standard: number;
  lpl: number;
  lpl_featured: number;
  lpl_premium: number;
  lpl_standard: number;
  ctr: number;
  [key: string]: number; // للسماح بالوصول الديناميكي
}

interface PerformanceContextType {
    stats: OverviewStats | null;
    loading: boolean;
    error: string | null;
    fetchStats: (filters: { [key: string]: string | number | boolean }) => void;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

export const PerformanceProvider = ({ children }: { children: React.ReactNode }) => {
    const [stats, setStats] = useState<OverviewStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async (filters: { [key: string]: string | number | boolean }) => {
        setLoading(true);
        setError(null);
        try {
            // تحويل الفلاتر لتتوافق مع الـ backend
            const backendFilters: Record<string, string> = {
                category: filters.category === 'residential' ? 'residential' : 
                         filters.category === 'commercial' ? 'commercial' : 'all',
                property_type: filters.property_type === 'all' ? 'all' : String(filters.property_type),
                offeringType: filters.offering_type === 'rent' ? 'rent' : 
                             filters.offering_type === 'sale' ? 'sale' : 'rent_and_sale',
                location: filters.location === 'all' ? 'all' : String(filters.location),
                dateRange: filters.date_range === '7d' ? '7' : 
                           filters.date_range === '90d' ? '90' : '30'
            };

            console.log('Frontend filters:', filters);
            console.log('Backend filters:', backendFilters);

            const params = new URLSearchParams(backendFilters);
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/overview`, { params });
            setStats(response.data as OverviewStats);
        } catch {
            setError("Failed to fetch overview stats.");
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