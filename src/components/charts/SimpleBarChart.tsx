import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface SimpleBarChartProps {
    data: { name: string; value: number }[];
    barColor?: string;
}

const SimpleBarChart = ({ data, barColor = "#8884d8" }: SimpleBarChartProps) => {
    return (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'rgba(238, 237, 249, 0.5)' }}/>
                <Bar dataKey="value" fill={barColor} radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default SimpleBarChart;