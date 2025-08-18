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

const tableHeaders = ["User", "Date", "Credits", "Credit Balance", "Description", "Web ID", "Reference", "Property Type", "Category", "Location"];

const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#FEE2E2"/>
    <path d="M16.5 18C16.5 15.5147 14.4853 13.5 12 13.5C9.51472 13.5 7.5 15.5147 7.5 18" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="10" r="2.25" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const UsageHistoryTable = ({ transactions, pagination, onLoadMore }: Props) => {
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
      <div className="w-full bg-white border border-gray-200/80 rounded-lg overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 scrollbar-thumb-rounded-full">
        <table className="min-w-full w-full">
          <thead className="bg-gray-50/50">
            <tr className="border-b border-gray-200/80">
              {tableHeaders.map((header) => (
                <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            <tr>
              <td colSpan={tableHeaders.length} className="px-6 py-8 text-center text-gray-500">
                No transactions found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-gray-200/80 rounded-lg overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 scrollbar-thumb-rounded-full">
      <table className="min-w-full w-full">
        <thead className="bg-gray-50/50">
          <tr className="border-b border-gray-200/80">
            {tableHeaders.map((header) => (
              <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {transactions.map((transaction, index) => (
            <tr key={transaction.id || index} className="border-b last:border-b-0 border-gray-200/80">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                <div className="flex items-center gap-3">
                  <UserIcon />
                  <span>System</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {formatDate(transaction.created_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {getCreditDisplay(transaction.credit_info)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {transaction.credit_info.balance}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {transaction.description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {transaction.reference_id || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {transaction.reference_type || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {transaction.transaction_type || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {transaction.metadata?.reason || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                -
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Load More Button */}
      {pagination.hasMore && (
        <div className="p-4 text-center border-t border-gray-200/80">
          <button
            onClick={onLoadMore}
            className="px-4 py-2 text-sm font-medium text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors"
          >
            Load More ({pagination.total - pagination.offset - pagination.limit} remaining)
          </button>
        </div>
      )}
    </div>
  );
};

export default UsageHistoryTable;