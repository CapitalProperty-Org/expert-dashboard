import React, { useState, useCallback, createContext, useContext } from 'react';
import axios from 'axios';

// تعريف الواجهات
export interface Invoice {
    id: string;
    sf_contract_id: string;
    payment_frequency: string;
    payment_method: string;
    due_date: string;
    status: string;
    amount: string;
}

interface PaymentsContextType {
    unpaidInvoices: Invoice[];
    paidInvoices: Invoice[];
    loading: boolean;
    error: string | null;
    fetchInvoices: (accountNumber: string, contractNumber?: string) => void;
}

const PaymentsContext = createContext<PaymentsContextType | null>(null);

export const PaymentsProvider = ({ children }: { children: React.ReactNode }) => {
    const [unpaidInvoices, setUnpaidInvoices] = useState<Invoice[]>([]);
    const [paidInvoices, setPaidInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchInvoices = useCallback(async (accountNumber: string, contractNumber?: string) => {
        setLoading(true);
        setError(null);
        try {
            const params: any = { sf_account_number: accountNumber };
            if (contractNumber) {
                params.sf_contract_id = contractNumber;
            }

            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/contracts/invoices`, { params });
            const allInvoices: Invoice[] = response.data.invoices || [];

            // تقسيم الفواتير إلى مدفوعة وغير مدفوعة
            const paid = allInvoices.filter(inv => inv.status.toLowerCase() === 'payment completed');
            const unpaid = allInvoices.filter(inv => inv.status.toLowerCase() !== 'payment completed');

            setPaidInvoices(paid);
            setUnpaidInvoices(unpaid);

        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to fetch invoices.");
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <PaymentsContext.Provider value={{ unpaidInvoices, paidInvoices, loading, error, fetchInvoices }}>
            {children}
        </PaymentsContext.Provider>
    );
};

export const usePayments = () => {
    const context = useContext(PaymentsContext);
    if (!context) {
        throw new Error('usePayments must be used within a PaymentsProvider');
    }
    return context;
};