import React from 'react';
import type { ICreditTransaction } from '../../../services/creditService';

interface Props {
  transactions: ICreditTransaction[];
  pagination: {
    total: number;
    offset: number;
    limit: number;
    hasMore: boolean;
  };
  onLoadMore: () => void;
}

const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#FEE2E2"/>
    <path d="M16.5 18C16.5 15.5147 14.4853 13.5 12 13.5C9.51472 13.5 7.5 15.5147 7.5 18" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="10" r="2.25" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const UsageHistoryCards = ({ transactions, pagination, onLoadMore }: Props) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCreditDisplay = (creditInfo: ICreditTransaction['credit_info']) => {
    const { action, amount } = creditInfo;
    const isPositive = action === 'add';
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    const sign = isPositive ? '+' : '';
    
    return (
      <span className={`${color} font-bold`}>
        {sign}{amount}
      </span>
    );
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white border border-gray-200/80 rounded-lg p-8 text-center">
        <p className="text-gray-500">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction, index) => (
        <div key={transaction.id || index} className="bg-white border border-gray-200/80 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserIcon />
              <div>
                <p className="font-semibold text-gray-800 text-sm">System</p>
                <p className="text-xs text-gray-500">{formatDate(transaction.created_at)}</p>
              </div>
            </div>
          </div>
          <div className="border-b border-gray-200/80"></div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-800">{transaction.description}</p>
            <div className="text-lg font-bold">
              {getCreditDisplay(transaction.credit_info)}
            </div>
          </div>
          <div className="border-b border-gray-200/80"></div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Credit Balance</p>
            <p className="text-sm font-medium text-gray-800">{transaction.credit_info.balance}</p>
          </div>
          {transaction.reference_id && (
            <>
              <div className="border-b border-gray-200/80"></div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Reference ID</p>
                <p className="text-sm font-medium text-gray-800">{transaction.reference_id}</p>
              </div>
            </>
          )}
        </div>
      ))}
      
      {/* Load More Button */}
      {pagination.hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={onLoadMore}
            className="px-6 py-3 text-sm font-medium text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors"
          >
            Load More ({pagination.total - pagination.offset - pagination.limit} remaining)
          </button>
        </div>
      )}
    </div>
  );
};

export default UsageHistoryCards;