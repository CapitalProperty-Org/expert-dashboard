import { useEffect, useState } from 'react';
import PerformanceHeader from '../components/dashboard/PerformanceHeader';
import FilterDropdown from '../components/dashboard/FilterDropdown';
import StatCard from '../components/dashboard/StatCard';
import NoData from '../components/dashboard/NoData';
import ChartLegend from '../components/dashboard/ChartLegend';
import FactorsSection from '../components/dashboard/FactorsSection';
import CommunityAnalysis from '../components/dashboard/CommunityAnalysis';
import { PerformanceProvider, usePerformance } from '../context/PerformanceContext';
import type { FilterOption } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Area, BarChart, Bar, Cell } from 'recharts';

const statMapping = [
    { key: 'credits_spent', label: 'Credits Spent', description: "View the total number of credits you've used on our platform during the selected time period and specific filters you chose. Credits are utilized for publishing and upgrading your listings." },
    { key: 'published_listings', label: 'Published Listings', description: "See the number of listings you have published on our platform during the selected time period and specific filters you chose. Publishing more high-quality listings can help you generate more leads and increase your chances of making successful transactions." },
    { key: 'live_listings', label: 'Live Listings', description: "Track the number of listings you have online on our platform during the selected time period and specific filters. Published listings reflect all listings posted, while live listings show only those visible to consumers. These numbers may differ, which is normal." },
    { key: 'listings_impressions',label: 'Impressions', description: "See how many times your listings have been exposed to home-seekers on our search pages during the selected time period and specific filters you chose. A higher number of impressions means greater visibility for your listings." },
    {  key: 'listings_clicks', label: 'Listing Clicks', description: "This metric shows the total number of clicks your listings received from the search results page. Higher clicks indicate strong interest from potential buyers or renters." },
    { key: 'leads', label: 'Leads', description: "Leads are the number of inquiries (calls, messages, emails) you received through the platform. This is a direct measure of consumer interest in your properties." },
    { key: 'lpl', label: 'Leads per Listing', description: "This calculates the average number of leads generated per listing, helping you understand the effectiveness of individual properties. (LPL = Total Leads / Total Live Listings)." }
];

const PerformanceOverviewComponent = () => {
  const { stats, loading, fetchStats } = usePerformance();
  const [activeStatKey, setActiveStatKey] = useState<string>('published_listings');
  const [openFilterIndex, setOpenFilterIndex] = useState<number | null>(null);
  
  // حالة الفلاتر
  const [filters, setFilters] = useState<{ [key: string]: string }>({
      category: 'residential',
      property_type: 'all',
      offering_type: 'both',
      location: 'all',
      date_range: '30d'
  });
  
  const [filterLabels, setFilterLabels] = useState<{ [key: string]: string }>({
      category: "Residential",
      property_type: "Property type",
      offering_type: "Rent and Sale",
      location: "All locations",
      date_range: "Last 30 days"
  });

  // جلب البيانات عند تغيير الفلاتر
  useEffect(() => {
      console.log('Filters changed, fetching stats with:', filters);
      fetchStats(filters);
  }, [filters, fetchStats]);

  const handleFilterChange = (filterKey: string, option: FilterOption) => {
      console.log(`Filter changing: ${filterKey} = ${option.value} (${option.label})`);
      setFilters(prev => {
          const newFilters = { ...prev, [filterKey]: option.value as string };
          console.log('New filters:', newFilters);
          return newFilters;
      });
      setFilterLabels(prev => {
          const newLabels = { ...prev, [filterKey]: option.label };
          console.log('New filter labels:', newLabels);
          return newLabels;
      });
      setOpenFilterIndex(null);
  };
  
  const handleFilterClick = (index: number) => {
    setOpenFilterIndex(openFilterIndex === index ? null : index);
  };

  const filterConfigs = [
    { key: 'category', label: filterLabels.category, options: [{ label: 'All', value: 'all' }, { label: 'Residential', value: 'residential' }, { label: 'Commercial', value: 'commercial' }] },
    { key: 'property_type', label: filterLabels.property_type, options: [{ label: 'All types', value: 'all' }, { label: 'Apartment', value: 'apartment' }, { label: 'Villa', value: 'villa' }, { label: 'Office', value: 'office' }, { label: 'Retail', value: 'retail' }] },
    { key: 'offering_type', label: filterLabels.offering_type, options: [{ label: 'Rent and Sale', value: 'both' }, { label: 'Rent', value: 'rent' }, { label: 'Sale', value: 'sale' }] },
    { key: 'location', label: filterLabels.location, options: [{ label: 'All locations', value: 'all'}, { label: 'Dubai', value: 'dubai' }, { label: 'Abu Dhabi', value: 'abu_dhabi' }] },
    { key: 'date_range', label: filterLabels.date_range, options: [{ label: 'Last 7 days', value: '7d' }, { label: 'Last 30 days', value: '30d' }, { label: 'Last 90 days', value: '90d' }] }
  ];

  console.log('Filter configs updated:', filterConfigs);
  console.log('Current filter labels:', filterLabels);

  const activeStat = statMapping.find(stat => stat.key === activeStatKey);

  // إعداد بيانات الرسم البياني الزمني (محاكاة البيانات)
  const getTimeSeriesData = () => {
    if (!stats) return [];
    
    const days = stats.number_of_days || 30;
    const data = [];
    
    for (let i = 0; i < days; i++) {
      const baseValue = getBaseValueForStat();
      const randomFactor = 0.5 + Math.random() * 1; // تغيير عشوائي بين 0.5 و 1.5
      data.push({
        day: i + 1,
        value: Math.round(baseValue * randomFactor),
        date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }
    
    return data;
  };

  // الحصول على القيمة الأساسية حسب نوع الإحصائية
  const getBaseValueForStat = () => {
    if (!stats) return 0;
    
    switch (activeStatKey) {
      case 'published_listings':
        return Math.max(stats.published_listings / 10, 1);
      case 'live_listings':
        return Math.max(stats.live_listings / 5, 1);
      case 'listings_impressions':
        return Math.max(stats.listings_impressions / 100, 10);
      case 'listings_clicks':
        return Math.max(stats.listings_clicks / 20, 5);
      case 'leads':
        return Math.max(stats.leads / 3, 1);
      case 'credits_spent':
        return Math.max(stats.credits_spent / 50, 10);
      case 'lpl':
        return Math.max(stats.lpl * 2, 1);
      default:
        return 10;
    }
  };

  // إعداد بيانات الرسم البياني الشريطي
  const getChartData = () => {
    if (!stats) return [];

    switch (activeStatKey) {
      case 'published_listings':
        return [
          { name: 'Standard', value: stats.published_listings_standard, color: '#6B7280' },
          { name: 'Premium', value: stats.published_listings_premium, color: '#F59E0B' },
          { name: 'Featured', value: stats.published_listings_featured, color: '#EF4444' }
        ];
      case 'live_listings':
        return [
          { name: 'Standard', value: stats.live_listings_standard, color: '#6B7280' },
          { name: 'Premium', value: stats.live_listings_premium, color: '#F59E0B' },
          { name: 'Featured', value: stats.live_listings_featured, color: '#EF4444' }
        ];
      case 'listings_impressions':
        return [
          { name: 'Standard', value: stats.listings_impressions_standard, color: '#6B7280' },
          { name: 'Premium', value: stats.listings_impressions_premium, color: '#F59E0B' },
          { name: 'Featured', value: stats.listings_impressions_featured, color: '#EF4444' }
        ];
      case 'listings_clicks':
        return [
          { name: 'Standard', value: stats.listings_clicks_standard, color: '#6B7280' },
          { name: 'Premium', value: stats.listings_clicks_premium, color: '#F59E0B' },
          { name: 'Featured', value: stats.listings_clicks_featured, color: '#EF4444' }
        ];
      case 'leads':
        return [
          { name: 'Standard', value: stats.leads_standard, color: '#6B7280' },
          { name: 'Premium', value: stats.leads_premium, color: '#F59E0B' },
          { name: 'Featured', value: stats.leads_featured, color: '#EF4444' }
        ];
      case 'credits_spent':
        return [
          { name: 'Standard', value: stats.credits_spent_standard, color: '#6B7280' },
          { name: 'Premium', value: stats.credits_spent_premium, color: '#F59E0B' },
          { name: 'Featured', value: stats.credits_spent_featured, color: '#EF4444' }
        ];
      default:
        return [];
    }
  };

  const chartData = getChartData();
  const timeSeriesData = getTimeSeriesData();

  // تنسيق القيم للعرض
  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'k';
    }
    return value.toString();
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <PerformanceHeader />

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {filterConfigs.map((filter, index) => (
          <FilterDropdown
            key={filter.key}
            label={filter.label}
            options={filter.options}
            isOpen={openFilterIndex === index}
            onClick={() => handleFilterClick(index)}
            onSelect={(option) => handleFilterChange(filter.key, option)}
          />
        ))}
      </div>
      
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {statMapping.map((stat) => {
          let displayValue = 0;
          if (stats && !loading) {
            switch (stat.key) {
              case 'credits_spent':
                displayValue = stats.credits_spent || 0;
                break;
              case 'published_listings':
                displayValue = stats.published_listings || 0;
                break;
              case 'live_listings':
                displayValue = stats.live_listings || 0;
                break;
              case 'listings_impressions':
                displayValue = stats.listings_impressions || 0;
                break;
              case 'listings_clicks':
                displayValue = stats.listings_clicks || 0;
                break;
              case 'leads':
                displayValue = stats.leads || 0;
                break;
              case 'lpl':
                displayValue = stats.lpl || 0;
                break;
              default:
                displayValue = 0;
            }
          }
          
          return (
            <StatCard
              key={stat.key}
              value={loading ? '...' : displayValue}
              label={stat.label}
              isActive={activeStatKey === stat.key}
              onClick={() => { setActiveStatKey(stat.key); setOpenFilterIndex(null); }}
            />
          );
        })}
      </div>

      <div className="mt-6 p-6 bg-white border border-gray-200 rounded-lg">
        <h2 className="font-semibold text-gray-800">{activeStat?.label}</h2>
        <p className="text-sm text-gray-500 mt-1">{activeStat?.description}</p>
        
        {/* نص توضيحي إضافي */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> {activeStat?.label} data is displayed over time to show trends and patterns. 
                The chart updates automatically based on your selected filters and date range.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex flex-col lg:flex-row gap-6">
          <div className="flex-grow">
            {loading ? (
              <LoadingSpinner />
            ) : stats && chartData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                      axisLine={{ stroke: '#E5E7EB' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                      axisLine={{ stroke: '#E5E7EB' }}
                      tickFormatter={formatValue}
                    />
                    <Tooltip 
                      formatter={(value: number) => [value.toLocaleString(), activeStat?.label]}
                      labelFormatter={(label) => `Date: ${label}`}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <NoData />
            )}
          </div>
          <div className="flex-shrink-0 flex flex-col gap-4">
            {/* رسم بياني شريطي صغير */}
            {stats && chartData.length > 0 && (
              <div className="w-48 h-32 bg-white border border-gray-200 rounded-lg p-3">
                <h4 className="text-xs font-medium text-gray-700 mb-2">Breakdown by Type</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="horizontal" margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" hide />
                    <Tooltip 
                      formatter={(value: number) => [value.toLocaleString(), 'Value']}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            <ChartLegend activeStatKey={activeStatKey} />
          </div>
        </div>
      </div>
      
      <div className="mt-8"><FactorsSection /></div>
      <CommunityAnalysis />
    </div>
  );
};

// Wrapper Component
const PerformanceOverview = () => (
    <PerformanceProvider>
        <PerformanceOverviewComponent />
    </PerformanceProvider>
);

export default PerformanceOverview;
