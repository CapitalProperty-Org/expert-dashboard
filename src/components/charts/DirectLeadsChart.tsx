import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
    name: string;
    leads?: number;
    whatsapp?: number;
    calls?: number;
    email?: number;
}

interface DirectLeadsChartProps {
    data: ChartData[];
    activeTab: 'All leads' | 'WhatsApp' | 'Calls' | 'Email';
}

const DirectLeadsChart = ({ data, activeTab }: DirectLeadsChartProps) => {
    const dataKeyMap = {
        'All leads': 'leads',
        'WhatsApp': 'whatsapp',
        'Calls': 'calls',
        'Email': 'email',
    };
    
    const activeDataKey = dataKeyMap[activeTab] as keyof ChartData;

    return (
        <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line 
                    type="monotone" 
                    dataKey={activeDataKey} 
                    stroke="#8b5cf6" // Violet color
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default DirectLeadsChart;