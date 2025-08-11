import React, { useState, useEffect, useMemo } from 'react';
import { ArrowRight, Phone, MessageSquare, Info } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import ChartCard from '../components/ui/ChartCard';
import DonutChart from '../components/ui/DonutChart';
import NoDataWithMessage from '../components/dashboard/NoDataWithMessage';
import TabButton from '../components/ui/TabButton';
import { useInsights, InsightsProvider } from '../context/InsightsContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import DirectLeadsChart from '../components/charts/DirectLeadsChart';
import { format } from 'date-fns';
import SimpleBarChart from '../components/charts/SimpleBarChart';

const LeadInsightsComponent = () => {
    const { 
        leadsInsights, whatsAppInsights, callsInsights, 
        whatsAppDaily, callsDaily,
        loading, error, fetchInsights 
    } = useInsights();

    const [dateFilter, setDateFilter] = useState('7d');
    const [directLeadsTab, setDirectLeadsTab] = useState<'All leads' | 'WhatsApp' | 'Calls' | 'Email'>('All leads');
    const [callInsightsTab, setCallInsightsTab] = useState('Total calls');
    const [whatsAppTab, setWhatsAppTab] = useState('WhatsApp Leads');

    useEffect(() => {
        fetchInsights(dateFilter);
    }, [dateFilter, fetchInsights]);
    
    // معالجة البيانات للرسوم البيانية
    const directLeadsChartData = useMemo(() => {
        if (!leadsInsights?.data) return [];
        
        // تجميع البيانات حسب التاريخ
        const groupedData = leadsInsights.data.reduce((acc: Record<string, { leads: number; whatsapp: number; calls: number; email: number }>, item: Record<string, string | number>) => {
            const dateKey = item.created_at as string;
            if (!dateKey) return acc;
            
            try {
                const date = new Date(dateKey);
                if (isNaN(date.getTime())) return acc;
                
                const formattedDate = format(date, 'dd MMM');
                
                if (!acc[formattedDate]) {
                    acc[formattedDate] = { leads: 0, whatsapp: 0, calls: 0, email: 0 };
                }
                
                // زيادة العداد الإجمالي
                acc[formattedDate].leads += 1;
                
                // توزيع حسب نوع العقار (محاكاة للأنواع المختلفة)
                const propertyType = String(item.property_type || '').toLowerCase();
                if (propertyType.includes('apartment') || propertyType.includes('villa') || propertyType.includes('townhouse')) {
                    acc[formattedDate].whatsapp += 1;
                } else if (propertyType.includes('penthouse')) {
                    acc[formattedDate].calls += 1;
                } else {
                    acc[formattedDate].email += 1;
                }
                
            } catch (error) {
                console.warn('Invalid date format:', dateKey, error);
            }
            
            return acc;
        }, {});
        
        // تحويل البيانات إلى مصفوفة مرتبة حسب التاريخ
        return Object.entries(groupedData)
            .sort(([dateA], [dateB]) => {
                try {
                    const dateAObj = new Date(dateA);
                    const dateBObj = new Date(dateB);
                    return dateAObj.getTime() - dateBObj.getTime();
                } catch {
                    return 0;
                }
            })
            .map(([date, counts]) => ({
                name: date,
                leads: (counts as { leads: number; whatsapp: number; calls: number; email: number }).leads,
                whatsapp: (counts as { leads: number; whatsapp: number; calls: number; email: number }).whatsapp,
                calls: (counts as { leads: number; whatsapp: number; calls: number; email: number }).calls,
                email: (counts as { leads: number; whatsapp: number; calls: number; email: number }).email,
            }));
    }, [leadsInsights]);

    const callsDailyChartData = useMemo(() => {
        if (!callsDaily) return [];
        return Object.entries(callsDaily).map(([day, values]) => ({
            name: day.toUpperCase(),
            value: (values as Record<string, number>).answered_count || 0
        }));
    }, [callsDaily]);

    const whatsAppDailyChartData = useMemo(() => {
        if (!whatsAppDaily) return [];
        return Object.entries(whatsAppDaily).map(([day, values]) => ({
            name: day.toUpperCase(),
            value: (values as Record<string, number>).total_enquiries || 0
        }));
    }, [whatsAppDaily]);
    
    // ... يمكنك إضافة معالجة للبيانات الساعية بنفس الطريقة

    if (loading) return <div className="p-8 flex justify-center"><LoadingSpinner /></div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8">
            <PageHeader title="Leads insights" selectedValue={dateFilter} onValueChange={setDateFilter} />

            {/* --- Direct Leads Section --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <ChartCard title="Direct leads source">
                        <DonutChart value={leadsInsights?.total_leads || 0} label="Total" />
                        <div className="text-center mt-4"><a href="#" className="text-sm font-semibold text-blue-600 hover:underline flex items-center justify-center gap-1">View all <ArrowRight size={14} /></a></div>
                    </ChartCard>
                </div>
                <div className="lg:col-span-2">
                    <ChartCard title="Direct leads over time" tabs={['All leads', 'WhatsApp', 'Calls', 'Email']} activeTab={directLeadsTab} onTabChange={(tab: string) => setDirectLeadsTab(tab as 'All leads' | 'WhatsApp' | 'Calls' | 'Email')}>
                        {directLeadsChartData.length > 0 ? (
                            <DirectLeadsChart data={directLeadsChartData} activeTab={directLeadsTab} />
                        ) : (
                            <div className="h-64 flex items-center justify-center"><NoDataWithMessage icon={<Info size={32}/>} title="No data to display" message="There is no lead data for the selected period." /></div>
                        )}
                    </ChartCard>
                </div>
            </div>

            {/* --- Call Insights Section --- */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Call insights</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-1 bg-white p-6 border border-gray-200 rounded-lg">
                        <NoDataWithMessage icon={<Phone size={32} className="text-violet-500" />} title={`${callsInsights?.total_count || 0} Calls`} message="You haven't received any calls yet." actionLink={{ href: '#', text: 'View per agent' }}/>
                    </div>
                    <div className="lg:col-span-2">
                        <ChartCard>
                            <div className="border-b border-gray-200"><TabButton label="Total calls" isActive={callInsightsTab === 'Total calls'} onClick={() => setCallInsightsTab('Total calls')} /><TabButton label="Answering rate" isActive={callInsightsTab === 'Answering rate'} onClick={() => setCallInsightsTab('Answering rate')} /></div>
                            <div className="h-64 flex items-center justify-center"><NoDataWithMessage icon={<Info size={32}/>} title="Chart not available yet" message="This feature is under development." /></div>
                        </ChartCard>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    <ChartCard title="Calls per day of the week">
                        {callsDailyChartData.length > 0 ? <SimpleBarChart data={callsDailyChartData} barColor="#ef4444" /> : <NoDataWithMessage icon={<Info size={32} />} title="No data available" message="You require at least 4 weeks for data insights." />}
                    </ChartCard>
                     <ChartCard title="Calls per hour">
                        <NoDataWithMessage icon={<Info size={32} />} title="No data available" message="You require at least 4 weeks for data insights." />
                    </ChartCard>
                </div>
            </div>

            {/* --- WhatsApp Insights Section --- */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">WhatsApp insights</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-1 bg-white p-6 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-start"><h3 className="text-lg font-bold text-gray-800">WhatsApp leads</h3><div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center"><MessageSquare size={24} className="text-violet-500" /></div></div>
                        <p className="text-4xl font-bold mt-4">{whatsAppInsights?.total_enquiries || 0}</p>
                        <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                            <div><p className="text-gray-500">Response rate</p><p className="font-bold text-lg">{whatsAppInsights?.total_response_rate || 0}%</p></div>
                            <div><p className="text-gray-500">Response time</p><p className="font-bold text-lg">{whatsAppInsights?.total_response_time || 0}m</p></div>
                            <div><p className="text-gray-500">Replied</p><p className="font-bold text-lg">{whatsAppInsights?.total_replied_count || 0}</p></div>
                            <div><p className="text-gray-500">Not replied</p><p className="font-bold text-lg">{whatsAppInsights?.total_not_replied_count || 0}</p></div>
                        </div>
                        <a href="#" className="text-sm font-semibold text-blue-600 hover:underline mt-6 block">View per agent →</a>
                    </div>
                     <div className="lg:col-span-2">
                        <ChartCard>
                             <div className="border-b border-gray-200">
                                <TabButton label="WhatsApp Leads" isActive={whatsAppTab === 'WhatsApp Leads'} onClick={() => setWhatsAppTab('WhatsApp Leads')} />
                                <TabButton label="Response rate" isActive={whatsAppTab === 'Response rate'} onClick={() => setWhatsAppTab('Response rate')} />
                                <TabButton label="Response time" isActive={whatsAppTab === 'Response time'} onClick={() => setWhatsAppTab('Response time')} />
                            </div>
                            <div className="h-64 flex items-center justify-center"><NoDataWithMessage icon={<Info size={32}/>} title="Chart not available yet" message="This feature is under development." /></div>
                        </ChartCard>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    <ChartCard title="WhatsApp leads per day of week">
                        {whatsAppDailyChartData.length > 0 ? <SimpleBarChart data={whatsAppDailyChartData} barColor="#22c55e" /> : <NoDataWithMessage icon={<Info size={32} />} title="No data available" message="You require at least 4 weeks for data insights." />}
                    </ChartCard>
                     <ChartCard title="WhatsApp leads per hour">
                        <NoDataWithMessage icon={<Info size={32} />} title="No data available" message="You require at least 4 weeks for data insights." />
                    </ChartCard>
                </div>
            </div>
        </div>
    );
};

// Wrapper Component
const LeadInsights = () => (
    <InsightsProvider>
        <LeadInsightsComponent />
    </InsightsProvider>
);

export default LeadInsights;