import axios from 'axios';

export interface ICreditTransaction {
  id: string;
  customer_id: number;
  created_at: string;
  credit_info: {
    action: 'add' | 'subtract' | 'clear' | 'deduct';
    amount: string;
    balance: number;
  };
  description: string;
  transaction_type: 'credit_addition' | 'credit_usage' | 'credit_expiry' | 'credit_deduction';
  reference_id?: string;
  reference_type?: 'listing' | 'feature' | 'subscription' | 'manual' | 'system' | 'promotion';
  metadata?: Record<string, any>;
}

export interface ICreditTransactionResponse {
  data: ICreditTransaction[];
  meta: {
    total: number;
    offset: number;
    limit: number;
    has_more: boolean;
  };
}

export interface ICreditFilters {
  customer_id?: number;
  action?: 'add' | 'subtract' | 'clear' | 'deduct';
  transaction_type?: 'credit_addition' | 'credit_usage' | 'credit_expiry' | 'credit_deduction';
  created_at_from?: string;
  created_at_to?: string;
  reference_id?: string;
  reference_type?: string;
}

export interface ICreditBalance {
  current: number;
  earned: number;
  spent: number;
  expired: number;
}

class CreditService {
  private baseURL = import.meta.env.VITE_BASE_URL;

  // API واحد يجيب كل البيانات
  async getCreditTransactions(filters?: ICreditFilters): Promise<ICreditTransactionResponse> {
    try {
      const response = await axios.get(`${this.baseURL}/api/credits/transactions`, {
        params: {
          customer_id: filters?.customer_id || 6, // default customer
          limit: 1000 // نجيب كل البيانات
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching credit transactions:', error);
      throw error;
    }
  }

  // حساب الرصيد من البيانات المحلية
  calculateBalance(transactions: ICreditTransaction[]): ICreditBalance {
    return transactions.reduce((balance, transaction) => {
      const { action, amount } = transaction.credit_info;
      const amountValue = parseInt(amount.replace(/[+-]/, ''));
      
      switch (action) {
        case 'add':
          balance.earned += amountValue;
          balance.current += amountValue;
          break;
        case 'subtract':
        case 'deduct':
          balance.spent += amountValue;
          balance.current -= amountValue;
          break;
        case 'clear':
          balance.expired += amountValue;
          balance.current -= amountValue;
          break;
      }
      
      return balance;
    }, { current: 0, earned: 0, spent: 0, expired: 0 });
  }

  // فلترة البيانات محلياً
  filterTransactions(
    transactions: ICreditTransaction[], 
    filters: ICreditFilters
  ): ICreditTransaction[] {
    // إذا لم تكن هناك فلاتر، نعيد كل البيانات
    if (!filters || Object.keys(filters).length === 0) {
      return transactions;
    }
    
    return transactions.filter(transaction => {
      // فلترة حسب النوع
      if (filters.action && transaction.credit_info.action !== filters.action) {
        return false;
      }

      if (filters.transaction_type && transaction.transaction_type !== filters.transaction_type) {
        return false;
      }

      // فلترة حسب التاريخ - فقط إذا تم تحديد التاريخ
      if (filters.created_at_from) {
        const transactionDate = new Date(transaction.created_at);
        const fromDate = new Date(filters.created_at_from);
        if (transactionDate < fromDate) {
          return false;
        }
      }

      if (filters.created_at_to) {
        const transactionDate = new Date(transaction.created_at);
        const toDate = new Date(filters.created_at_to);
        if (transactionDate > toDate) {
          return false;
        }
      }

      // فلترة حسب reference_id
      if (filters.reference_id && transaction.reference_id) {
        if (!transaction.reference_id.toLowerCase().includes(filters.reference_id.toLowerCase())) {
          return false;
        }
      }

      // فلترة حسب reference_type
      if (filters.reference_type && transaction.reference_type) {
        if (transaction.reference_type !== filters.reference_type) {
          return false;
        }
      }

      return true;
    });
  }

  // تصدير البيانات
  exportTransactions(transactions: ICreditTransaction[]): void {
    const csvContent = [
      ['Date', 'Action', 'Amount', 'Balance', 'Description', 'Type', 'Reference ID', 'Reference Type'],
      ...transactions.map(t => [
        new Date(t.created_at).toLocaleDateString(),
        t.credit_info.action,
        t.credit_info.amount,
        t.credit_info.balance.toString(),
        t.description,
        t.transaction_type,
        t.reference_id || '',
        t.reference_type || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credit-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}

export const creditService = new CreditService();
