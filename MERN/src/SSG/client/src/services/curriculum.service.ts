// client/src/services/curriculum.service.ts
import axiosClient from "@/utils/axios-client.utils";
import {
    CurriculumProgramsResponse, SemesterData, SubjectData,
    MajorCategory, Major, AdminClass, ClassCurriculumResponse, AdminSubject
} from "@/types/curriculum.types";
import { ApiResponse } from "@/types/api.types";

export interface CurriculumData {
    curriculum_info: {
        code: string;
        name_vi: string;
        name_en: string;
        total_credits: number;
        decision_info?: {
            number?: string;
            date?: string;
        };
    };
    subjects?: string[]; // IDs
}

export interface SubjectAssessmentDetails {
    question_type?: string;
    question_count?: string | number;
    description?: string;
    knowledge_and_skill?: string;
}

export interface SubjectAssessmentPlan {
    category: string;
    type?: string;
    part_count?: number;
    weight_percent: number;
    completion_criteria?: string;
    duration?: string;
    clos_covered?: string;
    details?: SubjectAssessmentDetails;
    grading_guide?: string;
    note?: string;
}

export { type SubjectData } from "@/types/curriculum.types";

const ENDPOINTS = {
    // Student-facing endpoints
    PROGRAMS: '/curriculums/programs',
    CURRICULUMS: '/curriculums',
    SEMESTERS: (code: string) => `/curriculums/${code}/semesters`,
    SUBJECTS: (code: string) => `/curriculums/${code}/subjects`,
    SUBJECTS_BASE: '/curriculums/subjects',

    // Public hierarchy endpoints (auth only, no special permission)
    HIERARCHY_CATEGORIES: '/curriculums/hierarchy/categories',
    HIERARCHY_MAJORS: '/curriculums/hierarchy/majors',
    HIERARCHY_CLASSES: '/curriculums/hierarchy/classes',

    // Admin hierarchy endpoints (requires curriculums:manage)
    ADMIN: '/admin',
    ADMIN_SUBJECTS: '/admin/subjects',
    ADMIN_MAJOR_CATEGORIES: '/admin/major-categories',
    ADMIN_MAJORS: '/admin/majors',
    ADMIN_MAJOR_SUBJECTS: (majorId: string) => `/admin/majors/${majorId}/subjects`,
    ADMIN_CLASSES: '/admin/classes',
    ADMIN_CLASS_CURRICULUM: (classId: string) => `/admin/classes/${classId}/curriculum`,
    ADMIN_CLASS_SUBJECTS: (classId: string) => `/admin/classes/${classId}/curriculum/subjects`,
    ADMIN_CLASS_REORDER: (classId: string) => `/admin/classes/${classId}/curriculum/reorder`,
    ADMIN_CLASS_COPY: (classId: string, sourceId: string) => `/admin/classes/${classId}/curriculum/copy-from/${sourceId}`,
} as const;

// ================================================================
// Student-Facing Curriculum Service
// ================================================================
export const curriculumService = {
    getPrograms: async (): Promise<ApiResponse<CurriculumProgramsResponse>> => {
        return axiosClient.get(ENDPOINTS.PROGRAMS) as Promise<ApiResponse<CurriculumProgramsResponse>>;
    },
    createCurriculum: async (data: CurriculumData): Promise<ApiResponse<unknown>> => {
        return axiosClient.post(ENDPOINTS.CURRICULUMS, data) as Promise<ApiResponse<unknown>>;
    },
    updateCurriculum: async (code: string, data: Partial<CurriculumData>): Promise<ApiResponse<unknown>> => {
        return axiosClient.put(`${ENDPOINTS.CURRICULUMS}/${code}`, data) as Promise<ApiResponse<unknown>>;
    },
    deleteCurriculum: async (code: string): Promise<ApiResponse<unknown>> => {
        return axiosClient.delete(`${ENDPOINTS.CURRICULUMS}/${code}`) as Promise<ApiResponse<unknown>>;
    },
    getSemesters: async (code: string): Promise<ApiResponse<SemesterData[]>> => {
        return axiosClient.get(ENDPOINTS.SEMESTERS(code)) as Promise<ApiResponse<SemesterData[]>>;
    },
    getSubjects: async (code: string, semester?: number): Promise<ApiResponse<SubjectData[]>> => {
        const params = semester ? { semester } : {};
        return axiosClient.get(ENDPOINTS.SUBJECTS(code), { params }) as Promise<ApiResponse<SubjectData[]>>;
    },
    createSubject: async (code: string, data: SubjectData): Promise<ApiResponse<unknown>> => {
        return axiosClient.post(ENDPOINTS.SUBJECTS(code), data) as Promise<ApiResponse<unknown>>;
    },
    updateSubject: async (subjectId: string, data: Partial<SubjectData>): Promise<ApiResponse<unknown>> => {
        return axiosClient.put(`${ENDPOINTS.SUBJECTS_BASE}/${subjectId}`, data) as Promise<ApiResponse<unknown>>;
    },
    deleteSubject: async (code: string, subjectId: string): Promise<ApiResponse<unknown>> => {
        return axiosClient.delete(`${ENDPOINTS.SUBJECTS(code)}/${subjectId}`) as Promise<ApiResponse<unknown>>;
    }
};

// ================================================================
// Admin Curriculum Hierarchy Service
// ================================================================
export const adminCurriculumService = {

    // -- Global Subject Pool --
    getSubjectPool: async (search?: string): Promise<ApiResponse<AdminSubject[]>> => {
        const params = search ? { search } : {};
        return axiosClient.get(ENDPOINTS.ADMIN_SUBJECTS, { params }) as Promise<ApiResponse<AdminSubject[]>>;
    },

    // -- Major Categories --
    getMajorCategories: async (): Promise<ApiResponse<MajorCategory[]>> => {
        return axiosClient.get(ENDPOINTS.ADMIN_MAJOR_CATEGORIES) as Promise<ApiResponse<MajorCategory[]>>;
    },
    createMajorCategory: async (data: Partial<MajorCategory>): Promise<ApiResponse<MajorCategory>> => {
        return axiosClient.post(ENDPOINTS.ADMIN_MAJOR_CATEGORIES, data) as Promise<ApiResponse<MajorCategory>>;
    },
    updateMajorCategory: async (id: string, data: Partial<MajorCategory>): Promise<ApiResponse<MajorCategory>> => {
        return axiosClient.put(`${ENDPOINTS.ADMIN_MAJOR_CATEGORIES}/${id}`, data) as Promise<ApiResponse<MajorCategory>>;
    },
    deleteMajorCategory: async (id: string): Promise<ApiResponse<unknown>> => {
        return axiosClient.delete(`${ENDPOINTS.ADMIN_MAJOR_CATEGORIES}/${id}`) as Promise<ApiResponse<unknown>>;
    },

    // -- Majors --
    getMajors: async (categoryId?: string): Promise<ApiResponse<Major[]>> => {
        const params = categoryId ? { categoryId } : {};
        return axiosClient.get(ENDPOINTS.ADMIN_MAJORS, { params }) as Promise<ApiResponse<Major[]>>;
    },
    createMajor: async (data: Partial<Major> & { majorCategoryId: string }): Promise<ApiResponse<Major>> => {
        return axiosClient.post(ENDPOINTS.ADMIN_MAJORS, data) as Promise<ApiResponse<Major>>;
    },
    updateMajor: async (id: string, data: Partial<Major>): Promise<ApiResponse<Major>> => {
        return axiosClient.put(`${ENDPOINTS.ADMIN_MAJORS}/${id}`, data) as Promise<ApiResponse<Major>>;
    },
    deleteMajor: async (id: string): Promise<ApiResponse<unknown>> => {
        return axiosClient.delete(`${ENDPOINTS.ADMIN_MAJORS}/${id}`) as Promise<ApiResponse<unknown>>;
    },

    // -- Major Subjects --
    getMajorSubjects: async (majorId: string, search?: string): Promise<ApiResponse<AdminSubject[]>> => {
        const params = search ? { search } : {};
        return axiosClient.get(ENDPOINTS.ADMIN_MAJOR_SUBJECTS(majorId), { params }) as Promise<ApiResponse<AdminSubject[]>>;
    },
    moveSubjectSemester: async (majorId: string, subjectId: string, semester: number): Promise<ApiResponse<unknown>> => {
        return axiosClient.put(`${ENDPOINTS.ADMIN_MAJOR_SUBJECTS(majorId)}/${subjectId}/move`, { semester }) as Promise<ApiResponse<unknown>>;
    },

    // -- Classes --
    getClasses: async (majorId?: string): Promise<ApiResponse<AdminClass[]>> => {
        const params = majorId ? { majorId } : {};
        return axiosClient.get(ENDPOINTS.ADMIN_CLASSES, { params }) as Promise<ApiResponse<AdminClass[]>>;
    },
    createClass: async (data: Partial<AdminClass> & { majorId: string }): Promise<ApiResponse<AdminClass>> => {
        return axiosClient.post(ENDPOINTS.ADMIN_CLASSES, data) as Promise<ApiResponse<AdminClass>>;
    },
    updateClass: async (id: string, data: Partial<AdminClass>): Promise<ApiResponse<AdminClass>> => {
        return axiosClient.put(`${ENDPOINTS.ADMIN_CLASSES}/${id}`, data) as Promise<ApiResponse<AdminClass>>;
    },
    deleteClass: async (id: string): Promise<ApiResponse<unknown>> => {
        return axiosClient.delete(`${ENDPOINTS.ADMIN_CLASSES}/${id}`) as Promise<ApiResponse<unknown>>;
    },

    // -- Class Curriculum Builder --
    getClassCurriculum: async (classId: string): Promise<ApiResponse<ClassCurriculumResponse>> => {
        return axiosClient.get(ENDPOINTS.ADMIN_CLASS_CURRICULUM(classId)) as Promise<ApiResponse<ClassCurriculumResponse>>;
    },
    addSubjectToClass: async (classId: string, data: { subjectId: string; semester: number; order_index?: number }): Promise<ApiResponse<unknown>> => {
        return axiosClient.post(ENDPOINTS.ADMIN_CLASS_SUBJECTS(classId), data) as Promise<ApiResponse<unknown>>;
    },
    removeSubjectFromClass: async (classId: string, mappingId: string): Promise<ApiResponse<unknown>> => {
        return axiosClient.delete(`${ENDPOINTS.ADMIN_CLASS_SUBJECTS(classId)}/${mappingId}`) as Promise<ApiResponse<unknown>>;
    },
    reorderCurriculum: async (classId: string, updates: { mappingId: string; semester: number; order_index: number }[]): Promise<ApiResponse<unknown>> => {
        return axiosClient.put(ENDPOINTS.ADMIN_CLASS_REORDER(classId), { updates }) as Promise<ApiResponse<unknown>>;
    },
    copyCurriculumFromClass: async (classId: string, sourceClassId: string, overwrite = false): Promise<ApiResponse<{ copiedCount: number }>> => {
        return axiosClient.post(ENDPOINTS.ADMIN_CLASS_COPY(classId, sourceClassId), { overwrite }) as Promise<ApiResponse<{ copiedCount: number }>>;
    },
};

// ================================================================
// Public Hierarchy Service (student-facing, no admin perms needed)
// ================================================================
export const hierarchyService = {
    getCategories: async (): Promise<ApiResponse<MajorCategory[]>> => {
        return axiosClient.get(ENDPOINTS.HIERARCHY_CATEGORIES) as Promise<ApiResponse<MajorCategory[]>>;
    },
    getMajors: async (categoryId?: string): Promise<ApiResponse<Major[]>> => {
        const params = categoryId ? { categoryId } : {};
        return axiosClient.get(ENDPOINTS.HIERARCHY_MAJORS, { params }) as Promise<ApiResponse<Major[]>>;
    },
    getClasses: async (majorId?: string): Promise<ApiResponse<AdminClass[]>> => {
        const params = majorId ? { majorId } : {};
        return axiosClient.get(ENDPOINTS.HIERARCHY_CLASSES, { params }) as Promise<ApiResponse<AdminClass[]>>;
    },
};
