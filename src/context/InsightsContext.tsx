import React, { useState, useCallback, createContext, useContext } from 'react';
import axios from 'axios';


export interface LeadsInsightsData {
    total_whatsapp_count: number;
    total_whatsapp_rate: number;
    total_calls_count: number;
    total_calls_rate: number;
    total_email_count: number;
    total_email_rate: number;
    total_leads: number;
    data: any[]; 
}

export interface WhatsAppInsightsData {
    total_enquiries: number;
    total_enquiries_change: number;
    total_response_rate: number;
    total_response_rate_change: number;
    total_replied_count: number;
    total_not_replied_count: number;
    total_response_time: number;
    data: any[];
}

export interface CallsInsightsData {
    total_count: number;
    total_count_change: number;
    total_answered_rate: number;
    total_answered_rate_change: number;
    total_answered_count: number;
    total_unanswered_rate: number;
    total_unanswered_count: number;
    total_canceled_rate: number;
    total_canceled_count: number;
    total_voicemail_rate: number;
    total_voicemail_count: number;
    data: any[];
}

interface DayHourData {
    [key: string]: { [key: string]: number };
}

interface InsightsContextType {
    leadsInsights: LeadsInsightsData | null;
    whatsAppInsights: WhatsAppInsightsData | null;
    callsInsights: CallsInsightsData | null;
    whatsAppDaily: DayHourData | null;
    whatsappHourly: DayHourData | null; 
    callsDaily: DayHourData | null;
    callsHourly: DayHourData | null;
    loading: boolean;
    error: string | null;
    fetchInsights: (dateFilter: string) => void;
}

  interface InsightsContextType {
    leadsInsights: LeadsInsightsData | null;
    whatsAppInsights: WhatsAppInsightsData | null;
    callsInsights: CallsInsightsData | null;
    whatsAppDaily: DayHourData | null;
    whatsAppHourly: DayHourData | null;
    callsDaily: DayHourData | null;
    callsHourly: DayHourData | null;
    loading: boolean;
    error: string | null;
    fetchInsights: (dateFilter: string) => void;
}



const InsightsContext = createContext<InsightsContextType | null>(null);

export const InsightsProvider = ({ children }: { children: React.ReactNode }) => {
   const [leadsInsights, setLeadsInsights] = useState<LeadsInsightsData | null>(null);
    const [whatsAppInsights, setWhatsAppInsights] = useState<WhatsAppInsightsData | null>(null);
    const [callsInsights, setCallsInsights] = useState<CallsInsightsData | null>(null);
    const [whatsAppDaily, setWhatsAppDaily] = useState<DayHourData | null>(null);
    const [whatsappHourly, setWhatsappHourly] = useState<DayHourData | null>(null); // <-- تم التصحيح هنا
    const [callsDaily, setCallsDaily] = useState<DayHourData | null>(null);
    const [callsHourly, setCallsHourly] = useState<DayHourData | null>(null); // <-- تم التصحيح هنا
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

     const fetchInsights = useCallback(async (dateFilter: string) => {
        setLoading(true);
        setError(null);
        const baseUrl = import.meta.env.VITE_BASE_URL;
        try {
            const [
                leadsRes, whatsAppRes, callsRes, 
                whatsAppDailyRes, whatsAppHourlyRes, 
                callsDailyRes, callsHourlyRes
            ] = await Promise.all([
                axios.get(`${baseUrl}/api/stats/leads-insights`, { params: { period: dateFilter } }),
                axios.get(`${baseUrl}/api/stats/whatsapp-insights`, { params: { period: dateFilter } }),
                axios.get(`${baseUrl}/api/stats/calls-insights`, { params: { period: dateFilter } }),
                axios.get(`${baseUrl}/api/stats/whatsapp-insights-daily`, { params: { period: dateFilter } }),
                axios.get(`${baseUrl}/api/stats/whatsapp-insights-hourly`, { params: { period: dateFilter } }),
                axios.get(`${baseUrl}/api/stats/calls-insights-daily`, { params: { period: dateFilter } }),
                axios.get(`${baseUrl}/api/stats/calls-insights-hourly`, { params: { period: dateFilter } }),
            ]);

            setLeadsInsights(leadsRes.data);
            setWhatsAppInsights(whatsAppRes.data);
            setCallsInsights(callsRes.data);
            setWhatsAppDaily(whatsAppDailyRes.data);
            setWhatsappHourly(whatsAppHourlyRes.data); // <-- تم التصحيح هنا
            setCallsDaily(callsDailyRes.data);
            setCallsHourly(callsHourlyRes.data); // <-- تم التصحيح هنا

        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to fetch insights data.");
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <InsightsContext.Provider value={{ 
            leadsInsights, whatsAppInsights, callsInsights, 
            whatsAppDaily, whatsappHourly, callsDaily, callsHourly,
            loading, error, fetchInsights 
        }}>
            {children}
        </InsightsContext.Provider>
    );
};

export const useInsights = () => {
    const context = useContext(InsightsContext);
    if (!context) {
        throw new Error('useInsights must be used within a InsightsProvider');
    }
    return context;
};