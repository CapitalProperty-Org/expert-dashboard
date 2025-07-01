import React from 'react';
import { User, Check, X } from 'lucide-react';
import type { AgentData, Criterion } from '../../context/AgentInsightsContext';

interface AgentRowProps {
    agent: AgentData;
    criteria: Criterion[];
}

// دالة مساعدة لتقييم الأداء
const checkPerformance = (value: number, criterion?: Criterion): boolean => {
    if (!criterion) return false;
    const targetValue = parseFloat(criterion.target.value);
    
    switch (criterion.target.rule) {
        case 'binary':
            return value >= targetValue;
        case 'less_than_or_equal':
            return value <= targetValue;
        case 'greater_than_or_equal':
            return value >= targetValue;
        case 'range':
            return value >= parseFloat(criterion.target.valueMin!) && value <= parseFloat(criterion.target.valueMax!);
        default:
            return false;
    }
}

const PerformanceCell = ({ isSuccess }: { isSuccess: boolean }) => (
    <div className="flex justify-center">
        {isSuccess ? <Check size={20} className="text-green-500" /> : <X size={20} className="text-red-500" />}
    </div>
);

const AgentRow = ({ agent, criteria }: AgentRowProps) => {
    const getCriterion = (metricName: string) => criteria.find(c => c.metricName === metricName);

    return (
        <div className="grid grid-cols-9 min-w-[1000px] border-t border-gray-200 hover:bg-gray-50">
            <div className="py-3 px-4 flex items-center gap-3 col-span-1">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User size={18} className="text-gray-500" />
                </div>
                <span className="text-sm font-medium text-gray-800">{agent.agent_name}</span>
            </div>
            <div className="py-3 px-4 text-center text-sm"><PerformanceCell isSuccess={checkPerformance(agent.verification, getCriterion('verification'))} /></div>
            <div className="py-3 px-4 text-center text-sm"><PerformanceCell isSuccess={checkPerformance(agent.propertiesBlacklistedCount, getCriterion('propertiesBlacklistedCount'))} /></div>
            <div className="py-3 px-4 text-center text-sm"><PerformanceCell isSuccess={checkPerformance(agent.attendedEnquiriesPercent, getCriterion('attendedEnquiriesPercent'))} /></div>
            <div className="py-3 px-4 text-center text-sm"><PerformanceCell isSuccess={checkPerformance(agent.propertiesLiveCount, getCriterion('propertiesLiveCount'))} /></div>
            <div className="py-3 px-4 text-center text-sm"><PerformanceCell isSuccess={checkPerformance(agent.leadsCount, getCriterion('leadsCount'))} /></div>
            <div className="py-3 px-4 text-center text-sm"><PerformanceCell isSuccess={checkPerformance(agent.transactionsCount, getCriterion('transactionsCount'))} /></div>
            <div className="py-3 px-4 text-center text-sm"><PerformanceCell isSuccess={checkPerformance(agent.ratingAverage, getCriterion('ratingAverage'))} /></div>
            <div className="py-3 px-4 text-center text-sm"><PerformanceCell isSuccess={checkPerformance(agent.responseRate, getCriterion('responseRate'))} /></div>
        </div>
    );
};

export default AgentRow;