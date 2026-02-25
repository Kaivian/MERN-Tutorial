"use client";

import React, { useState } from "react";
import { useUserCurriculum } from "@/hooks/useUserCurriculum";
import { Task, Subject } from "@/types/deadline.types";
import DeadlineForm from "@/components/todo/DeadlineForm";
import DeadlineList from "@/components/todo/DeadlineList";
import { useTasks } from "@/hooks/useTasks";

export default function DeadlineManagerPage() {
    const { tasks: backendTasks, isLoading: isTasksLoading, createTask, updateTask, deleteTask } = useTasks();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const deadlines = backendTasks?.filter(t => t.endDate && !t.isCompleted) || [];
    const todos = backendTasks?.filter(t => !t.endDate && !t.isCompleted) || [];
    const completedTasks = backendTasks?.filter(t => t.isCompleted) || [];

    const { data: userCurriculum, isLoading: isContextLoading } = useUserCurriculum();

    // Map backend curriculum subjects to Deadline Manager Subject interface
    const currentSubjects: Subject[] = React.useMemo(() => {
        if (!userCurriculum?.subjects) return [];
        return userCurriculum.subjects.map((sub, index) => {
            // Assign a deterministic color based on index or category
            const colors = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#eab308"];
            return {
                id: sub.id,
                name: sub.code,
                color: colors[index % colors.length],
                assessment_plan: sub.assessment_plan
            };
        });
    }, [userCurriculum]);

    return (
        <div className="flex flex-col w-full h-full gap-4 bg-background dark:bg-zinc-900 transition-colors duration-300 relative overflow-y-auto overflow-x-auto [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700">
            <div className="flex justify-between items-center bg-white dark:bg-zinc-800 p-4 shadow-pixel dark:shadow-pixel-dark border-2 border-black shrink-0">
                <div>
                    <h1 className="text-2xl font-pixelify text-[#e6b689] uppercase tracking-wider drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
                        Deadline Manager
                    </h1>
                    <p className="text-zinc-500 font-bold text-xs mt-1 uppercase tracking-wider">Manage and calculate task urgency.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingTask(null);
                        setIsFormOpen(true);
                    }}
                    className="bg-[#e6b689] hover:bg-[#d4a373] text-black font-pixelify uppercase tracking-widest px-4 py-2 border-2 border-black shadow-pixel hover:shadow-pixel-hover active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-sm"
                >
                    + Add New Task
                </button>
            </div>

            <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* Column 1: Deadlines */}
                <div className="bg-white dark:bg-zinc-800 p-4 shadow-pixel dark:shadow-pixel-dark border-2 border-black flex flex-col min-h-[400px] max-h-[70vh]">
                    <h2 className="text-lg font-pixelify uppercase text-[#e6b689] mb-3 tracking-widest border-b-2 border-black pb-1 drop-shadow-[1px_1px_0_rgba(0,0,0,1)]">Deadlines</h2>
                    <div className="flex-1 overflow-auto">
                        {isTasksLoading ? (
                            <div className="flex w-full h-full items-center justify-center font-bold text-zinc-500">Loading your tasks...</div>
                        ) : deadlines.length === 0 ? (
                            <div className="flex w-full h-full items-center justify-center flex-col text-center">
                                <i className="hn hn-calendar-01 text-6xl text-zinc-300 dark:text-zinc-600 mb-4 [text-shadow:3px_3px_0_rgba(0,0,0,0.1)]"></i>
                                <h2 className="text-xl font-bold text-zinc-400">No strict deadlines yet.</h2>
                                <p className="text-zinc-500 font-medium italic mt-2 text-sm text-balance">"A goal is a dream with a deadline." - Napoleon Hill</p>
                            </div>
                        ) : (
                            <DeadlineList
                                tasks={deadlines}
                                subjects={currentSubjects as any}
                                onDelete={(id) => deleteTask(id)}
                                onEdit={(task) => {
                                    setEditingTask(task);
                                    setIsFormOpen(true);
                                }}
                                onToggleComplete={(task) => updateTask({ id: task._id!, updates: { isCompleted: !task.isCompleted } })}
                            />
                        )}
                    </div>
                </div>

                {/* Column 2: Todo List */}
                <div className="bg-white dark:bg-zinc-800 p-4 shadow-pixel dark:shadow-pixel-dark border-2 border-black flex flex-col min-h-[400px] max-h-[70vh]">
                    <h2 className="text-lg font-pixelify uppercase text-zinc-400 mb-3 tracking-widest border-b-2 border-zinc-400 pb-1">Ongoing / To-Do</h2>
                    <div className="flex-1 overflow-auto">
                        {isTasksLoading ? (
                            <div className="flex w-full h-full items-center justify-center font-bold text-zinc-500">Loading your tasks...</div>
                        ) : todos.length === 0 ? (
                            <div className="flex w-full h-full items-center justify-center flex-col text-center">
                                <i className="hn hn-view-list text-6xl text-zinc-300 dark:text-zinc-600 mb-4 [text-shadow:3px_3px_0_rgba(0,0,0,0.1)]"></i>
                                <h2 className="text-xl font-bold text-zinc-400">Backlog is empty!</h2>
                                <p className="text-zinc-500 font-medium italic mt-2 text-sm text-balance">Good job keeping your chores clear!</p>
                            </div>
                        ) : (
                            <DeadlineList
                                tasks={todos}
                                subjects={currentSubjects as any}
                                onDelete={(id) => deleteTask(id)}
                                onEdit={(task) => {
                                    setEditingTask(task);
                                    setIsFormOpen(true);
                                }}
                                onToggleComplete={(task) => updateTask({ id: task._id!, updates: { isCompleted: !task.isCompleted } })}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Row 2: Completed Tasks */}
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 shadow-pixel dark:shadow-pixel-dark border-2 border-black mt-2 overflow-auto">
                <h2 className="text-lg font-pixelify uppercase text-green-600 mb-3 tracking-widest border-b-2 border-green-600 pb-1">Completed Tasks</h2>
                {isTasksLoading ? (
                    <div className="flex w-full h-full min-h-[100px] items-center justify-center font-bold text-zinc-500">Loading your tasks...</div>
                ) : completedTasks.length === 0 ? (
                    <div className="flex w-full h-full min-h-[100px] items-center justify-center flex-col text-center">
                        <i className="hn hn-check-circle text-4xl text-zinc-300 dark:text-zinc-600 mb-4 [text-shadow:2px_2px_0_rgba(0,0,0,0.1)]"></i>
                        <h2 className="text-lg font-bold text-zinc-400">No completed tasks yet.</h2>
                    </div>
                ) : (
                    <DeadlineList
                        tasks={completedTasks}
                        subjects={currentSubjects as any}
                        onDelete={(id) => deleteTask(id)}
                        onEdit={(task) => {
                            setEditingTask(task);
                            setIsFormOpen(true);
                        }}
                        onToggleComplete={(task) => updateTask({ id: task._id!, updates: { isCompleted: !task.isCompleted } })}
                    />
                )}
            </div>

            {isFormOpen && (
                <DeadlineForm
                    subjects={currentSubjects as any}
                    initialData={editingTask || undefined}
                    onAdd={async (task) => {
                        if (editingTask && editingTask._id) {
                            await updateTask({ id: editingTask._id, updates: task });
                        } else {
                            await createTask(task);
                        }
                        setIsFormOpen(false);
                        setEditingTask(null);
                    }}
                    onCancel={() => {
                        setIsFormOpen(false);
                        setEditingTask(null);
                    }}
                />
            )}
        </div>
    );
}
