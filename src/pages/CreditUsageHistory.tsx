import React, { useState, useEffect } from 'react';
import { Play, Download, BarChart, Plus } from 'lucide-react';
import DateRangePicker from '../components/ui/DateRangePicker';
import UsageHistoryTable from '../components/dashboard/credit/UsageHistoryTable';
import UsageHistoryCards from '../components/dashboard/credit/UsageHistoryCards';
import { useCredits } from '../context/CreditsContext';
import type { ICreditFilters } from '../services/creditService';

const CreditUsageHistory = () => {
  const { 
    filteredTransactions, 
    loading, 
    exportTransactions,
    setFilters
  } = useCredits();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>(undefined);

  // Debug: عرض البيانات
  console.log('🔍 CreditUsageHistory - filteredTransactions:', filteredTransactions);
  console.log('🔍 CreditUsageHistory - loading:', loading);
  console.log('🔍 CreditUsageHistory - searchTerm:', searchTerm);
  console.log('🔍 CreditUsageHistory - dateRange:', dateRange);

  // تحديث الفلاتر عند تغيير البحث أو التاريخ
  useEffect(() => {
    const newFilters: ICreditFilters = {};

    if (dateRange?.from && dateRange?.to) {
      newFilters.created_at_from = dateRange.from.toISOString().split('T')[0];
      newFilters.created_at_to = dateRange.to.toISOString().split('T')[0];
    }

    if (searchTerm) {
      newFilters.reference_id = searchTerm;
    }

    setFilters(newFilters);
  }, [searchTerm, dateRange, setFilters]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleExport = () => {
    exportTransactions();
  };

  const handleLoadMore = () => {
    // لا نحتاج load more لأننا نجلب كل البيانات مرة واحدة
    console.log('All data already loaded');
  };

  // إنشاء pagination بسيط للعرض
  const pagination = {
    total: filteredTransactions.length,
    offset: 0,
    limit: filteredTransactions.length,
    hasMore: false
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header Section */}
      <div className="p-4 sm:p-6 md:p-8 space-y-4 lg:space-y-6 bg-gray-50 flex-shrink-0 z-10">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Credit Usage History</h1>
            <button className="bg-violet-600 text-white font-semibold py-2 px-4 rounded-full flex items-center gap-2 text-sm hover:bg-violet-700 transition-colors">
              <Play size={16} />
              Watch tutorial
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="bg-violet-600 text-white font-semibold py-2 px-4 rounded-md flex items-center gap-2 text-sm hover:bg-violet-700 transition-colors">
              <BarChart size={16}/>Calculate credits
            </button>
            <button className="bg-red-600 text-white font-semibold py-2 px-4 rounded-md flex items-center gap-2 text-sm hover:bg-red-700 transition-colors">
              <Plus size={16} />Top up
            </button>
            <button 
              onClick={handleExport}
              className="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md flex items-center gap-2 text-sm hover:bg-gray-50 transition-colors"
            >
              <Download size={16} />
              Export to .CSV
            </button>
          </div>
        </div>

        {/* Filter and Search Section */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-grow lg:flex-grow-0 lg:w-80">
            <input 
              type="text" 
              placeholder="Search by Reference or Web ID" 
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-white pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            />
            <button 
              type="submit"
              className="absolute inset-y-0 right-0 w-12 border-l bg-gray-50 rounded-r-lg hover:bg-gray-100 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-500 mx-auto">
                <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          <DateRangePicker 
            value={dateRange}
            onChange={(range) => {
              if (range?.from && range?.to) {
                setDateRange({ from: range.from, to: range.to });
              }
            }}
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 sm:px-6 md:px-8 flex-grow overflow-y-auto pb-28 lg:pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
          </div>
        ) : (
          <>
            <div className="hidden lg:block">
              <UsageHistoryTable 
                transactions={filteredTransactions}
                pagination={pagination}
                onLoadMore={handleLoadMore}
              />
            </div>
            <div className="block lg:hidden">
              <UsageHistoryCards 
                transactions={filteredTransactions}
                pagination={pagination}
                onLoadMore={handleLoadMore}
              />
            </div>
          </>
        )}
      </div>

      {/* Mobile Footer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t p-4 flex gap-4 z-30">
        <button className="text-sm bg-white border border-violet-600 text-violet-600 font-semibold py-3 px-4 rounded-lg w-full flex items-center justify-center gap-2 hover:bg-violet-50 transition-colors">
          <BarChart size={16} />Calculate credits
        </button>
        <button className="bg-red-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 w-full hover:bg-red-700 transition-colors">
          <Plus size={16} />Top up
        </button>
      </div>
    </div>
  );
};

export default CreditUsageHistory;