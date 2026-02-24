// client/src/types/curriculum.types.ts

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
