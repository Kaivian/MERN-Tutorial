// client/src/types/curriculum.types.ts

// ============================================================
// Existing Student-Facing Types (kept for backward compat)
// ============================================================

export interface ProgramClass {
    key: string;
    label: string;
    name_vi: string;
    name_en: string;
}

export interface ProgramData {
    key: string;
    label: string;
    startSeason: string;
    startYear: number;
    classes: ProgramClass[];
}

export interface CurriculumProgramsResponse {
    [key: string]: ProgramData;
}

export interface SemesterData {
    key: string;
    label: string;
    shortLabel: string;
    semesterIndex: number;
}

export interface AssessmentPlanItem {
    category: string;
    type?: string;
    part_count: number;
    weight_percent: number;
    completion_criteria?: string;
    duration?: string;
    clos_covered?: string;
    grading_guide?: string;
    note?: string;
}

export interface SubjectData {
    code: string;
    name_en: string;
    name_vi: string;
    credit: number;
    prerequisite: string | null;
    semester: number;
    assessment_plan: AssessmentPlanItem[];
    status: string;
    score: number | null;
}

// ============================================================
// Admin Curriculum Management Types
// ============================================================

export interface AdminSubject {
    _id: string;
    code: string;
    name_vi: string;
    name_en: string;
    credit: number;
    semester: number;
    prerequisite: string | null;
    structure_type: string;
    assessment_plan?: { name: string; weight?: number; category?: string }[];
}

export interface MajorCategory {
    _id: string;
    code: string;
    name: string;
    description?: string;
    color?: string;
    isActive: boolean;
    majorCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface Major {
    _id: string;
    code: string;
    name: string;
    description?: string;
    majorCategoryId: MajorCategory | string;
    isActive: boolean;
    classCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface AdminClass {
    _id: string;
    code: string;
    name: string;
    majorId: Major | string;
    intake?: string;
    academicYear?: string;
    totalSemesters: number;
    isActive: boolean;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CurriculumEntry {
    mappingId: string;
    order_index: number;
    subject: AdminSubject;
}

export interface SemesterCurriculumData {
    semester: number;
    subjects: CurriculumEntry[];
}

export interface ClassCurriculumResponse {
    classInfo: AdminClass;
    semesters: SemesterCurriculumData[];
}
