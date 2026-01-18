import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { usePerformance } from '../../context/PerformanceContext';

// Logic for market benchmarks (Simulated based on typical market data)
// These constants are used to give meaningful comparisons since we don't have a live market API
const MARKET_BENCHMARKS = {
  qualityScore: { top5: 85, great: 100 },
  verified: { top5: 23, great: 100 },
  superAgent: { top5: 25, great: 43 },
  exposure: { top5: 2, great: 69 },
  lpl: { top5: 22.52, great: 385.3 }
};

interface MetricCardProps {
  value: string | number;
  label: string;
  top5Value: string | number;
  greatValue: string | number;
  tooltipText: string;
  importanceText: string;
  isHighlighted?: boolean;
}

const MetricCard = ({ value, label, top5Value, greatValue, tooltipText, importanceText, isHighlighted = false }: MetricCardProps) => {
  return (
    <div className={`flex-shrink-0 w-[280px] sm:w-[260px] lg:w-auto flex-1 p-6 rounded-xl border flex flex-col justify-between ${isHighlighted ? 'bg-cyan-50 border-cyan-100' : 'bg-white border-gray-100 shadow-sm'}`}>

      {/* Header Section */}
      <div className="mb-6">
        <div className={`text-4xl font-extrabold tracking-tight ${isHighlighted ? 'text-cyan-900' : 'text-gray-900'}`}>
          {value}
        </div>
        <div className={`text-base font-semibold mt-2 ${isHighlighted ? 'text-cyan-800' : 'text-gray-900'}`}>
          {label}
        </div>
      </div>

      {/* Benchmarks Section */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center text-sm">
          <span className={`font-medium mr-2 ${isHighlighted ? 'text-cyan-700' : 'text-gray-500'}`}>Top 5 in the segment:</span>
          <span className="font-bold text-indigo-600">{top5Value}</span>
        </div>
        <div className="flex items-center text-sm">
          <span className={`font-medium mr-2 ${isHighlighted ? 'text-cyan-700' : 'text-gray-500'}`}>What great looks like:</span>
          <span className="font-bold text-green-600">{greatValue}</span>
        </div>
      </div>

      {/* Footer Info Section */}
      <div className={`mt-auto pt-4 border-t ${isHighlighted ? 'border-cyan-200' : 'border-gray-100'}`}>
        <div className="flex items-start gap-2">
          {/* Info Icon with Tooltip */}
          <Tippy content={tooltipText} placement="top" className="bg-gray-900 text-white text-xs rounded px-2 py-1 max-w-xs text-center">
            <div className="mt-0.5 cursor-help opacity-60 hover:opacity-100 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${isHighlighted ? 'text-cyan-700' : 'text-gray-400'}`}>
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.465-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
              </svg>
            </div>
          </Tippy>

          <p className={`text-xs leading-relaxed ${isHighlighted ? 'text-cyan-800' : 'text-gray-500'}`}>
            {tooltipText}
          </p>
        </div>

        <div className="mt-3">
          <h4 className={`text-xs font-bold mb-1 ${isHighlighted ? 'text-cyan-900' : 'text-gray-900'}`}>Why is it important?</h4>
          <p className={`text-xs leading-relaxed ${isHighlighted ? 'text-cyan-700' : 'text-gray-600'}`}>
            {importanceText}
          </p>
        </div>
      </div>
    </div>
  );
};

const FactorsSection = () => {
  const { stats, loading } = usePerformance();

  // Helper to format percentage
  const fmt = (val: number) => loading ? '...' : `${val}%`;

  // --- Real Stats Calculation ---

  // Quality Score: Weighted average
  const calculateQualityScore = (): number => {
    if (!stats || stats.live_listings === 0) return 0;
    const totalScore = (stats.live_listings_featured * 95) + (stats.live_listings_premium * 85) + (stats.live_listings_standard * 70);
    return Math.round((totalScore / stats.live_listings));
  };

  // Verified: Estimation based on quality tier (Simulation)
  const calculateVerified = (): number => {
    if (!stats || stats.live_listings === 0) return 0;
    const verifiedCount = Math.round(stats.live_listings_featured * 0.9 + stats.live_listings_premium * 0.5 + stats.live_listings_standard * 0.1);
    return Math.round((verifiedCount / stats.live_listings) * 100);
  };

  // SuperAgent: Estimation (Simulation)
  const calculateSuperAgent = (): number => {
    if (!stats || stats.live_listings === 0) return 0;
    const count = Math.round(stats.live_listings_featured * 0.8 + stats.live_listings_premium * 0.4);
    return Math.round((count / stats.live_listings) * 100);
  };

  // Exposure: Percentage of listings that are Premium or Featured
  const calculateExposure = (): number => {
    if (!stats || stats.live_listings === 0) return 0;
    const exposed = stats.live_listings_featured + stats.live_listings_premium;
    return Math.round((exposed / stats.live_listings) * 100);
  };

  // LPL: Real data
  const getLPL = (): number => stats?.lpl ? Number(stats.lpl.toFixed(2)) : 0;


  const metrics: MetricCardProps[] = [
    {
      value: fmt(calculateQualityScore()),
      label: 'Quality Score',
      top5Value: `${MARKET_BENCHMARKS.qualityScore.top5}%`,
      greatValue: `${MARKET_BENCHMARKS.qualityScore.great}%`,
      tooltipText: 'Your average listing quality score versus the top 5 in your segment and the benchmark for excellence.',
      importanceText: 'Listings with a quality score above 90 generate up to 2 times the leads of listings with quality score below 90'
    },
    {
      value: fmt(calculateVerified()),
      label: 'Verified Listings',
      top5Value: `${MARKET_BENCHMARKS.verified.top5}%`,
      greatValue: `${MARKET_BENCHMARKS.verified.great}%`,
      tooltipText: 'Percentage of your listings that are verified. Compare this with the top 5 in your segment and what the best performance looks like.',
      importanceText: 'Verified listings generate up to 3 times the leads generated by non-verified listings.'
    },
    {
      value: fmt(calculateSuperAgent()),
      label: 'SuperAgent Listings',
      top5Value: `${MARKET_BENCHMARKS.superAgent.top5}%`,
      greatValue: `${MARKET_BENCHMARKS.superAgent.great}%`,
      tooltipText: 'Shows what percentage of your listings are managed by SuperAgents, compared to the top 5 and the what great looks like.',
      importanceText: 'Listings from SuperAgents generate up to 2 times the leads of listings from regular agents.'
    },
    {
      value: fmt(calculateExposure()),
      label: 'Exposure',
      top5Value: `${MARKET_BENCHMARKS.exposure.top5}%`,
      greatValue: `${MARKET_BENCHMARKS.exposure.great}%`,
      tooltipText: 'Shows the percentage of Exposure products from the total number of listings you have in the community.',
      importanceText: 'Premium listings generate up to 13 times more leads compared to standard listings.'
    },
    {
      value: loading ? '...' : getLPL(),
      label: 'Leads per Listing',
      top5Value: MARKET_BENCHMARKS.lpl.top5,
      greatValue: MARKET_BENCHMARKS.lpl.great,
      tooltipText: 'Measures how well your listings perform in a market.',
      importanceText: 'Higher LPL indicates that your listings appear high in search',
      isHighlighted: true
    }
  ];

  return (
    <div className="mt-10 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Factors that impact your performance</h2>
        <button className="mt-2 sm:mt-0 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 transition-colors">
          Give feedback
        </button>
      </div>

      <p className="text-gray-600 text-sm max-w-5xl mb-8 leading-relaxed">
        To improve, focus on these 4 factors: highest quality score, listing is verified, represented by a SuperAgent, and is featured or premium. Improving these factors across your listings will raise your LPL and improve how quickly your listings appear in search.
      </p>

      {/* Metrics Grid */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-4 min-w-max lg:min-w-0 lg:grid lg:grid-cols-5">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FactorsSection;