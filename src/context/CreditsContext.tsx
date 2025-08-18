import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { creditService, type ICreditTransaction, type ICreditFilters, type ICreditBalance } from '../services/creditService';
import axios from 'axios';

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
  const [transactions, setTransactions] = useState<ICreditTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<ICreditTransaction[]>([]);
  const [balance, setBalance] = useState<ICreditBalance>({ current: 0, earned: 0, spent: 0, expired: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [filters, setFiltersState] = useState<ICreditFilters>({});

  // جلب customer_id من endpoint الـ me
  const fetchCustomerId = useCallback(async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/users/me`);
      const userId = response.data.id || response.data.user_id;
      if (userId) {
        setCustomerId(parseInt(userId.toString()));
        // تحديث الفلاتر مع customer_id الجديد
        setFiltersState(prev => ({ ...prev, customer_id: parseInt(userId.toString()) }));
      }
    } catch (err) {
      console.error('Error fetching customer ID:', err);
      // fallback إلى customer_id افتراضي
      setCustomerId(6);
      setFiltersState(prev => ({ ...prev, customer_id: 6 }));
    }
  }, []);

  // جلب البيانات من API واحد
  const fetchTransactions = useCallback(async () => {
    if (!customerId) return; // لا نجلب البيانات بدون customer_id
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await creditService.getCreditTransactions({
        ...filters,
        customer_id: customerId
      });
      
      setTransactions(response.data);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transactions';
      setError(errorMessage);
      console.error('❌ Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, customerId]);

  // فلترة البيانات عند تغيير الفلاتر
  useEffect(() => {
    if (!customerId) return; // لا نفلتر بدون customer_id
    
    const filtered = creditService.filterTransactions(transactions, filters);
    setFilteredTransactions(filtered);
    
    // حساب الرصيد من البيانات المفلترة
    const newBalance = creditService.calculateBalance(filtered);
    setBalance(newBalance);
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
    await fetchTransactions();
  }, [fetchTransactions]);

  // مسح الأخطاء
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // جلب customer_id عند التحميل
  useEffect(() => {
    fetchCustomerId();
  }, [fetchCustomerId]);

  // جلب البيانات بعد الحصول على customer_id
  useEffect(() => {
    if (customerId) {
      fetchTransactions();
    }
  }, [customerId, fetchTransactions]);

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
