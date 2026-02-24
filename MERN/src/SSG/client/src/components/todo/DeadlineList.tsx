"use client";

import React from "react";
import { Task, Subject } from "@/types/deadline.types";

interface DeadlineListProps {
    tasks: Task[];
    subjects: Subject[];
    onDelete: (id: string) => void;
    onEdit: (task: Task) => void;
    onToggleComplete?: (task: Task) => void;
}

export default function DeadlineList({ tasks, subjects, onDelete, onEdit, onToggleComplete }: DeadlineListProps) {

    if (tasks.length === 0) return null;

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                    <tr className="bg-zinc-100 dark:bg-zinc-900 border-y-2 border-black font-pixelify text-sm">
                        <th className="p-2 uppercase tracking-wider">Task Name</th>
                        <th className="p-2 uppercase tracking-wider">Subject</th>
                        <th className="p-2 uppercase tracking-wider">Category</th>
                        <th className="p-2 uppercase tracking-wider">Weight</th>
                        <th className="p-2 uppercase tracking-wider">Due Date</th>
                        <th className="p-2 uppercase tracking-wider text-center">Urgency</th>
                        <th className="p-2 uppercase tracking-wider text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map(task => {
                        const isPersonal = task.subjectId === 'personal';
                        const subject = isPersonal ? null : subjects.find(s => s.id === task.subjectId);
                        const subTaskCount = task.subTasks.length;
                        const completedCount = task.subTasks.filter(st => st.isCompleted).length;
                        const progress = subTaskCount === 0 ? 0 : (completedCount / subTaskCount) * 100;

                        return (
                            <tr key={task._id || `task-${task.name}`} className="border-b border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                <td className="p-2 font-roboto">
                                    <div className="font-bold text-sm text-black dark:text-white leading-tight">{task.name}</div>
                                    {subTaskCount > 0 && (
                                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                                            Prog: [{(progress).toFixed(0)}%]
                                        </div>
                                    )}
                                </td>
                                <td className="p-2">
                                    {isPersonal ? (
                                        <span
                                            className="px-1.5 py-0.5 text-[10px] font-pixelify uppercase tracking-wider border-2 border-black inline-block leading-none"
                                            style={{ backgroundColor: task.color || '#000000', color: 'white', textShadow: '1px 1px 0 #000' }}
                                        >
                                            PERS
                                        </span>
                                    ) : subject ? (
                                        <span
                                            className="px-1.5 py-0.5 text-[10px] font-pixelify uppercase tracking-wider border-2 border-black inline-block leading-none"
                                            style={{ backgroundColor: subject.color, color: 'white', textShadow: '1px 1px 0 #000' }}
                                        >
                                            {subject.name}
                                        </span>
                                    ) : null}
                                </td>
                                <td className="p-2 font-bold text-xs uppercase tracking-wider text-zinc-500">{isPersonal ? '—' : task.category}</td>
                                <td className="p-2 font-pixelify text-xs text-zinc-500">{isPersonal ? '—' : `${task.weight}%`}</td>
                                <td className="p-2 text-xs">
                                    {task.endDate ? (
                                        <div className="font-bold uppercase tracking-wider">{new Date(task.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
                                    ) : (
                                        <div className="font-pixelify text-zinc-400">Ongoing</div>
                                    )}
                                    {isPersonal ? null : <div className="text-[10px] text-zinc-500 font-pixelify uppercase pt-0.5">Sl.{task.slot}</div>}
                                </td>
                                <td className="p-2 text-center">
                                    <div className="inline-flex shrink-0 items-center justify-center font-pixelify border-2 border-black text-xs px-2 py-0.5" style={{
                                        backgroundColor: (task.urgencyScore || 0) > 20 ? '#ef4444' : (task.urgencyScore || 0) > 10 ? '#f59e0b' : '#10b981',
                                        color: 'white',
                                        textShadow: '1px 1px 0 #000'
                                    }}>
                                        {task.urgencyScore}
                                    </div>
                                </td>
                                <td className="p-2">
                                    <div className="flex items-center justify-center gap-1.5">
                                        {onToggleComplete && (
                                            <button onClick={() => onToggleComplete(task)} title={task.isCompleted ? "Restore" : "Complete"} className={`w-7 h-7 flex items-center justify-center font-bold text-xs border-2 shadow-[2px_2px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all ${task.isCompleted ? 'text-zinc-700 bg-zinc-200 hover:bg-zinc-300 border-black' : 'text-green-700 bg-green-100 hover:bg-green-200 border-black'}`}>
                                                <i className={task.isCompleted ? "hn hn-undo" : "hn hn-check"}></i>
                                            </button>
                                        )}
                                        <button onClick={() => onEdit(task)} title="Edit" className="w-7 h-7 flex items-center justify-center font-bold text-xs border-2 text-zinc-700 bg-zinc-100 hover:bg-zinc-200 border-black shadow-[2px_2px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                                            <i className="hn hn-edit-2"></i>
                                        </button>
                                        <button onClick={() => task._id && onDelete(task._id)} title="Delete" className="w-7 h-7 flex items-center justify-center font-bold text-xs border-2 text-red-500 bg-red-50 hover:bg-red-100 border-black shadow-[2px_2px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                                            <i className="hn hn-trash-bin"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
