import { useState, useEffect } from 'react';
import { userCurriculumService } from '../services/user-curriculum.service';
import { UserAnalyticsData } from '../types/user-curriculum.types';

export function useUserAnalytics() {
    const [data, setData] = useState<UserAnalyticsData | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchAnalytics = async () => {
        setIsLoading(true);
        try {
            const response = await userCurriculumService.getAnalytics();
            if (response.status !== 'success') {
                throw new Error(response.message || 'Failed to fetch analytics');
            }
            setData(response.data);
        } catch (err: any) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    return {
        data,
        isLoading,
        error,
        refetch: fetchAnalytics
    };
}
