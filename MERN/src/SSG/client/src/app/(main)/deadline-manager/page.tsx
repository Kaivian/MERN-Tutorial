"use client";

import React, { useState } from "react";
import { useUserCurriculum } from "@/hooks/useUserCurriculum";
import { Task, Subject } from "@/types/deadline.types";
import DeadlineForm from "@/components/todo/DeadlineForm";
import DeadlineList from "@/components/todo/DeadlineList";
import { useTasks } from "@/hooks/useTasks";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { useTranslation } from "@/i18n";

export default function DeadlineManagerPage() {
    const { t } = useTranslation();
    const { tasks: backendTasks, isLoading: isTasksLoading, createTask, updateTask, deleteTask } = useTasks();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const { isOpen: isGuideOpen, onOpen: onGuideOpen, onOpenChange: onGuideOpenChange } = useDisclosure();

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
        <div className="flex flex-col w-full h-full gap-4 bg-background dark:bg-zinc-900 transition-colors duration-300 relative overflow-hidden">
            <div className="flex justify-between items-center bg-white dark:bg-zinc-800 p-4 shadow-pixel dark:shadow-pixel-dark border-2 border-black shrink-0">
                <div>
                    <h1 className="text-2xl font-jersey10 text-[#e6b689] uppercase tracking-wider drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
                        {t('deadlineManager.title')}
                    </h1>
                    <p className="text-zinc-500 font-bold text-xs mt-1 uppercase tracking-wider">{t('deadlineManager.subtitle')}</p>
                </div>
                <div className="flex gap-2 items-center">
                    <Button onPress={onGuideOpen} size="sm" radius="none" className="font-bold tracking-widest uppercase !bg-emerald-500 !text-white !shadow-[2px_2px_0_1px_rgba(0,0,0,1)] border-2 border-black hover:translate-y-[2px] h-[36px] hidden sm:flex">
                        {t('deadlineManager.guide')}
                    </Button>
                    <button
                        onClick={() => {
                            setEditingTask(null);
                            setIsFormOpen(true);
                        }}
                        className="bg-[#e6b689] hover:bg-[#d4a373] text-black font-bold uppercase tracking-widest px-4 py-2 border-2 border-black shadow-pixel hover:shadow-pixel-hover active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-sm"
                    >
                        + {t('deadlineManager.add_task')}
                    </button>
                </div>
            </div>

            <div className="flex-[3] min-h-0 grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* Column 1: Deadlines */}
                <div className="bg-white dark:bg-zinc-800 p-4 shadow-pixel dark:shadow-pixel-dark border-2 border-black flex flex-col overflow-hidden">
                    <h2 className="text-lg font-jersey10 uppercase text-[#e6b689] mb-3 tracking-widest border-b-2 border-black pb-1 drop-shadow-[1px_1px_0_rgba(0,0,0,1)] shrink-0">Deadlines</h2>
                    <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700">
                        {isTasksLoading ? (
                            <div className="flex w-full h-full min-h-[150px] items-center justify-center font-bold text-zinc-500">{t('deadlineManager.loading')}</div>
                        ) : deadlines.length === 0 ? (
                            <div className="flex w-full h-full min-h-[150px] items-center justify-center flex-col text-center">
                                <i className="hn hn-calendar-01 text-6xl text-zinc-300 dark:text-zinc-600 mb-4 [text-shadow:3px_3px_0_rgba(0,0,0,0.1)]"></i>
                                <h2 className="text-xl font-bold text-zinc-400">{t('deadlineManager.no_tasks')}</h2>
                                <p className="text-zinc-500 font-medium italic mt-2 text-sm text-balance">{t('deadlineManager.no_tasks_subtitle')}</p>
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
                <div className="bg-white dark:bg-zinc-800 p-4 shadow-pixel dark:shadow-pixel-dark border-2 border-black flex flex-col overflow-hidden">
                    <h2 className="text-lg font-jersey10 uppercase text-zinc-400 dark:text-zinc-500 mb-3 tracking-widest border-b-2 border-zinc-400 dark:border-zinc-500 pb-1 shrink-0">Ongoing / To-Do</h2>
                    <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700">
                        {isTasksLoading ? (
                            <div className="flex w-full h-full min-h-[150px] items-center justify-center font-bold text-zinc-500">{t('deadlineManager.loading')}</div>
                        ) : todos.length === 0 ? (
                            <div className="flex w-full h-full min-h-[150px] items-center justify-center flex-col text-center">
                                <i className="hn hn-view-list text-6xl text-zinc-300 dark:text-zinc-600 mb-4 [text-shadow:3px_3px_0_rgba(0,0,0,0.1)]"></i>
                                <h2 className="text-xl font-bold text-zinc-400">{t('deadlineManager.no_tasks')}</h2>
                                <p className="text-zinc-500 font-medium italic mt-2 text-sm text-balance">{t('deadlineManager.no_tasks_subtitle')}</p>
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
            <div className="flex-[2] min-h-0 bg-zinc-50 dark:bg-zinc-800/50 p-4 shadow-pixel dark:shadow-pixel-dark border-2 border-black flex flex-col overflow-hidden">
                <h2 className="text-lg font-jersey10 uppercase text-green-600 mb-3 tracking-widest border-b-2 border-green-600 pb-1 shrink-0">{t('deadlineManager.completed_tasks')}</h2>
                <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700">
                    {isTasksLoading ? (
                        <div className="flex w-full h-full min-h-[100px] items-center justify-center font-bold text-zinc-500">{t('deadlineManager.loading')}</div>
                    ) : completedTasks.length === 0 ? (
                        <div className="flex w-full h-full min-h-[100px] items-center justify-center flex-col text-center">
                            <i className="hn hn-check-circle text-4xl text-zinc-300 dark:text-zinc-600 mb-4 [text-shadow:2px_2px_0_rgba(0,0,0,0.1)]"></i>
                            <h2 className="text-lg font-bold text-zinc-400">{t('deadlineManager.no_tasks')}</h2>
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

            {/* USER GUIDE MODAL */}
            <Modal isOpen={isGuideOpen} onOpenChange={onGuideOpenChange} classNames={{ base: "border-4 border-black rounded-none shadow-[8px_8px_0_rgba(0,0,0,1)] bg-white dark:bg-zinc-900 p-2", closeButton: "hover:bg-red-500 border-2 border-transparent hover:border-black rounded-none" }}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 border-b-4 border-black text-xl font-bold text-black dark:text-white uppercase shrink-0">
                                Hướng Dẫn: Quản Lý Deadline
                            </ModalHeader>
                            <ModalBody className="py-4 flex flex-col gap-3 text-sm md:text-base leading-relaxed text-black dark:text-white">
                                <p><strong>Thêm Công Việc Mới:</strong> Nhấn "+ Add New Task" để thiết lập một công việc. Nếu có ngày hết hạn nhất định thì hệ thống sẽ nhận diện là Sự kiện (Deadlines). Nếu chỉ điền việc cần làm thì nó là Vồn đọng/Sắp xếp (Ongoing / To-Do).</p>
                                <p><strong>Phân Bổ Xử Lý:</strong> Bảng Deadlines dành cho những hạn chót cứng nhắc cần ưu tiên xử lý. Bảng To-Do dành cho những trách nhiệm dài hạn chạy nền thời gian tuỳ ý.</p>
                                <p><strong>Hoàn Thành Ngay:</strong> Đánh dấu tích vào ô báo hiệu (Checkbox) để ngay lập tức chuyển tác vụ đó xuống rổ đã "Completed" ở góc dưới màn hình, ghi nhận năng suất của bạn.</p>
                                <p><strong>Chỉnh Sửa (Edit) / Xoá (Delete):</strong> Nút bút màu vàng dùng để cập nhật lại tên, thời hạn, đánh dấu môn học... Còn biểu tượng thùng rác màu đỏ có thể dùng để xóa sự kiện đi mất vĩnh viễn.</p>
                            </ModalBody>
                            <ModalFooter className="border-t-4 border-black shrink-0">
                                <Button color="primary" onPress={onClose} className="border-2 border-black rounded-none shadow-[2px_2px_0_rgba(0,0,0,1)] font-bold uppercase">
                                    Đã hiểu
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
