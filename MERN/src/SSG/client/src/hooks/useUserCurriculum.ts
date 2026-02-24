// client/src/hooks/useUserCurriculum.ts
import { useState, useEffect, useCallback } from 'react';
import { userCurriculumService } from '@/services/user-curriculum.service';
import { UserCurriculumData, UserCurriculumContext, UpdateGradePayload } from '@/types/user-curriculum.types';

export function useUserCurriculum() {
    const [data, setData] = useState<UserCurriculumData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchContext = useCallback(async (term?: string) => {
        setIsLoading(true);
        try {
            const response = await userCurriculumService.getContext(term);
            const payload = (response as any).data || response;
            setData(payload);
        } catch (err: any) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchContext();
    }, [fetchContext]);

    const updateContext = async (contextUpdates: Partial<UserCurriculumContext>) => {
        try {
            if (!data) return;
            const newContext = { ...data.active_context, ...contextUpdates };

            // Optimistically update local state to feel snappy
            setData({ ...data, active_context: newContext });

            const response = await userCurriculumService.updateContext(newContext);

            // After context updates, it's safer to re-fetch the whole thing 
            // because the backend calculates what 'subjects' should now be loaded 
            // based on the new class/term context.
            await fetchContext();
        } catch (err) {
            console.error('Failed to update context', err);
        }
    };

    const saveGrades = async (subjectId: string, payload: UpdateGradePayload) => {
        try {
            await userCurriculumService.saveGrades(subjectId, payload);
            // Instead of just relying on the direct response payload mapping,
            // force a complete refetch to ensure all sibling components get the freshest derived data.
            await fetchContext(data?.current_view_term);
            return true;
        } catch (err) {
            console.error('Failed to save grades', err);
            throw err;
        }
    };

    return {
        data,
        isLoading,
        error,
        updateContext,
        saveGrades,
        refetch: fetchContext
    };
}
