// client/src/hooks/useCurriculum.ts
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { curriculumService, hierarchyService } from "@/services/curriculum.service";
import { CurriculumProgramsResponse, SemesterData, SubjectData, MajorCategory, Major, AdminClass } from "@/types/curriculum.types";

// ============================================================
// EXISTING hooks (student-facing helpers for old curriculum data)
// ============================================================

export function useCurriculumPrograms() {
    const [data, setData] = useState<CurriculumProgramsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchPrograms = async () => {
            setIsLoading(true);
            try {
                const response = await curriculumService.getPrograms();
                const payload = (response as { data?: unknown }).data || response;
                setData(payload as CurriculumProgramsResponse);
            } catch (err: unknown) {
                setError(err instanceof Error ? err : new Error(String(err)));
            } finally {
                setIsLoading(false);
            }
        };
        fetchPrograms();
    }, []);

    return { data, isLoading, error };
}

export function useCurriculumSemesters(classId?: string, totalSemesters?: number) {
    // Always call hooks unconditionally
    const [legacyData, setLegacyData] = useState<SemesterData[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // If totalSemesters is available, generate terms offline (new hierarchy path)
    const isNewHierarchy = !!classId && !!totalSemesters;
    const generatedData: SemesterData[] = isNewHierarchy
        ? Array.from({ length: totalSemesters! }, (_, i) => ({
            key: `sem_${i + 1}`,
            label: `Semester ${i + 1}`,
            shortLabel: `S${i + 1}`,
            semesterIndex: i + 1,
        }))
        : [];

    useEffect(() => {
        // Only fetch from old API if we're in legacy mode (no totalSemesters)
        if (!classId || isNewHierarchy) {
            setLegacyData([]);
            return;
        }

        const fetchSemesters = async () => {
            setIsLoading(true);
            try {
                const response = await curriculumService.getSemesters(classId);
                const payload = (response as { data?: unknown }).data || response;
                setLegacyData((payload as SemesterData[]) || []);
            } catch (err) {
                console.error("Failed to fetch semesters:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSemesters();
    }, [classId, isNewHierarchy]);

    return {
        data: isNewHierarchy ? generatedData : legacyData,
        isLoading
    };
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
                let semIndex: number | undefined;
                if (semester) {
                    const parts = semester.split('_');
                    if (parts.length > 1) {
                        semIndex = parseInt(parts[1], 10);
                    }
                }

                const response = await curriculumService.getSubjects(code, semIndex);
                const payload = (response as { data?: unknown }).data || response;
                setData((payload as SubjectData[]) || []);
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

// ============================================================
// NEW: Admin Hierarchy hooks (for student-facing profile selects)
// ============================================================

export function useAdminHierarchyCategories() {
    return useQuery<MajorCategory[]>({
        queryKey: ["hierarchy-categories"],
        queryFn: async () => {
            const res = await hierarchyService.getCategories();
            return res.data || [];
        },
        staleTime: 5 * 60 * 1000,
    });
}

export function useAdminHierarchyMajors(categoryId?: string) {
    return useQuery<Major[]>({
        queryKey: ["hierarchy-majors", categoryId],
        queryFn: async () => {
            const res = await hierarchyService.getMajors(categoryId);
            return res.data || [];
        },
        enabled: !!categoryId,
        staleTime: 5 * 60 * 1000,
    });
}

export function useAdminHierarchyClasses(majorId?: string) {
    return useQuery<AdminClass[]>({
        queryKey: ["hierarchy-classes", majorId],
        queryFn: async () => {
            const res = await hierarchyService.getClasses(majorId);
            return res.data || [];
        },
        enabled: !!majorId,
        staleTime: 5 * 60 * 1000,
    });
}

