import { Task } from "../types/deadline.types";

export interface StackedTask extends Task {
    rowIndex: number;
}

export function stackDeadlines(tasks: Task[]): StackedTask[] {
    if (!tasks || tasks.length === 0) return [];

    // Helper to get normalized start date
    const getStartDate = (t: Task) => t.startDate ? new Date(t.startDate).getTime() : new Date(t.endDate!).getTime();

    // Helper to get normalized end date
    const getEndDate = (t: Task) => t.endDate ? new Date(t.endDate).getTime() : new Date(t.startDate!).getTime(); // fallback just in case

    // Step 1: Sorting
    // Sort all deadlines by startDate (ascending). 
    // If two deadlines have the same startDate, sort them by duration (longest first)
    const sortedTasks = [...tasks].sort((a, b) => {
        const startA = getStartDate(a);
        const startB = getStartDate(b);

        if (startA !== startB) {
            return startA - startB; // Ascending by start date
        }

        // Same start date, sort by duration (descending)
        const durationA = getEndDate(a) - startA;
        const durationB = getEndDate(b) - startB;

        if (durationA !== durationB) {
            return durationB - durationA; // Longest duration first
        }

        // If still tied, sort by urgency Score (descending)
        return (b.urgencyScore || 0) - (a.urgencyScore || 0);
    });

    // Step 2 & 3: Track Assignments and Collision Detection
    const rowEnds: number[] = []; // Stores the max end time for each row index
    const stackedTasks: StackedTask[] = [];

    for (const task of sortedTasks) {
        const start = getStartDate(task);
        const end = getEndDate(task);

        let rowIndex = 0;

        // Find the first available row where this task doesn't overlap
        // Overlap condition: (task.start <= rowEnd) -> needs to be strictly < if we want them to touch but not overlap, but wait, usually if A ends on day 5 and B starts on day 5, they overlap in Month view.
        // Let's use start < rowEnd as overlap for continuous days.
        // Actually to be safe, we pad end time by 1ms if needed, but let's just use <=.
        // If A ends on 2023-10-10 23:59:59 and B starts on 2023-10-11 00:00:00, start > rowEnd.

        while (rowIndex < rowEnds.length && start <= rowEnds[rowIndex]) {
            rowIndex++;
        }

        // Assign row index and update the max end time for this row
        stackedTasks.push({ ...task, rowIndex });

        // We set the end time. If the task is just one day vs multi day, we just use its exact end time.
        // But for calendar stacking, if task A ends 3 PM and B starts 4 PM on SAME DAY, in Month view they overlap visually because they both occupy that day cell.
        // So we should normalize the end time to the end of its respective day.
        const endOfDay = new Date(end);
        endOfDay.setHours(23, 59, 59, 999);

        // Similarly, start time should be normalized to start of day for comparison purposes IF we want day-level stacking.
        // Since the requirement asks for "date comparisons", day-level seems appropriate for Month view.

        // Wait, if I do day-level, then A and B overlap if they share any day.
        // Let's modify the above logic to use day-level precision.

        rowEnds[rowIndex] = endOfDay.getTime();
    }

    return stackedTasks;
}
