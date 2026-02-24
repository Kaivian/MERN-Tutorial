// client/src/types/deadline.types.ts
import { AssessmentPlanItem } from "./curriculum.types";

export type GradeCategory =
    | 'Participation'
    | 'Progress Test'
    | 'Lab'
    | 'Assignment'
    | 'Final';

// Represents an FPT Class Subject
export interface Subject {
    id: string;
    name: string; // e.g., 'SWP391', 'PRN211'
    color: string; // Hex color for UI representation
    assessment_plan?: AssessmentPlanItem[]; // Added for dynamic grade extraction
}

// Represents a smaller measurable chunk of a task
export interface SubTask {
    id: string;
    title: string;
    isCompleted: boolean;
}

// Represents the main Assignment / Deadline
export interface Task {
    _id?: string; // MongoDB maps _id, optional locally before save
    userId?: string;

    name: string; // e.g., 'Assignment 1', 'Lab 3'
    subjectId: string | null; // Foreign key to Subject or null for 'personal'

    category?: GradeCategory;
    weight?: number; // Percentage of total grade (e.g., 10 for 10%)

    startDate: string; // ISO String 
    endDate: string | null; // Nullable to denote an ongoing or backlog chore
    slot?: number; // 1 to 6 (FPT Specific Slots)
    color?: string; // Custom color for personal tasks

    difficulty: number; // 1 to 5 stars
    estimatedHours: number;

    subTasks: SubTask[];

    // Logic fields computed dynamically server-side
    urgencyScore?: number;
    isCompleted?: boolean;

    // Auto populated by mongoose 
    createdAt?: string;
    updatedAt?: string;
}
