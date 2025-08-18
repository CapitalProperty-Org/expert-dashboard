import { useState, useEffect } from 'react';
import axios from 'axios';

interface ICreditMultiBalance {
  total_credits: number;
  remaining_credits: number;
  used_credits: number;
  cycle: {
    start_date: string;
    end_date: string;
  };
}

const CreditsStatus = () => {
  const [balance, setBalance] = useState<ICreditMultiBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/credits/my-multi-balance`);
        setBalance(response.data);
        
      } catch (err) {
        console.error('Error fetching credit balance:', err);
        setError('Failed to load credits');
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  // حساب الأيام المتبقية
  const getDaysRemaining = () => {
    if (!balance?.cycle?.end_date) return 0;
    
    const endDate = new Date(balance.cycle.end_date);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  // حساب النسبة المئوية
  const getPercentage = () => {
    if (!balance?.total_credits) return 0;
    return (balance.remaining_credits / balance.total_credits) * 100;
  };

  if (loading) {
    return (
      <div className="px-4 py-5">
        <div className="animate-pulse">
          <div className="flex justify-between items-center text-sm mb-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gray-300 h-2 rounded-full w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !balance) {
    return (
      <div className="px-4 py-5">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">Credits</p>
          <p className="text-lg text-gray-400">-</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-gray-300 h-2 rounded-full w-0"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-5">
      <div className="flex justify-between items-center text-sm mb-2">
        <span className="font-medium text-gray-700">Remaining Credits</span>
        <span className="text-gray-500">expires in {getDaysRemaining()}d</span>
      </div>
      <p className="text-3xl font-bold text-gray-800 mb-2">{balance.remaining_credits}</p>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-violet-600 h-2 rounded-full transition-all duration-300" 
          style={{ width: `${getPercentage()}%` }}
        ></div>
      </div>
      
      {/* Additional Info */}
      <div className="mt-3 text-xs text-gray-500 space-y-1">
        <div className="flex justify-between">
          <span>Total:</span>
          <span>{balance.total_credits}</span>
        </div>
        <div className="flex justify-between">
          <span>Used:</span>
          <span>{balance.used_credits}</span>
        </div>
        <div className="flex justify-between">
          <span>Cycle:</span>
          <span>{new Date(balance.cycle.start_date).toLocaleDateString()} - {new Date(balance.cycle.end_date).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default CreditsStatus;