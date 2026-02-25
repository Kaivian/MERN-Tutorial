"use client";

import React, { useState, useMemo } from "react";
import { Task, Subject, GradeCategory, SubTask } from "@/types/deadline.types";
import { v4 as uuidv4 } from "uuid";

interface DeadlineFormProps {
    subjects: Subject[];
    initialData?: Task;
    onAdd: (task: Partial<Task>) => void;
    onCancel: () => void;
}

export default function DeadlineForm({ subjects, initialData, onAdd, onCancel }: DeadlineFormProps) {
    const defaultSubjectId = initialData?.subjectId || (subjects.length > 0 ? subjects[0].id : "personal");
    const [name, setName] = useState(initialData?.name || "");
    const [subjectId, setSubjectId] = useState(defaultSubjectId);

    // Check if an assessment plan exists for standard subjects
    const selectedSubject = useMemo(() => subjects.find(s => s.id === subjectId), [subjects, subjectId]);
    const assessmentOptions = useMemo(() => selectedSubject?.assessment_plan || [], [selectedSubject]);

    // Dynamic default category & weight based on first available assessment
    const defaultCat = initialData?.category || (assessmentOptions.length > 0 ? assessmentOptions[0].category : "Assignment");
    const defaultWt = initialData?.weight || (assessmentOptions.length > 0 ? assessmentOptions[0].weight_percent : 10);

    const [category, setCategory] = useState<GradeCategory | string>(defaultCat);
    const [weight, setWeight] = useState(defaultWt);

    const [startDate, setStartDate] = useState(() => initialData?.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16));
    const [hasDeadline, setHasDeadline] = useState(initialData ? !!initialData.endDate : true);
    const [endDate, setEndDate] = useState(() => initialData?.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16));

    const [slot, setSlot] = useState(initialData?.slot || 1);
    const [difficulty, setDifficulty] = useState(initialData?.difficulty || 3);
    const [estimatedHours, setEstimatedHours] = useState(initialData?.estimatedHours || 5);
    const [subTasks, setSubTasks] = useState<SubTask[]>(initialData?.subTasks || []);
    const [newSubTaskTitle, setNewSubTaskTitle] = useState("");
    const [color, setColor] = useState(initialData?.color || "#000000"); // for personal tasks

    // Recalculate urgency score on the fly (derived state)
    const urgencyScore = useMemo(() => {
        if (!hasDeadline) return 0;

        const end = new Date(endDate).getTime();
        const now = new Date().getTime();
        const timeRemainingDays = Math.max((end - now) / (1000 * 3600 * 24), 0.1); // Prevent div by 0

        let score = 0;
        if (subjectId === 'personal') {
            score = difficulty / timeRemainingDays;
        } else {
            score = (weight * difficulty) / timeRemainingDays;
        }

        return Number(score.toFixed(2));
    }, [weight, difficulty, endDate, subjectId, hasDeadline]);

    const handleAddSubTask = () => {
        if (!newSubTaskTitle.trim()) return;
        setSubTasks([...subTasks, { id: uuidv4(), title: newSubTaskTitle, isCompleted: false }]);
        setNewSubTaskTitle("");
    };

    const handleRemoveSubTask = (id: string) => {
        setSubTasks(subTasks.filter(st => st.id !== id));
    };

    const handleToggleSubTask = (id: string) => {
        setSubTasks(subTasks.map(st => st.id === id ? { ...st, isCompleted: !st.isCompleted } : st));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newTask: Partial<Task> = {
            name,
            subjectId,
            category: subjectId === 'personal' ? undefined : (category as GradeCategory),
            weight: subjectId === 'personal' ? undefined : weight,
            slot: subjectId === 'personal' ? undefined : slot,
            color: subjectId === 'personal' ? color : undefined,
            startDate,
            endDate: hasDeadline ? endDate : null,
            difficulty,
            estimatedHours,
            subTasks,
            urgencyScore
        };
        onAdd(newTask);
    };

    const formLabelClass = "block text-sm font-bold uppercase tracking-wider mb-1 text-zinc-600 dark:text-zinc-400";
    const inputClass = "w-full bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 p-2 focus:outline-none focus:border-[#e6b689] shadow-[2px_2px_0_#000] font-medium";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-800 border-4 border-black shadow-[8px_8px_0_#000] w-full max-w-2xl max-h-[90vh] overflow-auto rounded-xl flex flex-col">
                <div className="p-6 border-b-4 border-black bg-[#e6b689] text-black">
                    <h2 className="text-2xl font-black uppercase tracking-tighter">{initialData ? "Edit Deadline" : "Add New Deadline"}</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Field: Name */}
                        <div className="col-span-1 md:col-span-2">
                            <label className={formLabelClass}>Task Name (e.g., Assignment 1)</label>
                            <input required type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="Enter task name..." />
                        </div>

                        {/* Field: Subject */}
                        <div>
                            <label className={formLabelClass}>Subject</label>
                            <select
                                value={subjectId}
                                onChange={e => {
                                    setSubjectId(e.target.value);
                                    if (e.target.value !== 'personal') {
                                        const sel = subjects.find(s => s.id === e.target.value);
                                        if (sel && sel.assessment_plan && sel.assessment_plan.length > 0) {
                                            setCategory(sel.assessment_plan[0].category);
                                            setWeight(sel.assessment_plan[0].weight_percent);
                                        }
                                    }
                                }}
                                className={inputClass}
                            >
                                <option value="personal">👤 Personal Task</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>📚 {s.name}</option>)}
                            </select>
                        </div>

                        {/* Academic Fields (Hidden if Personal) */}
                        {subjectId !== 'personal' && (
                            <>
                                <div>
                                    <label className={formLabelClass}>Grade Category</label>
                                    <select
                                        value={category}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setCategory(val);
                                            const plan = assessmentOptions.find(p => p.category === val);
                                            if (plan) setWeight(plan.weight_percent);
                                        }}
                                        className={inputClass}
                                    >
                                        {assessmentOptions.length > 0 ? (
                                            assessmentOptions.map(p => (
                                                <option key={p.category} value={p.category}>
                                                    {p.category} ({p.weight_percent}%)
                                                </option>
                                            ))
                                        ) : (
                                            <option value="Assignment">Assignment</option>
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label className={formLabelClass}>Weight (%)</label>
                                    <input
                                        disabled={assessmentOptions.length > 0}
                                        required
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={weight}
                                        onChange={e => setWeight(Number(e.target.value))}
                                        className={`${inputClass} disabled:opacity-50 disabled:bg-zinc-100 disabled:cursor-not-allowed`}
                                    />
                                    {assessmentOptions.length > 0 && <p className="text-xs text-zinc-500 mt-1 font-bold italic">Auto-locked by Syllabus</p>}
                                </div>
                                <div>
                                    <label className={formLabelClass}>FPT Slot (1-6)</label>
                                    <input required type="number" min="1" max="6" value={slot} onChange={e => setSlot(Number(e.target.value))} className={inputClass} />
                                </div>
                            </>
                        )}

                        {/* Custom Color field (Visible if Personal) */}
                        {subjectId === 'personal' && (
                            <div className="col-span-1 md:col-span-2">
                                <label className={formLabelClass}>Label Color</label>
                                <div className="flex gap-2 items-center">
                                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-12 h-12 p-1 border-2 border-black bg-white cursor-pointer" />
                                    <span className="font-mono font-bold text-zinc-500">{color}</span>
                                </div>
                            </div>
                        )}

                        {/* Field: Timings */}
                        <div>
                            <label className={formLabelClass}>Start Date</label>
                            <input required type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className={formLabelClass} style={{ marginBottom: 0 }}>End Date</label>
                                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-500">
                                    <input type="checkbox" checked={hasDeadline} onChange={e => setHasDeadline(e.target.checked)} className="accent-[#e6b689]" />
                                    Has Deadline?
                                </label>
                            </div>
                            {hasDeadline ? (
                                <input required type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClass} />
                            ) : (
                                <div className="w-full bg-zinc-100 dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 p-2 font-medium text-zinc-500 italic text-center">
                                    No Deadline (Ongoing Task)
                                </div>
                            )}
                        </div>

                        {/* Field: Workload */}
                        <div>
                            <label className={formLabelClass}>Difficulty (1-5)</label>
                            <input required type="number" min="1" max="5" value={difficulty} onChange={e => setDifficulty(Number(e.target.value))} className={inputClass} />
                        </div>
                        <div>
                            <label className={formLabelClass}>Est. Hours</label>
                            <input required type="number" min="0" step="0.5" value={estimatedHours} onChange={e => setEstimatedHours(Number(e.target.value))} className={inputClass} />
                        </div>
                    </div>

                    <div className="bg-zinc-100 dark:bg-zinc-900 border-2 border-black p-4 mt-2">
                        <h3 className="font-bold uppercase tracking-widest text-[#e6b689] flex items-center justify-between mb-2">
                            <span>Urgency Score </span>
                            <span className="text-2xl font-black text-black dark:text-white px-2 py-1 bg-[#e6b689] border-2 border-black shadow-[2px_2px_0_#000]">{urgencyScore}</span>
                        </h3>
                        <p className="text-xs font-medium text-zinc-500">
                            Calculated as: {subjectId === 'personal' ? "Difficulty / Days Remaining" : "(Weight × Difficulty) / Days Remaining"}
                        </p>
                    </div>

                    {/* Sub-tasks */}
                    <div className="border-t-2 border-zinc-200 dark:border-zinc-700 pt-6">
                        <label className={formLabelClass}>Sub-Tasks</label>
                        <div className="flex gap-2 mb-4">
                            <input type="text" value={newSubTaskTitle} onChange={e => setNewSubTaskTitle(e.target.value)} className={inputClass} placeholder="Add a sub-task..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSubTask())} />
                            <button type="button" onClick={handleAddSubTask} className="bg-black text-white px-4 font-bold border-2 border-black hover:bg-zinc-800 shrink-0">Add</button>
                        </div>

                        <ul className="flex flex-col gap-2">
                            {subTasks.map(st => (
                                <li key={st.id} className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 p-2 border-2 border-black">
                                    <div className="flex items-center gap-3">
                                        <input type="checkbox" checked={st.isCompleted} onChange={() => handleToggleSubTask(st.id)} className="w-5 h-5 accent-[#e6b689] cursor-pointer" />
                                        <span className={st.isCompleted ? "line-through text-zinc-400" : "font-semibold"}>{st.title}</span>
                                    </div>
                                    <button type="button" onClick={() => handleRemoveSubTask(st.id)} className="text-red-500 hover:text-red-700 font-bold">X</button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-4 mt-4 pt-4 border-t-2 border-black">
                        <button type="button" onClick={onCancel} className="px-6 py-2 font-bold text-black bg-zinc-200 border-2 border-black hover:bg-zinc-300 shadow-[2px_2px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase">
                            Cancel
                        </button>
                        <button type="submit" className="px-6 py-2 font-bold text-black bg-[#e6b689] border-2 border-black hover:bg-[#d4a373] shadow-[2px_2px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase">
                            {initialData ? "Update Deadline" : "Save Deadline"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
