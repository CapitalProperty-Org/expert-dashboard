// src/utils/formatDate.ts
import { formatDistanceToNow } from 'date-fns';

export const formatRelativeTime = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
        console.error("Invalid date string:", dateString);
        return dateString; // Return original string if date is invalid
    }
};