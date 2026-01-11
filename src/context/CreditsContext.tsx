import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { creditService, type ICreditTransaction, type ICreditFilters, type ICreditBalance } from '../services/creditService';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface CreditsContextType {
  transactions: ICreditTransaction[];
  filteredTransactions: ICreditTransaction[];
  balance: ICreditBalance;
  loading: boolean;
  error: string | null;
  filters: ICreditFilters;
  setFilters: (filters: ICreditFilters) => void;
  fetchTransactions: () => Promise<void>;
  exportTransactions: () => void;
  refreshData: () => Promise<void>;
  clearError: () => void;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export const useCredits = () => {
  const context = useContext(CreditsContext);
  if (!context) {
    throw new Error('useCredits must be used within a CreditsProvider');
  }
  return context;
};

interface CreditsProviderProps {
  children: React.ReactNode;
}

export const CreditsProvider: React.FC<CreditsProviderProps> = ({ children }) => {
  const { token, user } = useAuth();
  const [transactions, setTransactions] = useState<ICreditTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<ICreditTransaction[]>([]);
  const [balance, setBalance] = useState<ICreditBalance>({ current: 0, earned: 0, spent: 0, expired: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [filters, setFiltersState] = useState<ICreditFilters>({});

  // Sync customerId from user context
  useEffect(() => {
    if (user?.id) {
      const id = parseInt(user.id.toString());
      setCustomerId(id);
      setFiltersState(prev => ({ ...prev, customer_id: id }));
    }
  }, [user]);

  const fetchBalance = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/credits/my-multi-balance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { remaining_credits, total_credits, used_credits } = response.data;
      setBalance({
        current: remaining_credits,
        earned: total_credits,
        spent: used_credits,
        expired: 0 // API doesn't return this yet
      });
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  }, [token]);

  // جلب البيانات من API واحد
  const fetchTransactions = useCallback(async () => {
    if (!customerId || !token) return; // لا نجلب البيانات بدون customer_id

    try {
      setLoading(true);
      setError(null);

      // Fetch transactions independently
      const transactionsResponse = await creditService.getCreditTransactions({
        ...filters,
        customer_id: customerId
      });

      setTransactions(transactionsResponse.data);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transactions';
      setError(errorMessage);
      console.error('❌ Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, customerId, token]);

  // فلترة البيانات عند تغيير الفلاتر
  useEffect(() => {
    if (!customerId) return; // لا نفلتر بدون customer_id

    const filtered = creditService.filterTransactions(transactions, filters);
    setFilteredTransactions(filtered);
  }, [transactions, filters, customerId]);

  // تحديث الفلاتر
  const setFilters = useCallback((newFilters: ICreditFilters) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  // تصدير البيانات
  const exportTransactions = useCallback(() => {
    creditService.exportTransactions(filteredTransactions);
  }, [filteredTransactions]);

  // تحديث البيانات
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchTransactions(),
      fetchBalance()
    ]);
  }, [fetchTransactions, fetchBalance]);

  // مسح الأخطاء
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // جلب البيانات عند التحميل او تغيير التوكن
  useEffect(() => {
    if (token) {
      fetchBalance();
    }
  }, [fetchBalance, token]);

  // جلب البيانات بعد الحصول على customer_id
  useEffect(() => {
    if (customerId && token) {
      fetchTransactions();
    }
  }, [customerId, fetchTransactions, token]);

  const value: CreditsContextType = {
    transactions,
    filteredTransactions,
    balance,
    loading,
    error,
    filters,
    setFilters,
    fetchTransactions,
    exportTransactions,
    refreshData,
    clearError,
  };

  return (
    <CreditsContext.Provider value={value}>
      {children}
    </CreditsContext.Provider>
  );
};
