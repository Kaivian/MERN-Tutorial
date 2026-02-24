// client/src/services/curriculum.service.ts
import axiosClient from "@/utils/axios-client.utils";
import { CurriculumProgramsResponse, SemesterData, SubjectData } from "@/types/curriculum.types";
import { ApiResponse } from "@/types/api.types";

const ENDPOINTS = {
    PROGRAMS: '/curriculums/programs',
    SEMESTERS: (code: string) => `/curriculums/${code}/semesters`,
    SUBJECTS: (code: string) => `/curriculums/${code}/subjects`,
} as const;

export const curriculumService = {
    /**
     * Fetch grouped programs
     */
    getPrograms: async (): Promise<ApiResponse<CurriculumProgramsResponse>> => {
        return axiosClient.get(ENDPOINTS.PROGRAMS) as Promise<ApiResponse<CurriculumProgramsResponse>>;
    },

    /**
     * Fetch available semesters for a curriculum
     */
    getSemesters: async (code: string): Promise<ApiResponse<SemesterData[]>> => {
        return axiosClient.get(ENDPOINTS.SEMESTERS(code)) as Promise<ApiResponse<SemesterData[]>>;
    },

    /**
     * Fetch subjects for a curriculum, optionally filtered by semester
     */
    getSubjects: async (code: string, semester?: number): Promise<ApiResponse<SubjectData[]>> => {
        const params = semester ? { semester } : {};
        return axiosClient.get(ENDPOINTS.SUBJECTS(code), { params }) as Promise<ApiResponse<SubjectData[]>>;
    }
};
