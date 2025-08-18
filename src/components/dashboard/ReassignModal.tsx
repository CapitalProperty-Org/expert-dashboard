import React, { useState, useEffect } from 'react';
import CustomSelect from '../ui/CustomSelect';
import axios from 'axios';

interface Agent {
    id: number;
    name: string;
}

interface ReassignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReassign: (agentId: string) => void;
    selectedCount: number;
    isReassigning: boolean;
}

const ReassignModal = ({ isOpen, onClose, onReassign, selectedCount, isReassigning }: ReassignModalProps) => {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loadingAgents, setLoadingAgents] = useState(false);
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadAgents();
        }
    }, [isOpen]);

    const loadAgents = async () => {
        try {
            setLoadingAgents(true);
            setError(null);
            
            const apiUrl = `${import.meta.env.VITE_BASE_URL}/api/users`;
            console.log('🔍 Loading agents from:', apiUrl);
            console.log('🌍 Environment VITE_BASE_URL:', import.meta.env.VITE_BASE_URL);
            
            const response = await axios.get(apiUrl);
            
            console.log('📡 Raw API Response:', response);
            console.log('📊 Response Data:', response.data);
            console.log('🔢 Response Status:', response.status);
            
            // Check if response.data is an array directly
            if (Array.isArray(response.data)) {
                console.log('✅ Response.data is an array, length:', response.data.length);
                const usersData = response.data;
                
                // Log first few users for debugging
                usersData.slice(0, 3).forEach((user, index) => {
                    console.log(`👤 User ${index + 1}:`, {
                        id: user.id,
                        role: user.role,
                        status: user.status,
                        first_name: user.first_name,
                        last_name: user.last_name
                    });
                });
                
                // Filter only agents (role.id === 3) and active users
                const agentsData = usersData
                    .filter((user: any) => {
                        const isAgent = user.role && user.role.id === 3;
                        const isActive = user.status === 'active';
                        console.log(`🔍 User ${user.id}: role.id=${user.role?.id}, status=${user.status}, isAgent=${isAgent}, isActive=${isActive}`);
                        return isAgent && isActive;
                    })
                    .map((agent: { id: number; name?: string; first_name?: string; last_name?: string; pf_agent_id?: string }) => ({
                        id: agent.id,
                        name: agent.name || `${agent.first_name} ${agent.last_name}`.trim() || `Agent ${agent.pf_agent_id || agent.id}`
                    }));
                
                console.log('🎯 Filtered Agents:', agentsData);
                
                if (agentsData.length === 0) {
                    setError('No active agents available. Please contact your administrator.');
                } else {
                    setAgents(agentsData);
                }
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                console.log('✅ Response.data.data is an array, length:', response.data.data.length);
                const usersData = response.data.data;
                
                // Same filtering logic for wrapped response
                const agentsData = usersData
                    .filter((user: any) => {
                        const isAgent = user.role && user.role.id === 3;
                        const isActive = user.status === 'active';
                        return isAgent && isActive;
                    })
                    .map((agent: { id: number; name?: string; first_name?: string; last_name?: string; pf_agent_id?: string }) => ({
                        id: agent.id,
                        name: agent.name || `${agent.first_name} ${agent.last_name}`.trim() || `Agent ${agent.pf_agent_id || agent.id}`
                    }));
                
                if (agentsData.length === 0) {
                    setError('No active agents available. Please contact your administrator.');
                } else {
                    setAgents(agentsData);
                }
            } else {
                console.error('❌ Invalid response format:', response.data);
                setError('Invalid response format from server. Please try again.');
            }
        } catch (error: any) {
            console.error('💥 Error loading agents:', error);
            console.error('📡 Error response:', error.response?.data);
            console.error('🔢 Error status:', error.response?.status);
            console.error('📝 Error message:', error.message);
            
            if (error.response?.status === 404) {
                setError('Users API endpoint not found. Please check the URL.');
            } else if (error.response?.status === 401) {
                setError('Unauthorized. Please check your authentication.');
            } else if (error.response?.status >= 500) {
                setError('Server error. Please try again later.');
            } else {
                setError(`Failed to load agents: ${error.message || 'Unknown error'}`);
            }
            
            // Fallback to sample data if API fails
            setAgents([
                { id: 1, name: 'John Doe (Sample)' },
                { id: 2, name: 'Jane Smith (Sample)' },
                { id: 3, name: 'Mike Johnson (Sample)' }
            ]);
        } finally {
            setLoadingAgents(false);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (selectedAgentId) {
            onReassign(selectedAgentId);
        }
    };

    const resetForm = () => {
        setSelectedAgentId(null);
        setError(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const agentOptions = agents.map(agent => ({
        value: agent.id.toString(),
        label: agent.name
    }));

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={handleClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col p-8" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Reassign Listings</h2>
                <p className="text-sm text-gray-600 mb-6 text-center">
                    You are about to reassign {selectedCount} listing(s). Please select the new agent.
                </p>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}
                
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Agent <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect 
                        options={agentOptions}
                        placeholder="Choose an agent"
                        value={selectedAgentId ? { value: selectedAgentId, label: agents.find(a => a.id.toString() === selectedAgentId)?.name || '' } : null}
                        onChange={(option) => setSelectedAgentId(option?.value.toString() || null)}
                        disabled={loadingAgents || agents.length === 0}
                    />
                    {loadingAgents && (
                        <p className="text-xs text-gray-500 mt-1">Loading agents...</p>
                    )}
                    {agents.length === 0 && !loadingAgents && !error && (
                        <p className="text-xs text-gray-500 mt-1">No agents available</p>
                    )}
                    {agents.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                            {agents.length} active agent{agents.length !== 1 ? 's' : ''} available
                        </p>
                    )}
                </div>
                
                <div className="flex justify-end gap-4">
                    <button 
                        onClick={handleClose} 
                        disabled={isReassigning} 
                        className="bg-white border border-gray-300 text-gray-700 font-semibold py-2.5 px-6 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={!selectedAgentId || isReassigning || agents.length === 0}
                        className="bg-violet-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-violet-700 transition-colors disabled:bg-gray-300"
                    >
                        {isReassigning ? 'Reassigning...' : 'Reassign'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReassignModal;