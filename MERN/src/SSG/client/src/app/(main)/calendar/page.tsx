"use client";

import React, { useState } from "react";
import { useUserCurriculum } from "@/hooks/useUserCurriculum";
import { Subject, Task } from "@/types/deadline.types";
import CalendarViews from "@/components/todo/calendar/CalendarViews";
import { useTasks } from "@/hooks/useTasks";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";

export default function CalendarPage() {
    const [currentView, setCurrentView] = useState<"Day" | "Week" | "Month" | "Year">("Week");
    const [currentAnchorDate, setCurrentAnchorDate] = useState<Date>(new Date());
    const { data: userCurriculum } = useUserCurriculum();

    // Guide Modal
    const { isOpen: isGuideOpen, onOpen: onGuideOpen, onOpenChange: onGuideOpenChange } = useDisclosure();

    // Map backend curriculum subjects to Deadline Manager Subject interface
    const currentSubjects: Subject[] = React.useMemo(() => {
        if (!userCurriculum?.subjects) return [];
        return userCurriculum.subjects.map((sub, index) => {
            const colors = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#eab308"];
            return {
                id: sub.id,
                name: sub.code,
                color: colors[index % colors.length],
                assessment_plan: sub.assessment_plan
            };
        });
    }, [userCurriculum]);

    const { tasks: backendTasks, isLoading: isTasksLoading } = useTasks();

    return (
        <div className="flex flex-col w-full h-full gap-4 bg-background dark:bg-zinc-900 transition-colors duration-300 relative overflow-y-auto overflow-x-auto [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-zinc-800 p-4 shadow-pixel dark:shadow-pixel-dark border-2 border-black shrink-0 gap-4">
                <div>
                    <h1 className="text-2xl font-pixelify text-[#e6b689] uppercase tracking-wider drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
                        Calendar Hub
                    </h1>
                    <p className="text-zinc-500 font-bold text-xs mt-1 uppercase tracking-wider">Visualize deadlines and workload.</p>
                </div>

                <div className="flex flex-col md:flex-row items-end md:items-center gap-2">
                    <Button onPress={onGuideOpen} size="sm" radius="none" className="font-bold tracking-widest uppercase !bg-emerald-500 !text-white !font-sans shadow-[2px_2px_0_1px_rgba(0,0,0,1)] border-2 border-black hover:translate-y-[2px] mb-2 md:mb-0 mr-0 md:mr-4">
                        Hướng dẫn
                    </Button>
                    {/* View Switcher & Date Navigation Row */}
                    <div className="flex flex-wrap items-stretch gap-2">
                        {/* View Switcher */}
                        <div className="flex bg-zinc-100 dark:bg-zinc-900 border-2 border-black p-1 shadow-pixel dark:shadow-pixel-dark">
                            {(["Day", "Week", "Month", "Year"] as const).map(view => (
                                <button
                                    key={view}
                                    onClick={() => setCurrentView(view)}
                                    className={`px-3 py-1.5 font-pixelify uppercase tracking-widest text-sm transition-colors ${currentView === view
                                        ? "bg-[#e6b689] text-black border-2 border-black shadow-pixel-hover"
                                        : "text-zinc-500 hover:text-black dark:hover:text-white border-2 border-transparent"
                                        }`}
                                >
                                    {view}
                                </button>
                            ))}
                        </div>

                        {/* Date Navigation */}
                        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 border-2 border-black p-1 shadow-pixel dark:shadow-pixel-dark">
                            <button
                                onClick={() => {
                                    const newDate = new Date(currentAnchorDate);
                                    if (currentView === "Day") newDate.setDate(newDate.getDate() - 1);
                                    if (currentView === "Week") newDate.setDate(newDate.getDate() - 7);
                                    if (currentView === "Month") {
                                        const prevMonth = newDate.getMonth() - 1;
                                        newDate.setMonth(prevMonth);
                                        if (newDate.getMonth() !== ((prevMonth % 12 + 12) % 12)) {
                                            newDate.setDate(0); // If day overflow, push block to end of previous month
                                        }
                                    }
                                    if (currentView === "Year") newDate.setFullYear(newDate.getFullYear() - 1);
                                    setCurrentAnchorDate(newDate);
                                }}
                                className="px-2 py-1.5 font-pixelify text-sm transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white"
                            >
                                <i className="hn hn-arrow-left"></i>
                            </button>

                            <button
                                onClick={() => setCurrentAnchorDate(new Date())}
                                className="px-3 py-1.5 font-pixelify text-xs uppercase tracking-widest transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white font-bold"
                            >
                                Today
                            </button>

                            <button
                                onClick={() => {
                                    const newDate = new Date(currentAnchorDate);
                                    if (currentView === "Day") newDate.setDate(newDate.getDate() + 1);
                                    if (currentView === "Week") newDate.setDate(newDate.getDate() + 7);
                                    if (currentView === "Month") {
                                        const nextMonth = newDate.getMonth() + 1;
                                        newDate.setMonth(nextMonth);
                                        if (newDate.getMonth() !== (nextMonth % 12)) {
                                            newDate.setDate(0); // If day overflow, push block to end of resulting month
                                        }
                                    }
                                    if (currentView === "Year") newDate.setFullYear(newDate.getFullYear() + 1);
                                    setCurrentAnchorDate(newDate);
                                }}
                                className="px-2 py-1.5 font-pixelify text-sm transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white"
                            >
                                <i className="hn hn-arrow-right"></i>
                            </button>

                            <div className="border-l-2 border-zinc-300 dark:border-zinc-700 mx-1 h-6"></div>

                            <div className="relative flex items-center px-2 cursor-pointer h-full">
                                <span className="font-pixelify text-sm uppercase text-black dark:text-white mr-2 whitespace-nowrap">
                                    {(() => {
                                        const isToday = currentAnchorDate.toDateString() === new Date().toDateString();
                                        if (currentView === "Day") {
                                            return isToday ? "Today" : currentAnchorDate.toLocaleDateString('en-US', { weekday: 'long' });
                                        }
                                        if (currentView === "Week") {
                                            const d = new Date(Date.UTC(currentAnchorDate.getFullYear(), currentAnchorDate.getMonth(), currentAnchorDate.getDate()));
                                            const dayNum = d.getUTCDay() || 7;
                                            d.setUTCDate(d.getUTCDate() + 4 - dayNum);
                                            const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
                                            const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
                                            return `Week ${weekNo}`;
                                        }
                                        if (currentView === "Month") {
                                            return `Month ${currentAnchorDate.getMonth() + 1}`;
                                        }
                                        if (currentView === "Year") {
                                            return `Year ${currentAnchorDate.getFullYear()}`;
                                        }
                                        return "";
                                    })()}
                                </span>
                                <div className="relative w-5 h-5 overflow-hidden flex items-center justify-center">
                                    <i className="hn hn-calendar text-lg absolute pointer-events-none text-black dark:text-white"></i>
                                    <input
                                        type="date"
                                        value={currentAnchorDate.toLocaleDateString('en-CA')} // Force YYYY-MM-DD local format
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                const [year, month, day] = e.target.value.split('-');
                                                const d = new Date(Number(year), Number(month) - 1, Number(day));
                                                if (!isNaN(d.getTime())) setCurrentAnchorDate(d);
                                            }
                                        }}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-white dark:bg-zinc-800 p-4 shadow-pixel dark:shadow-pixel-dark border-2 border-black overflow-hidden flex flex-col min-h-0">
                {isTasksLoading ? (
                    <div className="flex w-full h-full items-center justify-center font-bold text-zinc-500">Loading your tasks...</div>
                ) : (
                    <CalendarViews currentView={currentView} subjects={currentSubjects as any} tasks={backendTasks} anchorDate={currentAnchorDate} />
                )}
            </div>

            {/* USER GUIDE MODAL */}
            <Modal isOpen={isGuideOpen} onOpenChange={onGuideOpenChange} classNames={{ base: "border-4 border-black rounded-none shadow-[8px_8px_0_rgba(0,0,0,1)] bg-white dark:bg-zinc-900 p-2 font-sans", closeButton: "hover:bg-red-500 border-2 border-transparent hover:border-black rounded-none" }}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 border-b-4 border-black text-xl font-bold font-sans text-black dark:text-white uppercase shrink-0">
                                Hướng Dẫn: Lịch Sự Kiện
                            </ModalHeader>
                            <ModalBody className="py-4 flex flex-col gap-3 font-sans text-sm md:text-base leading-relaxed text-black dark:text-white">
                                <p><strong>Chế độ xem:</strong> Sử dụng các nút (Day/Week/Month/Year) để linh hoạt chuyển đổi lưới hiển thị thời gian, tùy thuộc vào tầm nhìn phân bổ của bạn đối với công việc.</p>
                                <p><strong>Điều hướng vị trí:</strong> Sử dụng mũi tên Trái/Phải để chuyển tới hoặc lùi lại khoảng thời gian tương ứng. Nút "Today" lập tức đưa bạn về ngày hiện tại.</p>
                                <p><strong>Chọn ngày nhanh:</strong> Nhấn vào biểu tượng lịch nhỏ cạnh mục ngày tháng để truy cập một ngày bất kỳ mà không cần click mũi tên nhiều lần.</p>
                                <p><strong>Hiển thị Sự Kiện:</strong> Các bài tập, hạn chót (Deadline) và thẻ nhiệm vụ (To-Do) ở Manager sẽ tự động đồng bộ hóa màu sắc trên lịch để bạn có cái nhìn tổng quan nhất.</p>
                            </ModalBody>
                            <ModalFooter className="border-t-4 border-black shrink-0">
                                <Button color="primary" onPress={onClose} className="border-2 border-black rounded-none shadow-[2px_2px_0_rgba(0,0,0,1)] font-bold font-sans uppercase">
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
