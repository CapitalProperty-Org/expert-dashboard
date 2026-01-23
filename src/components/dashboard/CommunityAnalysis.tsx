import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import L from 'leaflet';

const SIDEBAR_DATA = {
    rankings: {
        listings: { percentage: "0.02%", rank: "162nd" },
        leads: { percentage: "0.6%", rank: "42nd" },
        lpl: { rank: "1st", isTop: true }
    },
    marketTrends: {
        listings: { value: "1.85K", change: "+10%" },
        leads: { value: "12.9K", change: "+15%" }
    },
    improvements: [
        {
            title: "Quality Score",
            status: "BELOW AVERAGE",
            description: "Listings with a quality score above 90 generate more leads than listings with quality score below 90.",
            isOpen: true
        },
        {
            title: "Verified Listings",
            status: "BELOW AVERAGE",
            description: "Increasing the number of Verified Listings will help you get more share of leads.",
            isOpen: false
        },
        {
            title: "SuperAgents' Listings",
            status: "BELOW AVERAGE",
            description: "Listings from SuperAgents generate more the leads than listings from regular agents.",
            isOpen: false
        },
        {
            title: "Exposure",
            status: "BELOW AVERAGE",
            description: "Premium/Featured listings generate higher exposure than Standard listings.",
            isOpen: false
        }
    ]
};

// Dubai Community Coordinates Mapping (Fallback)
const DUBAI_COMMUNITY_COORDS: Record<string, { lat: number; lng: number }> = {
    'Dubai Marina': { lat: 25.0887, lng: 55.1465 },
    'Downtown Dubai': { lat: 25.1972, lng: 55.2744 },
    'Jumeirah': { lat: 25.2854, lng: 55.2639 },
    'Palm Jumeirah': { lat: 25.1124, lng: 55.1493 },
    'Business Bay': { lat: 25.1891, lng: 55.2756 },
    'Dubai Hills Estate': { lat: 25.1134, lng: 55.2484 },
    'Arabian Ranches': { lat: 25.0707, lng: 55.1484 },
    'Emirates Hills': { lat: 25.0848, lng: 55.1423 },
    'Dubai Land': { lat: 25.0083, lng: 55.3053 },
    'The Springs': { lat: 25.0574, lng: 55.1810 },
    'The Meadows': { lat: 25.0465, lng: 55.1734 },
    'Jumeirah Park': { lat: 25.0481, lng: 55.1544 },
    'Jumeirah Village Circle': { lat: 25.0488, lng: 55.2065 },
    'Jumeirah Village Triangle': { lat: 25.0366, lng: 55.1767 },
    'Dubai Sports City': { lat: 25.0709, lng: 55.2160 },
    'Motor City': { lat: 25.0710, lng: 55.2210 },
    'International City': { lat: 25.0167, lng: 55.3378 },
    'Al Barsha': { lat: 25.0866, lng: 55.2319 },
    'Deira': { lat: 25.2654, lng: 55.3138 },
    'Bur Dubai': { lat: 25.2808, lng: 55.2938 },
    'Ras Al Khaimah': { lat: 25.7482, lng: 55.9408 },
    'Sharjah': { lat: 25.3571, lng: 55.3986 },
    'Ajman': { lat: 25.4167, lng: 55.4500 },
    'Fujairah': { lat: 25.1242, lng: 56.3529 },
    'Umm Al Quwain': { lat: 25.5649, lng: 55.5517 },
    // Add fallbacks for common variations
    'dubai': { lat: 25.2048, lng: 55.2708 },
    'abudhabi': { lat: 24.4539, lng: 54.3773 }
};

const getCoordinatesForCommunity = (communityName: string): { lat: number; lng: number } => {
    // Try exact match first
    if (DUBAI_COMMUNITY_COORDS[communityName]) {
        return DUBAI_COMMUNITY_COORDS[communityName];
    }

    // Try case-insensitive partial match
    const lowerName = communityName.toLowerCase().trim();
    for (const [key, coords] of Object.entries(DUBAI_COMMUNITY_COORDS)) {
        if (key.toLowerCase().includes(lowerName) || lowerName.includes(key.toLowerCase())) {
            return coords;
        }
    }

    // Default to Dubai center
    return { lat: 25.2048, lng: 55.2708 };
};

// --- Sub-Components ---

const RankCard = ({ label, value, subValue, rank, isTop = false }: { label: string, value: string | number, subValue?: string, rank: string, isTop?: boolean }) => (
    <div className="bg-gray-50 rounded-lg p-3 flex flex-col items-center text-center">
        <div className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">{label}</div>
        <div className="text-gray-900 font-bold text-lg leading-tight">
            {value} <span className="text-gray-500 font-normal text-sm">{subValue}</span>
        </div>
        <div className={`mt-2 text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${isTop ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-gray-200 text-gray-700'}`}>
            {isTop && <span>🏆</span>} {rank} rank
        </div>
    </div>
);

const TrendCard = ({ label, value, change }: { label: string, value: string, change: string }) => (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center flex-1">
        <div className="text-gray-500 text-sm font-medium mb-1">{label}</div>
        <div className="text-gray-900 text-2xl font-bold mb-1">{value}</div>
        <div className="inline-block bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {change}
        </div>
    </div>
);

const ImprovementItem = ({ item }: { item: typeof SIDEBAR_DATA.improvements[0] }) => {
    const [isOpen, setIsOpen] = useState(item.isOpen);

    return (
        <div className="border border-gray-200 rounded-lg mb-3 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className="text-gray-700 font-medium">{item.title}</span>
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                        {item.status} <span className="text-xs">🔥</span>
                    </span>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>

            {isOpen && (
                <div className="p-4 pt-0 bg-white text-sm text-gray-500 leading-relaxed border-t border-gray-100">
                    {item.description}
                </div>
            )}
        </div>
    );
};

interface CommunityStats {
    id: number;
    name: string;
    listings: number;
    leads: number;
    lpl: number;
    image?: string;
    lat?: number;
    lng?: number;
}

const CommunityAnalysis = () => {
    const [viewMode, setViewMode] = useState<'map' | 'table'>('table');
    const [selectedCommunity, setSelectedCommunity] = useState<number | null>(null);
    const [communityData, setCommunityData] = useState<CommunityStats[]>([]);
    const [loading, setLoading] = useState(true);
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);

    // Market Trends State
    const [marketTrends, setMarketTrends] = useState<{
        listings: { value: string; change: string };
        leads: { value: string; change: string };
    } | null>(null);

    // Fetch Market Trends
    useEffect(() => {
        const fetchMarketTrends = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/overview/market-trends`);
                setMarketTrends(response.data);
            } catch (error) {
                console.error("Failed to fetch market trends", error);
                // Fallback to static data on error
                setMarketTrends(SIDEBAR_DATA.marketTrends);
            }
        };
        fetchMarketTrends();
    }, []);

    useEffect(() => {
        const fetchCommunities = async () => {
            try {
                // Fetch community stats from the backend
                // This payload now includes lat/lng from the updated overview service
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/overview/communities`);

                // Process data to ensure unique IDs and valid coordinates
                const dataWithCoords = response.data.map((community: CommunityStats, index: number) => {
                    // Ensure unique ID if missing
                    const cId = community.id || index + 1;

                    // If backend provided coordinates, use them
                    if (community.lat && community.lng) {
                        return { ...community, id: cId };
                    }

                    // Fallback to local coordinate lookup if backend is missing data
                    const coords = getCoordinatesForCommunity(community.name);
                    return {
                        ...community,
                        id: cId,
                        lat: coords.lat,
                        lng: coords.lng
                    };
                });

                setCommunityData(dataWithCoords);
                if (dataWithCoords.length > 0) {
                    setSelectedCommunity(dataWithCoords[0].id); // Default select first
                }
            } catch (error) {
                console.error("Failed to fetch community data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCommunities();
    }, []);

    // Initialize map when viewMode is 'map'
    useEffect(() => {
        // Only run if in map mode and data is loaded
        if (viewMode !== 'map' || communityData.length === 0) return;

        const mapContainerId = 'map-container';
        const mapContainer = document.getElementById(mapContainerId);
        if (!mapContainer) return;

        // Cleanup existing map
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
            markersRef.current = [];
        }

        // Determine initial center
        let initialCenter: [number, number] = [25.2048, 55.2708]; // Dubai Default
        let initialZoom = 11;

        if (selectedCommunity) {
            const selected = communityData.find(c => c.id === selectedCommunity);
            if (selected && selected.lat && selected.lng) {
                initialCenter = [selected.lat, selected.lng];
                initialZoom = 13;
            }
        }

        // Create Map
        const map = L.map(mapContainerId).setView(initialCenter, initialZoom);
        mapRef.current = map;

        // Add Tile Layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Add Markers for ALL communities
        communityData.forEach(community => {
            if (community.lat && community.lng) {
                const marker = L.marker([community.lat, community.lng])
                    .addTo(map)
                    .bindPopup(`
                        <div class="text-center">
                            <strong>${community.name}</strong><br/>
                            Listings: ${community.listings}<br/>
                            Leads: ${community.leads}
                        </div>
                    `);

                // Add click handler to select community on click
                marker.on('click', () => {
                    setSelectedCommunity(community.id);
                });

                markersRef.current.push(marker);

                // Open popup if selected
                if (community.id === selectedCommunity) {
                    marker.openPopup();
                }
            }
        });

        // Cleanup
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                markersRef.current = [];
            }
        };
    }, [viewMode, communityData]); // Re-initialize if data or mode changes. Note: We handle selection change separately?
    // Actually, reconstructing the map on every selection change is bad UX (flicker).
    // Better to handle selection change separately.

    // Effect to update map view when selectedCommunity changes WITHOUT destroying map
    useEffect(() => {
        if (viewMode === 'map' && mapRef.current && selectedCommunity) {
            const selected = communityData.find(c => c.id === selectedCommunity);
            if (selected && selected.lat && selected.lng) {
                mapRef.current.flyTo([selected.lat, selected.lng], 13, {
                    animate: true,
                    duration: 1.5
                });

                // Find and open popup
                // Note: We don't have easy reference to markers by ID unless we store them mapped. 
                // But since we re-render map on viewMode change, it's ok.
                // Ideally we should store markers in a Map<id, marker>.
            }
        }
    }, [selectedCommunity, viewMode, communityData]);


    // Map View Component
    const MapView = () => {
        return (
            <div
                id="map-container"
                style={{
                    width: '100%',
                    height: '400px',
                    borderRadius: '8px',
                    zIndex: 0
                }}
            />
        );
    };

    const selectedData = communityData.find(c => c.id === selectedCommunity);
    const displayTrends = marketTrends || SIDEBAR_DATA.marketTrends;

    return (
        <div className="mt-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900">Community & Market Analysis</h2>
                    <button className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">
                        Give feedback
                    </button>
                </div>
            </div>
            <p className="text-gray-600 text-sm mb-6">
                Explore your listing performance by community. Click on any community on the map to view detailed performance and market trends
            </p>

            {/* Main Layout */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">

                {/* LEFT COLUMN: Table/Map (65%) */}
                <div className="w-full lg:w-[65%] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
                    {/* Toolbar */}
                    <div className="flex justify-end p-4 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                            <button
                                onClick={() => setViewMode('map')}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'map' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Map
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'table' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Table
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="overflow-x-auto min-h-[300px]">
                        {viewMode === 'map' ? (
                            <div className="p-4">
                                <MapView />
                            </div>
                        ) : loading ? (
                            <div className="flex items-center justify-center p-10 text-gray-400">Loading communities...</div>
                        ) : communityData.length === 0 ? (
                            <div className="flex items-center justify-center p-10 text-gray-400">No community data available.</div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-left">
                                        <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Community</th>
                                        <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Your Listings</th>
                                        <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Your Leads</th>
                                        <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">LPL</th>
                                        <th className="py-4 px-6"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {communityData.map((row) => (
                                        <tr
                                            key={row.id}
                                            className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedCommunity === row.id ? 'bg-indigo-50/30' : ''}`}
                                            onClick={() => setSelectedCommunity(row.id)}
                                        >
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    {/* Using a consistent image for now as DB doesn't have community images */}
                                                    <img src="https://images.unsplash.com/photo-1512453979798-5ea904ac6605?q=80&w=200&auto=format&fit=crop" alt={row.name} className="w-10 h-10 rounded-lg object-cover shadow-sm" />
                                                    <span className="font-semibold text-gray-900">{row.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 font-medium text-gray-900">{row.listings}</td>
                                            <td className="py-4 px-6 font-medium text-gray-900">{row.leads}</td>
                                            <td className="py-4 px-6 font-bold text-gray-900">{row.lpl}</td>
                                            <td className="py-4 px-6 text-right">
                                                <button className="text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors">
                                                    View details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Sidebar Details (35%) */}
                {selectedData && (
                    <div className="w-full lg:w-[35%] bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col h-auto sticky top-20">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-900">
                                {selectedData.name}
                            </h3>
                        </div>

                        <div className="p-5 overflow-y-auto max-h-[800px] scrollbar-thin scrollbar-thumb-gray-200">

                            {/* Section 1: Where you rank */}
                            <div className="mb-8">
                                <h4 className="text-sm font-bold text-gray-900 mb-3">Where you rank?</h4>
                                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                                    Rankings are based on number of listings and leads you receive compared to other players in the community. Aim for a higher rank to increase your visibility and improve performance.
                                </p>
                                <div className="grid grid-cols-3 gap-3">
                                    <RankCard
                                        label="Listings"
                                        value={selectedData.listings || 0}
                                        subValue={SIDEBAR_DATA.rankings.listings.percentage}
                                        rank={SIDEBAR_DATA.rankings.listings.rank}
                                    />
                                    <RankCard
                                        label="Leads"
                                        value={selectedData.leads || 0}
                                        subValue={SIDEBAR_DATA.rankings.leads.percentage}
                                        rank={SIDEBAR_DATA.rankings.leads.rank}
                                    />
                                    <RankCard
                                        label="LPL"
                                        value={selectedData.lpl || 0}
                                        rank={SIDEBAR_DATA.rankings.lpl.rank}
                                        isTop={SIDEBAR_DATA.rankings.lpl.isTop}
                                    />
                                </div>
                            </div>

                            {/* Section 2: Where market is going */}
                            <div className="mb-8">
                                <h4 className="text-sm font-bold text-gray-900 mb-3">Where market is going?</h4>
                                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                                    This section shows the trends for the <strong>Last 30 Days</strong> compared to the previous period.
                                </p>
                                <div className="flex gap-4 mb-4">
                                    <TrendCard label="Listings" value={displayTrends.listings.value} change={displayTrends.listings.change} />
                                    <TrendCard label="Leads" value={displayTrends.leads.value} change={displayTrends.leads.change} />
                                </div>
                                <div className="bg-orange-50 rounded-lg p-4 flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                                    <div className="text-xs text-gray-700 leading-relaxed">
                                        <span className="font-bold block mb-1">Well done!</span>
                                        Leads delivered by PF grew (proving our platform's effectiveness). Well done, in this growing market, you were able improve your share of leads vs your competitors and also improved your return (LPL). <br /><br />
                                        Action: Continue doing more of the same - your lead generation efforts in this community are working.
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: How to improve */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-3">How to Improve your performance</h4>
                                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                                    We track ROI factors that impact your performance. Using indicators like 'above average,' 'average,' and 'below average,' we show where you stand compared to your competition.
                                </p>

                                <div>
                                    {SIDEBAR_DATA.improvements.map((item, idx) => (
                                        <ImprovementItem key={idx} item={item} />
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityAnalysis;
