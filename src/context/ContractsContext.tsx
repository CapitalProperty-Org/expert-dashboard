import React, { useState, useCallback, createContext, useContext } from 'react';
import axios from 'axios';

// تعريف الواجهات
export interface Product {
    name: string;
}

export interface Contract {
    id: string;
    products: Product[];
    start_date: string;
    end_date: string;
    gross_amount: string;
    discount: string;
    net_cost: string;
    payment_mode: string;
    signed_by: string;
    status: string;
}

interface ContractsContextType {
    contracts: Contract[];
    loading: boolean;
    error: string | null;
    fetchContracts: (accountNumber: string, contractNumber?: string) => void;
}

const ContractsContext = createContext<ContractsContextType | null>(null);

export const ContractsProvider = ({ children }: { children: React.ReactNode }) => {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchContracts = useCallback(async (accountNumber: string, contractNumber?: string) => {
        setLoading(true);
        setError(null);
        try {
            // بناء الـ params كما يتوقعها الباك إند
            const params = new URLSearchParams();
            params.append('sf_account_number', accountNumber);
            ['signed', 'active', 'on_hold', 'suspended', 'replaced'].forEach(s => params.append('status', s));
            
            if (contractNumber) {
                // الباك إند قد لا يدعم البحث المباشر، لكننا نجهزه
                params.append('contract_number', contractNumber);
            }

            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/contracts`, { params });
            setContracts(response.data.data || []);

        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to fetch contracts.");
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <ContractsContext.Provider value={{ contracts, loading, error, fetchContracts }}>
            {children}
        </ContractsContext.Provider>
    );
};

export const useContracts = () => {
    const context = useContext(ContractsContext);
    if (!context) {
        throw new Error('useContracts must be used within a ContractsProvider');
    }
    return context;
};