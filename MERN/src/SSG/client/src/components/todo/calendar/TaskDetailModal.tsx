"use client";

import React from "react";
import { Task, Subject } from "@/types/deadline.types";

interface TaskDetailModalProps {
    task: Task;
    subject?: Subject | null;
    onClose: () => void;
}

export default function TaskDetailModal({ task, subject, onClose }: TaskDetailModalProps) {
    const isPersonal = task.subjectId === 'personal';

    const getDifficultyStars = (level: number) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <i key={i} className={`hn hn-star ${i < level ? 'text-[#e6b689]' : 'text-zinc-300 dark:text-zinc-700'}`}></i>
        ));
    };

    const subTaskCount = task.subTasks?.length || 0;
    const completedCount = task.subTasks?.filter(st => st.isCompleted).length || 0;
    const progress = subTaskCount === 0 ? 0 : (completedCount / subTaskCount) * 100;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 border-4 border-black shadow-[8px_8px_0_#000] w-full max-w-md relative animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-zinc-100 dark:bg-zinc-800 border-b-4 border-black p-4 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-black uppercase text-black dark:text-white pr-8">{task.name}</h2>
                        <div className="flex gap-2 mt-2">
                            {isPersonal ? (
                                <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider border-2 border-black bg-emerald-500 text-white shadow-[2px_2px_0_#000]">
                                    Personal
                                </span>
                            ) : subject ? (
                                <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider border-2 border-black text-white shadow-[2px_2px_0_#000]" style={{ backgroundColor: subject.color }}>
                                    {subject.name}
                                </span>
                            ) : null}
                            {!isPersonal && task.category && (
                                <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider border-2 border-black bg-zinc-200 dark:bg-zinc-700 text-black dark:text-white shadow-[2px_2px_0_#000]">
                                    {task.category} {task.weight ? `(${task.weight}%)` : ''}
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-black dark:text-white hover:text-red-500 opacity-50 hover:opacity-100 transition-colors"
                    >
                        <i className="hn hn-x text-2xl font-black"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

                    {/* Urgency & Status */}
                    <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50 p-4 border-2 border-black shadow-[2px_2px_0_#000] rounded-lg">
                        <div>
                            <div className="text-xs font-bold text-zinc-500 uppercase">Urgency Score</div>
                            <div className="inline-block px-3 py-1 font-black text-white border-2 border-black shadow-[2px_2px_0_#000] mt-1" style={{
                                backgroundColor: (task.urgencyScore || 0) > 20 ? '#ef4444' : (task.urgencyScore || 0) > 10 ? '#f59e0b' : '#10b981',
                            }}>
                                {task.urgencyScore || 0}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs font-bold text-zinc-500 uppercase">Status</div>
                            <div className={`font-black text-lg ${task.isCompleted ? 'text-green-500' : 'text-zinc-400'}`}>
                                {task.isCompleted ? 'Completed' : 'Pending'}
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 border-2 border-black rounded-lg">
                            <div className="text-[10px] font-bold text-zinc-500 uppercase mb-1 flex items-center gap-1">
                                <i className="hn hn-calendar-01"></i> Start Date
                            </div>
                            <div className="font-bold text-sm">
                                {task.startDate ? new Date(task.startDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Not set'}
                            </div>
                        </div>
                        <div className="bg-[#e6b689]/20 p-3 border-2 border-black rounded-lg">
                            <div className="text-[10px] font-bold text-[#b88c63] uppercase mb-1 flex items-center gap-1">
                                <i className="hn hn-clock"></i> Due Date
                            </div>
                            <div className="font-bold text-sm text-[#a3764d]">
                                {task.endDate ? new Date(task.endDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Ongoing'}
                            </div>
                        </div>
                    </div>

                    {/* Meta info */}
                    <div className="flex gap-6 items-center border-y-2 border-black py-4">
                        <div>
                            <div className="text-xs font-bold text-zinc-500 mb-1">Difficulty</div>
                            <div className="flex gap-0.5 text-lg">
                                {getDifficultyStars(task.difficulty)}
                            </div>
                        </div>
                        <div className="w-px h-8 bg-black"></div>
                        <div>
                            <div className="text-xs font-bold text-zinc-500 mb-1">Est. Time</div>
                            <div className="font-bold">{task.estimatedHours} hours</div>
                        </div>
                        {!isPersonal && task.slot && (
                            <>
                                <div className="w-px h-8 bg-black"></div>
                                <div>
                                    <div className="text-xs font-bold text-zinc-500 mb-1">Slot</div>
                                    <div className="font-bold bg-zinc-200 dark:bg-zinc-700 px-2 rounded-sm text-center">{task.slot}</div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Subtasks */}
                    {subTaskCount > 0 && (
                        <div>
                            <div className="flex justify-between items-end mb-3">
                                <h3 className="font-black uppercase tracking-wider text-sm">Checklist</h3>
                                <span className="text-xs font-bold text-zinc-500">{completedCount}/{subTaskCount} ({Math.round(progress)}%)</span>
                            </div>
                            <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 border border-black mb-4">
                                <div className="bg-green-500 h-full border-r border-black transition-all" style={{ width: `${progress}%` }}></div>
                            </div>
                            <ul className="space-y-2">
                                {task.subTasks.map(st => (
                                    <li key={st.id} className="flex items-start gap-3 bg-zinc-50 dark:bg-zinc-800/50 p-2 border-2 border-zinc-200 dark:border-zinc-700 rounded transition-colors group">
                                        <div className={`w-5 h-5 shrink-0 border-2 rounded-sm flex items-center justify-center mt-0.5 ${st.isCompleted ? 'bg-green-500 border-green-700 text-white shadow-[1px_1px_0_#166534]' : 'bg-white dark:bg-zinc-900 border-black shadow-[1px_1px_0_#000]'}`}>
                                            {st.isCompleted && <i className="hn hn-check text-xs"></i>}
                                        </div>
                                        <span className={`font-medium text-sm pt-0.5 ${st.isCompleted ? 'line-through text-zinc-400' : 'text-black dark:text-white'}`}>
                                            {st.title}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t-4 border-black bg-zinc-100 dark:bg-zinc-800 text-right">
                    <button
                        onClick={onClose}
                        className="bg-black text-white font-black uppercase tracking-wider px-6 py-2 border-2 border-black shadow-[4px_4px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-transform hover:shadow-[2px_2px_0_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
