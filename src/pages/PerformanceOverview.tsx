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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { stats, loading, _error, fetchStats } = usePerformance();
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
      fetchStats(filters);
  }, [filters, fetchStats]);

  const handleFilterChange = (filterKey: string, option: FilterOption) => {
      setFilters(prev => ({ ...prev, [filterKey]: option.value as string }));
      setFilterLabels(prev => ({ ...prev, [filterKey]: option.label }));
      setOpenFilterIndex(null);
  };
  
  const handleFilterClick = (index: number) => {
    setOpenFilterIndex(openFilterIndex === index ? null : index);
  };

  const filterConfigs = [
    { key: 'category', label: filterLabels.category, options: [{ label: 'All', value: 'all' }, { label: 'Residential', value: 'residential' }, { label: 'Commercial', value: 'commercial' }] },
    { key: 'property_type', label: filterLabels.property_type, options: [{ label: 'All types', value: 'all' }, { label: 'Apartment', value: 'apartment' }, { label: 'Villa', value: 'villa' }] },
    { key: 'offering_type', label: filterLabels.offering_type, options: [{ label: 'Rent and Sale', value: 'both' }, { label: 'Rent', value: 'rent' }, { label: 'Sale', value: 'sale' }] },
    { key: 'location', label: filterLabels.location, options: [{ label: 'All locations', value: 'all'}, { label: 'Dubai', value: 'dubai' }, { label: 'Abu Dhabi', value: 'abu_dhabi' }] },
    { key: 'date_range', label: filterLabels.date_range, options: [{ label: 'Last 7 days', value: '7d' }, { label: 'Last 30 days', value: '30d' }] }
  ];

  const activeStat = statMapping.find(stat => stat.key === activeStatKey);

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
        {statMapping.map((stat) => (
          <StatCard
            key={stat.key}
            value={loading ? '...' : (stats ? (stats[stat.key] ?? 0) : 0)}
            label={stat.label}
            isActive={activeStatKey === stat.key}
            onClick={() => { setActiveStatKey(stat.key); setOpenFilterIndex(null); }}
          />
        ))}
      </div>

      <div className="mt-6 p-6 bg-white border border-gray-200 rounded-lg">
        <h2 className="font-semibold text-gray-800">{activeStat?.label}</h2>
        <p className="text-sm text-gray-500 mt-1">{activeStat?.description}</p>
        <div className="mt-4 flex flex-col lg:flex-row gap-6">
          <div className="flex-grow">
            {loading ? <LoadingSpinner /> : <NoData />}
          </div>
          <div className="flex-shrink-0"><ChartLegend /></div>
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
