"use client";

import React, { useState } from "react";
import { Task, Subject } from "@/types/deadline.types";
import { stackDeadlines, StackedTask } from "@/utils/calendarStacking";
import TaskDetailModal from "./TaskDetailModal";

interface CalendarViewsProps {
    currentView: "Day" | "Week" | "Month" | "Year";
    subjects: Subject[];
    tasks: Task[];
    anchorDate?: Date;
}

export default function CalendarViews({ currentView, subjects, tasks, anchorDate }: CalendarViewsProps) {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    // Current anchor date for layout generation
    const baseDate = anchorDate || new Date();
    // Actual today's date for highlighting
    const actualToday = new Date();

    // Helper to format Date
    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    // Helper to check if a date is within a range (inclusive)
    const isDateInRange = (dateToCheck: Date, start: Date, end: Date) => {
        const check = new Date(dateToCheck).setHours(0, 0, 0, 0);
        const s = new Date(start).setHours(0, 0, 0, 0);
        const e = new Date(end).setHours(0, 0, 0, 0);
        return check >= s && check <= e;
    };

    // Helper to normalize the start and end to just Date midnight
    const normalizeDate = (d: string | Date | null | undefined) => {
        if (!d) return new Date();
        const n = new Date(d);
        n.setHours(0, 0, 0, 0);
        return n;
    };

    const getSubjectColor = (subjectId?: string | null) => {
        if (!subjectId) return '#ccc';
        if (subjectId === 'personal') return '#10b981'; // Default personal color
        return subjects.find(s => s.id === subjectId)?.color || '#ccc';
    };

    // --- DAY VIEW ---
    const renderDayView = () => {
        // Filter tasks that belong to baseDate
        const todaysTasks = tasks.filter(t => t.endDate && isSameDay(new Date(t.endDate), baseDate));

        // Sort by urgency, then chronological
        const sortedTasks = [...todaysTasks].sort((a, b) => {
            if ((b.urgencyScore || 0) !== (a.urgencyScore || 0)) {
                return (b.urgencyScore || 0) - (a.urgencyScore || 0);
            }
            return new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime();
        });

        if (sortedTasks.length === 0) {
            return (
                <div className="flex w-full h-full items-center justify-center flex-col text-center py-20 bg-zinc-50 dark:bg-zinc-800 border-2 border-black shadow-pixel-dark">
                    <i className="hn hn-calendar-01 text-6xl text-zinc-300 dark:text-zinc-600 mb-4 [text-shadow:3px_3px_0_rgba(0,0,0,0.1)]"></i>
                    <h2 className="text-xl font-bold text-zinc-400">No deadlines today!</h2>
                    <p className="text-zinc-500 font-medium mt-2">Enjoy your free time.</p>
                </div>
            );
        }

        const focusTask = sortedTasks[0];

        return (
            <div className="flex flex-col gap-6 w-full mx-auto">
                {focusTask && (
                    <div
                        onClick={() => setSelectedTask(focusTask)}
                        className="bg-[#e6b689] border-4 border-black p-4 shadow-pixel relative overflow-hidden cursor-pointer hover:bg-[#e0ad7c] transition-colors"
                    >
                        <div className="absolute top-0 right-0 bg-black text-white font-pixelify px-3 py-1 uppercase tracking-widest text-xs">
                            Focus Task
                        </div>
                        <h2 className="text-xl font-pixelify uppercase text-black mb-2">{focusTask.name}</h2>
                        <div className="flex gap-4 mb-4">
                            {focusTask.subjectId === 'personal' ? (
                                <span className="font-pixelify text-black border-2 border-black px-2 py-0.5 bg-white text-xs">PERSONAL</span>
                            ) : (
                                <>
                                    <span className="font-pixelify text-black border-2 border-black px-2 py-0.5 bg-white text-xs">Slot {focusTask.slot}</span>
                                    <span className="font-pixelify text-black border-2 border-black px-2 py-0.5 bg-white text-xs" style={{ borderBottomColor: getSubjectColor(focusTask.subjectId), borderBottomWidth: '4px' }}>
                                        {subjects.find(s => s.id === focusTask.subjectId)?.name || 'Subject'}
                                    </span>
                                </>
                            )}
                        </div>
                        <p className="font-medium text-black/80">
                            Due: {new Date(focusTask.endDate!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} <br />
                            Category: <strong>{focusTask.category || 'N/A'} {focusTask.weight ? `(${focusTask.weight}%)` : ''}</strong> <br />
                            Urgency Score: <strong>{focusTask.urgencyScore}</strong>
                        </p>
                        {focusTask.subTasks && focusTask.subTasks.length > 0 && (
                            <div className="mt-4 pt-4 border-t-2 border-black/20">
                                <div className="text-xs font-black uppercase tracking-wider mb-2">Checklist Progress</div>
                                <div className="w-full bg-white/50 h-2 border border-black mb-1">
                                    <div className="bg-green-600 h-full border-r border-black" style={{ width: `${(focusTask.subTasks.filter(st => st.isCompleted).length / focusTask.subTasks.length) * 100}%` }}></div>
                                </div>
                                <div className="text-[10px] font-bold text-black/60 text-right">
                                    {focusTask.subTasks.filter(st => st.isCompleted).length} / {focusTask.subTasks.length} Completed
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    <h3 className="font-pixelify text-lg uppercase tracking-widest text-zinc-400">Other Deadlines Today</h3>
                    {sortedTasks.slice(1).map(task => (
                        <div
                            key={task._id || `task-${task.name}`}
                            onClick={() => setSelectedTask(task)}
                            className="bg-zinc-100 dark:bg-zinc-800 border-2 border-black p-3 shadow-pixel flex justify-between items-center transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
                        >
                            <div>
                                <h4 className="font-bold text-base leading-tight">{task.name}</h4>
                                <p className="text-xs font-pixelify text-zinc-500 uppercase">Urgency: {task.urgencyScore}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-pixelify uppercase tracking-wider">{task.subjectId === 'personal' ? 'Personal' : `Slot ${task.slot}`}</div>
                                <div className="text-xs text-zinc-500 font-bold">{new Date(task.endDate!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // --- WEEK VIEW ---
    const renderWeekView = () => {
        // Calculate start of current week (Monday) based on baseDate
        const startOfWeek = new Date(baseDate);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);

        const weekDays = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            return d;
        });

        // Generate 24 hours
        const hours = Array.from({ length: 24 }).map((_, i) => i);

        return (
            <div className="flex flex-col h-full border-2 border-black shadow-pixel-dark bg-white dark:bg-zinc-900 overflow-hidden relative">
                <div className="flex border-b-2 border-black bg-zinc-100 dark:bg-zinc-800 shrink-0">
                    <div className="w-16 shrink-0 border-r-2 border-black"></div>
                    {weekDays.map((date, i) => {
                        const isToday = isSameDay(date, actualToday);
                        return (
                            <div key={i} className={`flex-1 text-center py-2 border-r border-zinc-200 dark:border-zinc-700 last:border-r-0 ${isToday ? 'bg-[#e6b689]/20' : ''}`}>
                                <div className="text-[10px] font-pixelify uppercase tracking-wider text-zinc-500 leading-none mb-1">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                <div className={`text-base font-pixelify leading-none ${isToday ? 'text-[#e6b689]' : ''}`}>{date.getDate()}</div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700">
                    <div className="flex relative" style={{ height: `${24 * 60 + 80}px` }}> {/* +80px for All Day section */}
                        {/* Time Grid Y-Axis */}
                        <div className="w-16 shrink-0 border-r-2 border-black bg-zinc-50 dark:bg-zinc-900 flex flex-col relative z-20">
                            {/* All Day Axis Label */}
                            <div className="h-[80px] border-b-2 border-black bg-zinc-100 dark:bg-zinc-800 text-right pr-2 pt-2 text-[10px] font-pixelify uppercase text-zinc-500">
                                All Day
                            </div>
                            {hours.map(h => (
                                <div key={h} className="h-[60px] border-b border-zinc-200 dark:border-zinc-700 text-right pr-2 pt-1 text-[10px] font-pixelify text-zinc-400">
                                    {h}:00
                                </div>
                            ))}
                        </div>
                        {/* Days Columns */}
                        <div className="flex-1 flex w-full relative">
                            {/* Horizontal grid lines */}
                            <div className="absolute inset-0 pointer-events-none flex flex-col z-0">
                                {/* All Day Horizontal Line */}
                                <div className="h-[80px] border-b-2 border-black bg-zinc-50/50 dark:bg-zinc-900/50 w-full shrink-0" />
                                {hours.map(h => (
                                    <div key={h} className="h-[60px] border-b border-zinc-100 dark:border-zinc-800 w-full shrink-0" />
                                ))}
                            </div>

                            {/* Vertical day columns */}
                            {weekDays.map((date, dayIdx) => {
                                // For Week view demo, we consider tasks spanning multiple days as All-Day tasks
                                // if startDate exists and is before endDate
                                const dayTasksAll = tasks.filter(t => t.endDate && isDateInRange(date, new Date(t.startDate || t.endDate), new Date(t.endDate)));

                                // Separate timed vs all-day (multi-day)
                                const timedTasks = dayTasksAll.filter(t => !t.startDate || isSameDay(new Date(t.startDate), new Date(t.endDate!)));
                                const allDayTasks = dayTasksAll.filter(t => t.startDate && !isSameDay(new Date(t.startDate), new Date(t.endDate!)));

                                return (
                                    <div key={dayIdx} className="flex-1 border-r border-zinc-200 dark:border-zinc-700 last:border-r-0 relative z-10 w-0 flex flex-col">
                                        {/* All Day Wrapper */}
                                        <div className="relative w-full h-[80px] border-b border-zinc-200 dark:border-zinc-700 p-1 flex flex-col gap-1 overflow-y-auto overflow-x-visible">
                                            {allDayTasks.slice(0, 3).map((t, idx) => {
                                                // Create contiguous visual effect by expanding margins if it's not the start/end
                                                const isStart = isSameDay(date, new Date(t.startDate!));
                                                const isEnd = isSameDay(date, new Date(t.endDate!));

                                                return (
                                                    <div
                                                        key={t._id || t.name + idx}
                                                        onClick={() => setSelectedTask(t)}
                                                        className={`text-[9px] font-bold text-white px-1 truncate shadow-[1px_1px_0_#000] z-20 cursor-pointer hover:brightness-110 transition-all ${isStart ? 'rounded-l border-l border-y border-black' : 'border-y border-black'} ${isEnd ? 'rounded-r border-r border-y border-black' : ''}`}
                                                        style={{
                                                            backgroundColor: getSubjectColor(t.subjectId),
                                                            marginLeft: isStart ? '2px' : '-2px', // Pull out to connect visually across borders
                                                            marginRight: isEnd ? '2px' : '-2px'
                                                        }}
                                                        title={`${t.name} (All Day)`}
                                                    >
                                                        {isStart ? t.name : '\u00A0'}
                                                    </div>
                                                );
                                            })}
                                            {allDayTasks.length > 3 && (
                                                <div
                                                    className="text-[9px] font-pixelify uppercase tracking-wider text-black bg-zinc-200 dark:bg-zinc-700 border-2 border-black flex items-center justify-center pointer-events-auto z-20"
                                                    style={{ height: '18px' }}
                                                    title={`${allDayTasks.length - 3} more task(s)`}
                                                >
                                                    +{allDayTasks.length - 3} more
                                                </div>
                                            )}
                                        </div>

                                        {/* Timed Wrapper */}
                                        <div className="relative w-full" style={{ height: `${24 * 60}px` }}>
                                            {timedTasks.map((t, idx) => {
                                                const d = new Date(t.endDate!);
                                                const topOffset = (d.getHours() + d.getMinutes() / 60) * 60;
                                                return (
                                                    <div
                                                        key={t._id || t.name + idx}
                                                        onClick={() => setSelectedTask(t)}
                                                        className="absolute left-1 right-1 p-1 rounded border border-black shadow-[2px_2px_0_#000] overflow-hidden text-[10px] md:text-xs text-white cursor-pointer hover:brightness-110 transition-all"
                                                        style={{ top: `${topOffset}px`, minHeight: '35px', backgroundColor: getSubjectColor(t.subjectId) }}
                                                        title={`${t.name} - ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                                    >
                                                        <span className="font-bold block truncate">{t.name}</span>
                                                        <span className="text-[10px] opacity-80">{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // --- MONTH VIEW ---
    const renderMonthView = () => {
        const year = baseDate.getFullYear();
        const month = baseDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Pad beginning (Monday is 0 for matching Week grid logically)
        const startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
        const daysInMonth = lastDay.getDate();

        // Total cells (6 weeks max to cover 31 days nicely)
        const totalCells = Math.ceil((startPadding + daysInMonth) / 7) * 7;
        const totalWeeks = totalCells / 7;

        return (
            <div className="flex flex-col h-full border-2 border-black shadow-pixel-dark bg-white dark:bg-zinc-900 overflow-hidden shrink-0">
                <div className="p-3 border-b-2 border-black flex justify-between items-center bg-zinc-50 dark:bg-zinc-800 shrink-0">
                    <h2 className="text-xl font-pixelify uppercase text-black dark:text-white drop-shadow-[1px_1px_0_rgba(255,255,255,0.1)]">
                        {baseDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h2>
                </div>
                <div className="grid grid-cols-7 border-b-2 border-black bg-zinc-100 dark:bg-zinc-800 shrink-0">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                        <div key={d} className="p-1.5 text-center font-pixelify uppercase tracking-wider text-[10px] text-zinc-500 border-r border-zinc-200 dark:border-zinc-700 last:border-r-0">
                            {d}
                        </div>
                    ))}
                </div>
                {/* Dynamically size cells to fit container */}
                <div className="flex flex-col flex-1 border-t-0 border-black overflow-y-auto [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700">
                    {Array.from({ length: totalWeeks }).map((_, weekIdx) => {
                        const weekStartIdx = weekIdx * 7;
                        // Calculate dates for this week
                        const weekDates = Array.from({ length: 7 }).map((_, dayOfWeekIdx) => {
                            const dayNumber = weekStartIdx + dayOfWeekIdx - startPadding + 1;
                            const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
                            return isCurrentMonth ? new Date(year, month, dayNumber) : null;
                        });

                        const firstDateOfWeek = weekDates.find(d => d !== null) || new Date(year, month, weekStartIdx - startPadding + 1);
                        const lastDateOfWeek = weekDates.slice().reverse().find(d => d !== null) || new Date(year, month, weekStartIdx + 7 - startPadding);

                        // Find tasks overlapping this week
                        const weekTasks = tasks.filter(t => {
                            if (!t.endDate) return false;
                            const taskStart = normalizeDate(t.startDate || t.endDate).getTime();
                            const taskEnd = normalizeDate(t.endDate).getTime();
                            const weekStartTime = normalizeDate(firstDateOfWeek).getTime();
                            const weekEndTime = normalizeDate(lastDateOfWeek).getTime();
                            return taskStart <= weekEndTime && taskEnd >= weekStartTime;
                        });

                        const stackedTasks = stackDeadlines(weekTasks);

                        // Find max row to define minimum height of the week wrapper
                        const maxRow = stackedTasks.length > 0 ? Math.max(...stackedTasks.map((t: StackedTask) => t.rowIndex)) : 0;
                        const weekMinHeight = Math.max(120, (Math.min(maxRow, 4) + 1) * 28 + 40); // Base height + bars height

                        // Count hidden tasks per day for "+X more" functionality
                        const hiddenTasksPerDay = Array(7).fill(0);
                        stackedTasks.forEach((task: StackedTask) => {
                            if (task.rowIndex >= 3) {
                                weekDates.forEach((date, di) => {
                                    if (date) {
                                        const ts = normalizeDate(task.startDate || task.endDate).getTime();
                                        const te = normalizeDate(task.endDate).getTime();
                                        const ds = date.getTime();
                                        if (ds >= ts && ds <= te) {
                                            hiddenTasksPerDay[di]++;
                                        }
                                    }
                                });
                            }
                        });


                        return (
                            <div key={weekIdx} className="relative flex-1 min-h-[120px] flex border-b border-zinc-200 dark:border-zinc-700 last:border-b-0" style={{ height: `${weekMinHeight}px` }}>
                                {/* Day Backgrounds and Numbers */}
                                <div className="absolute inset-0 grid grid-cols-7">
                                    {weekDates.map((date, dayOfWeekIdx) => {
                                        const isCurrentMonth = date !== null;
                                        const isToday = isCurrentMonth && isSameDay(date, actualToday);
                                        const dayNumber = date ? date.getDate() : '';

                                        return (
                                            <div key={dayOfWeekIdx} className={`border-r border-zinc-200 dark:border-zinc-700 last:border-r-0 relative z-0 flex flex-col ${!isCurrentMonth ? 'bg-zinc-50 dark:bg-zinc-800/50' : 'bg-white dark:bg-zinc-900'}`}>
                                                {isCurrentMonth && (
                                                    <>
                                                        <div className={`text-right font-bold text-sm mb-1 px-1 mt-1 ${isToday ? 'text-black dark:text-white bg-[#e6b689] w-6 h-6 rounded-full flex items-center justify-center ml-auto shadow-[1px_1px_0_#000] relative z-20' : 'text-zinc-600 dark:text-zinc-400 relative z-20'}`}>
                                                            {dayNumber}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Stacked Bars Layer */}
                                <div className="absolute top-8 left-0 right-0 bottom-0 pointer-events-none z-10">
                                    {stackedTasks.map((t: StackedTask, idx: number) => {
                                        // Clutter Management: Hide bars with rowIndex >= 3
                                        if (t.rowIndex >= 3) return null;

                                        const taskStart = normalizeDate(t.startDate || t.endDate).getTime();
                                        const taskEnd = normalizeDate(t.endDate).getTime();

                                        // Find which days of this week the task overlaps
                                        let startDayIdx = -1;
                                        let endDayIdx = -1;

                                        weekDates.forEach((date, i) => {
                                            if (date) {
                                                const ds = date.getTime();
                                                if (ds >= taskStart && ds <= taskEnd) {
                                                    if (startDayIdx === -1) startDayIdx = i;
                                                    endDayIdx = i; // Will keep updating to the last match
                                                }
                                            }
                                        });

                                        // If it spans outside the month boundaries but within the week (e.g padded null days)
                                        // We handle null dates as conceptually existing for continuous drawing
                                        if (startDayIdx === -1 || endDayIdx === -1) {
                                            // Fallback logic for tasks completely covering the month start/end paddings
                                            startDayIdx = 0;
                                            endDayIdx = 6;

                                            for (let i = 0; i < 7; i++) {
                                                const computedDate = new Date(year, month, weekStartIdx + i - startPadding + 1).getTime();
                                                if (computedDate >= taskStart && startDayIdx === 0) startDayIdx = i;
                                            }
                                            for (let i = 6; i >= 0; i--) {
                                                const computedDate = new Date(year, month, weekStartIdx + i - startPadding + 1).getTime();
                                                if (computedDate <= taskEnd && endDayIdx === 6) endDayIdx = i;
                                            }

                                            // if still out of bounds somehow, skip
                                            if (startDayIdx > 6 || endDayIdx < 0) return null;

                                            startDayIdx = Math.max(0, startDayIdx);
                                            endDayIdx = Math.min(6, endDayIdx);
                                        }

                                        const leftPercent = (startDayIdx / 7) * 100;
                                        const widthPercent = ((endDayIdx - startDayIdx + 1) / 7) * 100;

                                        // Calculate actual start and end to determine rounding/clipping edges
                                        const realStart = new Date(taskStart);
                                        const realEnd = new Date(taskEnd);
                                        const firstDateOfRenderedWeek = weekDates[startDayIdx] || new Date(year, month, weekStartIdx + startDayIdx - startPadding + 1);
                                        const lastDateOfRenderedWeek = weekDates[endDayIdx] || new Date(year, month, weekStartIdx + endDayIdx - startPadding + 1);

                                        const isStart = isSameDay(realStart, firstDateOfRenderedWeek);
                                        const isEnd = isSameDay(realEnd, lastDateOfRenderedWeek);

                                        // Progress fill calculation 
                                        let progressPercent = 0;
                                        if (t.subTasks && t.subTasks.length > 0) {
                                            const completed = t.subTasks.filter((st: any) => st.isCompleted).length;
                                            progressPercent = (completed / t.subTasks.length) * 100;
                                        }

                                        return (
                                            <div
                                                key={t._id || t.name + idx}
                                                onClick={() => setSelectedTask(t)}
                                                className={`absolute group px-2 py-0.5 text-[10px] font-pixelify uppercase tracking-wider text-white border-y-2 border-black shadow-[1px_1px_0_#000] cursor-pointer hover:brightness-110 transition-all pointer-events-auto flex items-center overflow-hidden
                                                    ${isStart ? 'border-l-2' : 'border-l-0'}
                                                    ${isEnd ? 'border-r-2' : 'border-r-0'}
                                                `}
                                                style={{
                                                    top: `${t.rowIndex * 24}px`, // 20px barHeight + 4px gap
                                                    left: `calc(${leftPercent}% + ${isStart ? '2px' : '0px'})`,
                                                    width: `calc(${widthPercent}% - ${isStart ? '2px' : '0px'} - ${isEnd ? '2px' : '0px'})`,
                                                    minHeight: '20px',
                                                    height: '20px',
                                                    backgroundColor: `${getSubjectColor(t.subjectId)}`,
                                                }}
                                            >
                                                {/* Progress Fill Indicator */}
                                                {progressPercent > 0 && (
                                                    <div
                                                        className="absolute top-0 bottom-0 left-0 bg-white/30 z-0 pointer-events-none"
                                                        style={{ width: `${progressPercent}%` }}
                                                    />
                                                )}

                                                <span className="relative z-10 truncate drop-shadow-md">
                                                    {isStart ? t.name : '\u00A0'}
                                                </span>

                                                {/* Advanced Hover tooltip */}
                                                <div className="absolute top-full left-0 mt-1 opacity-0 group-hover:opacity-100 bg-white dark:bg-zinc-900 border-2 border-black text-black dark:text-white p-2 text-xs shadow-[2px_2px_0_#000] pointer-events-none transition-all w-[200px] whitespace-normal z-[60]">
                                                    <div className="font-pixelify uppercase text-[#e6b689] mb-1">{t.name}</div>
                                                    <div className="font-roboto mb-1 text-[10px] uppercase text-zinc-500 border-b border-zinc-200 dark:border-zinc-700 pb-1">{subjects.find(s => s.id === t.subjectId)?.name || 'Personal'}</div>
                                                    <div className="text-[10px]">Start: {t.startDate ? new Date(t.startDate).toLocaleDateString() : new Date(t.endDate!).toLocaleDateString()}</div>
                                                    <div className="text-[10px]">End: {new Date(t.endDate!).toLocaleDateString()}</div>
                                                    <div className="mt-1 font-pixelify">Urgency: {t.urgencyScore}</div>
                                                    {t.subTasks && t.subTasks.length > 0 && (
                                                        <div className="mt-1 text-[10px] text-zinc-500 font-pixelify uppercase">
                                                            Prog: {Math.round(progressPercent)}%
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* +X More Layer as 4th Bar */}
                                    {weekDates.map((date, di) => {
                                        if (date && hiddenTasksPerDay[di] > 0) {
                                            const leftPercent = (di / 7) * 100;
                                            const widthPercent = (1 / 7) * 100;
                                            return (
                                                <div
                                                    key={`more-${di}`}
                                                    className="absolute py-0.5 text-[9px] font-pixelify uppercase tracking-wider text-black bg-zinc-200 dark:bg-zinc-700 border-2 border-black flex items-center justify-center pointer-events-auto z-20"
                                                    style={{
                                                        top: `72px`,
                                                        left: `calc(${leftPercent}% + 2px)`,
                                                        width: `calc(${widthPercent}% - 4px)`,
                                                        height: '20px',
                                                    }}
                                                    title={`${hiddenTasksPerDay[di]} more task(s)`}
                                                >
                                                    +{hiddenTasksPerDay[di]} more
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // --- YEAR VIEW ---
    const renderYearView = () => {
        const year = baseDate.getFullYear();
        const months = Array.from({ length: 12 }).map((_, i) => i);

        return (
            <div className="h-full w-full overflow-y-auto [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700">
                <div className="mb-4 text-center shrink-0">
                    <h2 className="text-2xl font-pixelify uppercase text-[#e6b689] tracking-widest drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">[ {year} ]</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-1">
                    {months.map(m => {
                        const firstDay = new Date(year, m, 1);
                        const lastDay = new Date(year, m + 1, 0);
                        const startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
                        const daysInMonth = lastDay.getDate();
                        const totalCells = Math.ceil((startPadding + daysInMonth) / 7) * 7;

                        return (
                            <div key={m} className="border-2 border-black shadow-pixel bg-white dark:bg-zinc-900 p-3 flex flex-col">
                                <h3 className="font-pixelify text-base uppercase mb-2 text-center text-[#e6b689]">{firstDay.toLocaleString('default', { month: 'short' })}</h3>
                                <div className="grid grid-cols-7 mb-1">
                                    {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                                        <div key={i} className="text-center text-[10px] font-bold text-zinc-400">{d}</div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-y-2 gap-x-1">
                                    {Array.from({ length: totalCells }).map((_, i) => {
                                        const dayNumber = i - startPadding + 1;
                                        const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;

                                        if (!isCurrentMonth) {
                                            return <div key={i} className="w-full h-8 flex items-center justify-center text-[10px] text-zinc-300 dark:text-zinc-700">-</div>;
                                        }

                                        const date = new Date(year, m, dayNumber);
                                        const isToday = isSameDay(date, actualToday);
                                        const dayTasksAll = tasks.filter(t => t.endDate && isDateInRange(date, new Date(t.startDate || t.endDate), new Date(t.endDate)));

                                        let text = isToday ? 'text-white' : 'text-zinc-600 dark:text-zinc-400';

                                        const displayTasks = dayTasksAll.slice(0, 3);
                                        const hasMore = dayTasksAll.length > 3;

                                        return (
                                            <div
                                                key={i}
                                                className={`w-5 h-7 flex flex-col items-center justify-start text-[9px] font-pixelify mx-auto border border-transparent transition-all hover:border-black hover:shadow-[1px_1px_0_#000] cursor-pointer relative overflow-hidden ${isToday ? 'bg-[#e6b689] text-black shadow-[1px_1px_0_#000] border-black' : ''}`}
                                                title={dayTasksAll.length > 0 ? dayTasksAll.map(t => t.name).join(', ') : ''}
                                                onClick={() => {
                                                    if (dayTasksAll.length === 1) setSelectedTask(dayTasksAll[0]);
                                                }}
                                            >
                                                <span className={`${text} leading-tight mt-[1px] z-10 ${isToday ? 'drop-shadow-[1px_1px_0_rgba(255,255,255,0.5)]' : ''}`}>{dayNumber}</span>
                                                <div className="absolute bottom-[2px] left-0 right-0 flex flex-col gap-[1px] px-[2px]">
                                                    {displayTasks.map((t, idx) => (
                                                        <div key={idx} className="h-[2px] w-full rounded-[1px]" style={{ backgroundColor: getSubjectColor(t.subjectId) }} />
                                                    ))}
                                                    {hasMore && <div className="h-[2px] w-full rounded-[1px] bg-zinc-400 dark:bg-zinc-600" />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderView = () => {
        switch (currentView) {
            case "Day": return renderDayView();
            case "Week": return renderWeekView();
            case "Month": return renderMonthView();
            case "Year": return renderYearView();
            default: return renderMonthView();
        }
    };

    return (
        <>
            {renderView()}
            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    subject={selectedTask.subjectId === 'personal' ? null : subjects.find(s => s.id === selectedTask.subjectId)}
                    onClose={() => setSelectedTask(null)}
                />
            )}
        </>
    );
}
