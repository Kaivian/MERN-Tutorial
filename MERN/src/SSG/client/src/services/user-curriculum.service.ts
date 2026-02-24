// client/src/services/user-curriculum.service.ts
import axiosClient from "@/utils/axios-client.utils";
import { UserCurriculumData, UserCurriculumContext, UpdateGradePayload, UserAnalyticsData } from "@/types/user-curriculum.types";
import { ApiResponse } from "@/types/api.types";

const ENDPOINTS = {
    CONTEXT: '/user/curriculum',
    ANALYTICS: '/user/curriculum/analytics',
    UPDATE_CONTEXT: '/user/curriculum/context',
    SAVE_GRADES: (subjectId: string) => `/user/curriculum/subjects/${subjectId}/grades`,
} as const;

export const userCurriculumService = {
    /**
     * Fetches the user's saved context, subjects, and calculated Term GPA.
     */
    getContext: async (term?: string): Promise<ApiResponse<UserCurriculumData>> => {
        const url = term ? `${ENDPOINTS.CONTEXT}?term=${term}` : ENDPOINTS.CONTEXT;
        return axiosClient.get(url) as Promise<ApiResponse<UserCurriculumData>>;
    },

    /**
     * Fetches the user's term analytics and status aggregations.
     */
    getAnalytics: async (): Promise<ApiResponse<UserAnalyticsData>> => {
        return axiosClient.get(ENDPOINTS.ANALYTICS) as Promise<ApiResponse<UserAnalyticsData>>;
    },

    /**
     * Syncs the user's dropdown filter selections to the server.
     */
    updateContext: async (context: UserCurriculumContext): Promise<ApiResponse<UserCurriculumContext>> => {
        return axiosClient.patch(ENDPOINTS.UPDATE_CONTEXT, context) as Promise<ApiResponse<UserCurriculumContext>>;
    },

    /**
     * Saves or overwrites grades for a specific subject
     */
    saveGrades: async (subjectId: string, payload: UpdateGradePayload): Promise<ApiResponse<UserCurriculumData>> => {
        return axiosClient.post(ENDPOINTS.SAVE_GRADES(subjectId), payload) as Promise<ApiResponse<UserCurriculumData>>;
    }
};
