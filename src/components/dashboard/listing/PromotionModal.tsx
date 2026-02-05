import React, { useState } from 'react';
import { X, Check, Info, Rocket, Star, ShieldCheck } from 'lucide-react';

interface PromotionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (plan: string, duration: string, cost: number, autoRenew: boolean) => void;
    availableCredits: number;
}

const PROMOTION_COSTS: Record<string, Record<string, number>> = {
    standard: {
        '1_month': 18,
    },
    featured: {
        '15_days': 132,
        '1_month': 202,
    },
    premium: {
        '15_days': 252,
        '1_month': 387,
    },
};

const PromotionModal: React.FC<PromotionModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    availableCredits,
}) => {
    const [selectedPlan, setSelectedPlan] = useState<'standard' | 'featured' | 'premium'>('standard');
    const [duration, setDuration] = useState<'15_days' | '1_month'>('1_month');
    const [autoRenew, setAutoRenew] = useState(true);

    if (!isOpen) return null;

    const currentCost = PROMOTION_COSTS[selectedPlan]?.[duration] || PROMOTION_COSTS[selectedPlan]?.['1_month'];
    const hasEnoughCredits = availableCredits >= currentCost;

    const handlePlanChange = (plan: 'standard' | 'featured' | 'premium') => {
        setSelectedPlan(plan);
        if (plan === 'standard') {
            setDuration('1_month');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 transition-opacity" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                    <X size={24} />
                </button>

                <div className="p-5 overflow-y-auto">
                    {/* Header: Balance */}
                    <div className="flex flex-col items-center justify-center mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                                <Rocket className="text-white" size={16} />
                            </div>
                            <span className="text-gray-700 font-medium leading-none">
                                Your balance: <span className="font-bold text-gray-900">{availableCredits} credits</span>
                            </span>
                        </div>
                    </div>

                    {/* Duration Tabs */}
                    <div className="flex p-1 bg-gray-100 rounded-lg mb-4">
                        <button
                            onClick={() => setDuration('1_month')}
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${duration === '1_month'
                                ? 'bg-white text-violet-700 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            1 month
                        </button>
                        <button
                            onClick={() => setDuration('15_days')}
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${duration === '15_days'
                                ? 'bg-white text-violet-700 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            15 days
                        </button>
                    </div>

                    {/* Plans List */}
                    <div className="space-y-3 mb-4">
                        {/* Premium Plan */}
                        <div
                            onClick={() => {
                                const cost = PROMOTION_COSTS.premium[duration] || PROMOTION_COSTS.premium['1_month'];
                                if (availableCredits >= cost) {
                                    handlePlanChange('premium');
                                }
                            }}
                            className={`p-3 rounded-xl border-2 transition-all ${selectedPlan === 'premium'
                                ? 'border-violet-300 bg-white'
                                : (availableCredits >= (PROMOTION_COSTS.premium[duration] || PROMOTION_COSTS.premium['1_month']) ? 'border-transparent bg-gray-50 cursor-pointer' : 'border-transparent bg-gray-50 opacity-50 cursor-not-allowed')
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h4 className={`text-base font-bold ${selectedPlan === 'premium' ? 'text-gray-900' : 'text-gray-900'}`}>Premium</h4>
                                <div className="text-right">
                                    <span className="text-base font-bold text-gray-900">
                                        {PROMOTION_COSTS.premium[duration] || PROMOTION_COSTS.premium['1_month']} credits
                                    </span>
                                    <span className="text-[10px] text-gray-500 block">/ {duration === '15_days' ? '15 days' : '1 month'}</span>
                                </div>
                            </div>
                            <ul className="space-y-1 mb-2">
                                <li className="flex items-center gap-2 text-xs text-gray-500">
                                    <Check size={14} className="text-green-500 stroke-[3]" />
                                    <span>Get up to 7x more leads than Standard</span>
                                </li>
                                <li className="flex items-center gap-2 text-xs text-gray-500">
                                    <Check size={14} className="text-green-500 stroke-[3]" />
                                    <span>Reach property seekers up to 3x faster</span>
                                </li>
                            </ul>
                            <div className="flex justify-between items-center mt-auto">
                                <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-[10px] font-bold rounded uppercase tracking-tight">Recommended Boost</span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-medium ${!hasEnoughCredits ? 'text-gray-300' : 'text-gray-400'}`}>Auto-renew</span>
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (hasEnoughCredits) setAutoRenew(!autoRenew);
                                        }}
                                        className={`w-8 h-5 rounded-full relative transition-colors p-0.5 ${!hasEnoughCredits
                                            ? 'bg-gray-100 cursor-not-allowed'
                                            : autoRenew ? 'bg-violet-600 cursor-pointer' : 'bg-gray-300 cursor-pointer'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full transition-all shadow-sm ${autoRenew && hasEnoughCredits ? 'translate-x-3' : 'translate-x-0'}`} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Featured Plan */}
                        {(duration === '15_days' || duration === '1_month') && (
                            <div
                                onClick={() => {
                                    const cost = PROMOTION_COSTS.featured[duration] || PROMOTION_COSTS.featured['1_month'];
                                    if (availableCredits >= cost) {
                                        handlePlanChange('featured');
                                    }
                                }}
                                className={`p-3 rounded-xl border-2 transition-all ${selectedPlan === 'featured'
                                    ? 'border-violet-300 bg-white ring-1 ring-violet-300 ring-inset'
                                    : (availableCredits >= (PROMOTION_COSTS.featured[duration] || PROMOTION_COSTS.featured['1_month']) ? 'border-transparent bg-gray-50 cursor-pointer' : 'border-transparent bg-gray-50 opacity-50 cursor-not-allowed')
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="text-base font-bold text-gray-700">Featured</h4>
                                    <div className="text-right">
                                        <span className="text-base font-bold text-gray-900">
                                            {PROMOTION_COSTS.featured[duration] || PROMOTION_COSTS.featured['1_month']} credits
                                        </span>
                                        <span className="text-[10px] text-gray-500 block">/ {duration === '15_days' ? '15 days' : '1 month'}</span>
                                    </div>
                                </div>
                                <ul className="space-y-1 mb-2">
                                    <li className="flex items-center gap-2 text-xs text-gray-500">
                                        <Check size={14} className="text-green-500 stroke-[3]" />
                                        <span>Get up to 4x more leads than Standard</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-xs text-gray-500">
                                        <Check size={14} className="text-green-500 stroke-[3]" />
                                        <span>Reach property seekers up to 2x faster</span>
                                    </li>
                                </ul>
                                <div className="flex justify-end items-center mt-auto">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-medium ${!hasEnoughCredits ? 'text-gray-300' : 'text-gray-400'}`}>Auto-renew</span>
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (hasEnoughCredits) setAutoRenew(!autoRenew);
                                            }}
                                            className={`w-8 h-5 rounded-full relative transition-colors p-0.5 ${!hasEnoughCredits
                                                ? 'bg-gray-100 cursor-not-allowed'
                                                : autoRenew ? 'bg-violet-600 cursor-pointer' : 'bg-gray-300 cursor-pointer'
                                                }`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full transition-all shadow-sm ${autoRenew && hasEnoughCredits ? 'translate-x-3' : 'translate-x-0'}`} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Standard Plan (Only for 1 month) */}
                        {duration === '1_month' && (
                            <div
                                onClick={() => {
                                    if (availableCredits >= 18) {
                                        handlePlanChange('standard');
                                    }
                                }}
                                className={`p-3 rounded-xl border-2 transition-all ${selectedPlan === 'standard'
                                    ? 'border-violet-300 bg-white ring-1 ring-violet-300 ring-inset shadow-sm'
                                    : (availableCredits >= 18 ? 'border-transparent bg-white shadow-sm cursor-pointer' : 'border-transparent bg-white shadow-sm opacity-50 cursor-not-allowed')
                                    }`}
                            >

                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="text-base font-bold text-gray-700">Standard</h4>
                                    <div className="text-right">
                                        <span className="text-base font-bold text-gray-900">18 credits</span>
                                        <span className="text-[10px] text-gray-500 block">/ 1 month</span>
                                    </div>
                                </div>
                                <ul className="space-y-1 mb-2">
                                    <li className="flex items-center gap-2 text-xs text-gray-600">
                                        <Check size={14} className="text-green-500 stroke-[3]" />
                                        <span>Gain visibility without any additional promotion.</span>
                                    </li>
                                </ul>
                                <div className="flex justify-end items-center mt-auto">
                                    <span className="text-[10px] text-gray-900 font-bold">Auto-renew: Always ON</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {!hasEnoughCredits && (
                        <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 rounded-xl text-red-700 border border-red-100">
                            <Info size={16} className="shrink-0 mt-0.5" />
                            <p className="text-xs font-medium">
                                Insufficient credits. You need {currentCost - availableCredits} more.
                            </p>
                        </div>
                    )}

                    <button
                        disabled={!hasEnoughCredits}
                        onClick={() => onConfirm(selectedPlan, duration, currentCost, autoRenew)}
                        className={`w-full py-3 text-base font-bold text-white rounded-xl transition-all shadow-lg ${hasEnoughCredits
                            ? 'bg-[#ff5a5f] hover:bg-[#ff4449] active:scale-[0.98] shadow-red-200/50'
                            : 'bg-gray-300 cursor-not-allowed text-gray-100'
                            }`}
                    >
                        Publish
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PromotionModal;
