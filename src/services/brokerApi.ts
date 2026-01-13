import axios from 'axios';

export interface BrokerOption {
    id: string;
    name: string;
    licenseNumber: string;
    registrationNumber: string;
    status: 'active' | 'inactive';
}

export interface BrokerSearchResponse {
    content: BrokerOption[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

/**
 * Search brokers using DARI API for Abu Dhabi compliance
 */
export const searchBrokers = async (
    name: string,
    page: number = 0,
    size: number = 12,
    token: string
): Promise<BrokerSearchResponse> => {
    try {
        const response = await axios.get<BrokerSearchResponse>(
            `${import.meta.env.VITE_BASE_URL}/api/public/brokers/search`,
            {
                params: { name, page, size },
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Failed to search brokers:', error);
        throw error;
    }
};
