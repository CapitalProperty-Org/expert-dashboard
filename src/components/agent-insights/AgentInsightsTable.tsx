
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Search, Filter, X, CheckCircle, Clock, AlertCircle, Users } from "lucide-react";
import { useAgentInsights } from "../../context/AgentInsightsContext";
import QualityScoreProgressCircle from "../dashboard/QualityScoreCircle";

const AgentInsightsTable = () => {
    const { agentsData, loading, error, fetchAgentStats } = useAgentInsights();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [verificationFilter, setVerificationFilter] = useState("all");
    const [companyFilter, setCompanyFilter] = useState("all");
    const [companies, setCompanies] = useState<{ id: number, name: string }[]>([]);

    // Fetch companies for filtering
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/clients`);
                if (response.data && Array.isArray(response.data)) {
                    setCompanies(response.data);
                }
            } catch (err) {
                console.error("Failed to fetch companies:", err);
            }
        };
        fetchCompanies();
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAgentStats({ search: searchTerm });
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, fetchAgentStats]);

    // Fetch data when filters change
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setStatusFilter(val);
        fetchAgentStats({ status: val === 'all' ? '' : val });
    };

    const handleVerificationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setVerificationFilter(val);
        fetchAgentStats({ verification_status: val === 'all' ? '' : val });
    };

    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setCompanyFilter(val);
        fetchAgentStats({ company_id: val === 'all' ? '' : val });
    };

    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setVerificationFilter("all");
        setCompanyFilter("all");
        fetchAgentStats({ search: "", status: "", verification_status: "", company_id: "" });
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 justify-between items-center bg-gray-50/50">
                <div className="flex flex-col">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        SuperAgent Report
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] uppercase font-bold tracking-wider">
                            v2.0
                        </span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Performance metrics for your team.
                        <span className="text-indigo-600 cursor-pointer hover:underline ml-1">
                            Learn more about criteria
                        </span>
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Status Filter */}
                    <div className="relative group">
                        <select
                            value={statusFilter}
                            onChange={handleStatusChange}
                            className="appearance-none pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition-colors" size={16} />
                    </div>

                    {/* Verification Filter */}
                    <div className="relative group">
                        <select
                            value={verificationFilter}
                            onChange={handleVerificationChange}
                            className="appearance-none pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer"
                        >
                            <option value="all">Verification</option>
                            <option value="verified">Verified</option>
                            <option value="pending">Pending</option>
                            <option value="incomplete">Incomplete</option>
                        </select>
                        <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition-colors" size={16} />
                    </div>

                    {/* Company Filter */}
                    {companies.length > 0 && (
                        <div className="relative group">
                            <select
                                value={companyFilter}
                                onChange={handleCompanyChange}
                                className="appearance-none pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer w-44"
                            >
                                <option value="all">All Companies</option>
                                {companies.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition-colors" size={16} />
                        </div>
                    )}

                    {/* Search */}
                    <div className="relative w-64 group">
                        <input
                            type="text"
                            placeholder="Search agents..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition-colors" size={16} />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {(searchTerm || statusFilter !== 'all' || verificationFilter !== 'all') && (
                        <button
                            onClick={clearFilters}
                            className="text-sm font-medium text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                        >
                            <X size={14} />
                            Clear
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Agent</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-center">Verified</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-center">Response Rate</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-center">Listing Quality</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-center">Live Properties</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-center">Claim Transaction</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-center">SuperAgent Streak</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-center">WhatsApp Response Time</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-center">Agent Score</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {agentsData.map((agent) => (
                            <tr key={agent.agent_id} className="hover:bg-gray-50 transition-colors">
                                {/* Agent Name & Avatar */}
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={agent.profile_url || "https://ui-avatars.com/api/?name=" + agent.agent_name}
                                            alt={agent.agent_name}
                                            className="w-10 h-10 rounded-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${agent.agent_name}`;
                                            }}
                                        />
                                        <div>
                                            <p className="font-semibold text-indigo-900 text-sm">{agent.agent_name}</p>
                                            <p className="text-xs text-gray-500">Criteria: ?/?</p>
                                        </div>
                                    </div>
                                </td>

                                {/* Verified Status */}
                                <td className="py-4 px-4 text-center">
                                    <div className="flex flex-col items-center">
                                        {agent.verification ? (
                                            <span className="text-green-600 font-medium text-sm">✓ Yes</span>
                                        ) : (
                                            <span className="text-red-500 font-medium text-sm">✕ No</span>
                                        )}
                                        <span className="text-xs text-gray-500">{agent.verification ? "Verified" : "Not verified"}</span>
                                    </div>
                                </td>

                                {/* Response Rate */}
                                <td className="py-4 px-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <QualityScoreProgressCircle score={agent.responseRate} size={40} />
                                        <span className="text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                            +{agent.responseRatePoints} points
                                        </span>
                                    </div>
                                </td>

                                {/* Listing Quality */}
                                <td className="py-4 px-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <QualityScoreProgressCircle score={agent.listingQuality} size={40} />
                                        <span className="text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                            +{agent.listingQualityPoints} points
                                        </span>
                                    </div>
                                </td>

                                {/* Live Properties */}
                                <td className="py-4 px-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-sm font-medium text-gray-800">{agent.propertiesLiveCount}</span>
                                        <span className="text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                            +{agent.livePropertiesPoints} points
                                        </span>
                                    </div>
                                </td>

                                {/* Claim Transaction */}
                                <td className="py-4 px-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-sm font-medium text-gray-800">{agent.claimTransactions}</span>
                                        <span className="text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                            +{agent.claimTransactionPoints} points
                                        </span>
                                    </div>
                                </td>

                                {/* SuperAgent Streak */}
                                <td className="py-4 px-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <span role="img" aria-label="streak" className="text-lg">🔥</span>
                                        <span className="text-sm font-medium text-gray-800">{agent.superAgentStreakWeeks} Weeks</span>
                                        <span className="text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                            +{agent.superAgentStreakPoints} points
                                        </span>
                                    </div>
                                </td>

                                {/* WhatsApp Response Time */}
                                <td className="py-4 px-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-sm font-medium text-gray-800">{agent.whatsappResponseTime}</span>
                                        <span className="text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                            +{agent.whatsappResponsePoints} points
                                        </span>
                                    </div>
                                </td>

                                {/* Agent Score */}
                                <td className="py-4 px-4 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className="text-indigo-700 font-bold text-lg">{agent.agentScore}</span>
                                        <span className="text-xs text-gray-500">Total Points</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AgentInsightsTable;
