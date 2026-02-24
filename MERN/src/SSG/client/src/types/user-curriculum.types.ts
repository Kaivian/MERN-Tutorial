// client/src/types/user-curriculum.types.ts

import { SubjectData, AssessmentPlanItem } from './curriculum.types';

export interface UserCurriculumContext {
    block: string | null;
    program: string | null;
    cohort_class: string | null;
    term: string | null;
}

export interface UserGradeComponent {
    category: string;
    part_index: number;
    score: number;
}

export interface UserSubjectGrade extends Omit<SubjectData, 'score'> {
    id: string; // The populated Object ID required for saving grades
    score: number | null; // Override SubjectData's score
    grades: UserGradeComponent[]; // Re-mapped for the component
}

export interface UserCurriculumData {
    active_context: UserCurriculumContext;
    term_gpa: number | null;
    subjects: UserSubjectGrade[];
}

export interface UpdateGradePayload {
    semester: number;
    grades: UserGradeComponent[];
}

export interface UserAnalyticsTermGpa {
    term: string;
    gpa: number | null;
    cumulativeGpa: number | null;
}

export interface UserAnalyticsSubjectStatus {
    name: string;
    value: number;
    fill: string;
}

export interface UserAnalyticsTermDetail {
    code: string;
    name_en: string;
    credit: number;
    status: string;
    score: number | null;
}

export interface UserAnalyticsData {
    termGpas: UserAnalyticsTermGpa[];
    subjectStatuses: UserAnalyticsSubjectStatus[];
    termDetails: Record<string, UserAnalyticsTermDetail[]>;
}
