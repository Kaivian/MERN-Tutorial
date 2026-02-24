// client/src/hooks/useCurriculum.ts
import { useState, useEffect } from "react";
import { curriculumService } from "@/services/curriculum.service";
import { CurriculumProgramsResponse, SemesterData, SubjectData } from "@/types/curriculum.types";

export function useCurriculumPrograms() {
    const [data, setData] = useState<CurriculumProgramsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchPrograms = async () => {
            setIsLoading(true);
            try {
                const response = await curriculumService.getPrograms();
                // Since interceptor might return directly data or axios response, 
                // we check response.data (our ApiResponse wrapping)
                // If the interceptor unwrap directly to our custom object, response IS theApiResponse
                const payload = (response as any).data || response;
                setData(payload);
            } catch (err: any) {
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPrograms();
    }, []);

    return { data, isLoading, error };
}

export function useCurriculumSemesters(code?: string) {
    const [data, setData] = useState<SemesterData[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!code) {
            setData([]);
            return;
        }

        const fetchSemesters = async () => {
            setIsLoading(true);
            try {
                const response = await curriculumService.getSemesters(code);
                const payload = (response as any).data || response;
                setData(payload || []);
            } catch (err) {
                console.error("Failed to fetch semesters:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSemesters();
    }, [code]);

    return { data, isLoading };
}

export function useCurriculumSubjects(code?: string, semester?: string) {
    const [data, setData] = useState<SubjectData[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!code) {
            setData([]);
            return;
        }

        const fetchSubjects = async () => {
            setIsLoading(true);
            try {
                // Parse semester index from 'sem_1'
                let semIndex: number | undefined;
                if (semester) {
                    const parts = semester.split('_');
                    if (parts.length > 1) {
                        semIndex = parseInt(parts[1], 10);
                    }
                }

                const response = await curriculumService.getSubjects(code, semIndex);
                const payload = (response as any).data || response;
                setData(payload || []);
            } catch (err) {
                console.error("Failed to fetch subjects:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubjects();
    }, [code, semester]);

    return { data, isLoading };
}
