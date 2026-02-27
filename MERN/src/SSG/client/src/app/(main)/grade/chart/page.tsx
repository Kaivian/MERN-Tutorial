"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/auth.provider";
import {
    Card,
    CardHeader,
    CardBody,
    Select,
    SelectItem,
    Spinner,
    Selection,
    Button,
    cn,
    Tabs,
    Tab,
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure
} from "@heroui/react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from "recharts";
import { useUserAnalytics } from "@/hooks/useUserAnalytics";
import { UserAnalyticsTermDetail } from "@/types/user-curriculum.types";
import { useTranslation } from "@/i18n";

// New Components
import GradeFrequencyChart from "./components/GradeFrequencyChart";
import GpaAreaChart from "./components/GpaAreaChart";
import SubjectProgressionChart from "./components/SubjectProgressionChart";
import GradeBoxPlot from "./components/GradeBoxPlot";
import WeightStackedChart from "./components/WeightStackedChart";
import GradeHeatmap from "./components/GradeHeatmap";

export default function GradeChartPage() {
    const { user } = useAuth();
    const { data: analyticsData, isLoading } = useUserAnalytics();
    const { t } = useTranslation();

    // --- COMPARISON STATE (Legacy Bar Chart) ---
    const [selectedTerm1, setSelectedTerm1] = useState<Selection>(new Set([]));
    const [selectedTerm2, setSelectedTerm2] = useState<Selection>(new Set([]));

    // --- FILTER STATE ---
    const [filterMode, setFilterMode] = useState<string>("all_graded");
    const [filterSingleTerm, setFilterSingleTerm] = useState<Selection>(new Set([]));
    const [filterRangeStart, setFilterRangeStart] = useState<Selection>(new Set([]));
    const [filterRangeEnd, setFilterRangeEnd] = useState<Selection>(new Set([]));

    // Guide Modal
    const { isOpen: isGuideOpen, onOpen: onGuideOpen, onOpenChange: onGuideOpenChange } = useDisclosure();

    // Initialize selections when terms load
    useEffect(() => {
        if (analyticsData?.termDetails) {
            const terms = Object.keys(analyticsData.termDetails);
            if (terms.length > 0 && Array.from(filterSingleTerm).length === 0) {
                setFilterSingleTerm(new Set([terms[terms.length - 1]]));
                setFilterRangeStart(new Set([terms[0]]));
                setFilterRangeEnd(new Set([terms[terms.length - 1]]));
            }
        }
    }, [analyticsData]);

    const termsList = useMemo(() => {
        if (!analyticsData?.termDetails) return [];
        return Object.keys(analyticsData.termDetails).map(k => ({
            key: k,
            label: k.replace('sem_', 'Semester ')
        }));
    }, [analyticsData]);

    // Derived Filtered Data for new charts
    const filteredTermDetails = useMemo(() => {
        if (!analyticsData?.termDetails) return {};
        const allTerms = Object.keys(analyticsData.termDetails);

        if (filterMode === "all") return analyticsData.termDetails;

        if (filterMode === "all_graded") {
            const result: Record<string, UserAnalyticsTermDetail[]> = {};
            for (const term of allTerms) {
                const hasGrade = analyticsData.termDetails[term].some(s => s.score !== null);
                if (hasGrade) result[term] = analyticsData.termDetails[term];
            }
            return result;
        }

        if (filterMode === "single") {
            const term = Array.from(filterSingleTerm)[0] as string;
            if (term && analyticsData.termDetails[term]) {
                return { [term]: analyticsData.termDetails[term] };
            }
            return {};
        }

        if (filterMode === "range") {
            const start = Array.from(filterRangeStart)[0] as string;
            const end = Array.from(filterRangeEnd)[0] as string;
            if (start && end) {
                const startIndex = allTerms.indexOf(start);
                const endIndex = allTerms.indexOf(end);
                const trueStart = Math.min(startIndex, endIndex);
                const trueEnd = Math.max(startIndex, endIndex);

                const result: Record<string, UserAnalyticsTermDetail[]> = {};
                for (let i = trueStart; i <= trueEnd; i++) {
                    result[allTerms[i]] = analyticsData.termDetails[allTerms[i]];
                }
                return result;
            }
            return {};
        }

        return analyticsData.termDetails;
    }, [analyticsData, filterMode, filterSingleTerm, filterRangeStart, filterRangeEnd]);

    const flatFilteredSubjects = useMemo(() => {
        return Object.values(filteredTermDetails).flat();
    }, [filteredTermDetails]);

    // --- MEMOIZED CHARTS DATA (Overall) ---
    const lineChartData = useMemo(() => {
        return analyticsData?.termGpas || [];
    }, [analyticsData]);

    const pieChartData = useMemo(() => {
        return analyticsData?.subjectStatuses || [];
    }, [analyticsData]);

    // For Term Comparison Bar Chart
    const comparisonData = useMemo(() => {
        if (!analyticsData?.termDetails) return [];

        const t1 = Array.from(selectedTerm1)[0] as string;
        const t2 = Array.from(selectedTerm2)[0] as string;

        if (!t1 && !t2) return [];

        const data = [];
        if (t1 && analyticsData.termDetails[t1]) {
            const subjects = analyticsData.termDetails[t1];
            const avgScore = subjects.reduce((sum, s) => sum + (s.score || 0), 0) / (subjects.length || 1);
            data.push({ name: t1.replace('sem_', 'Sem '), score: Number(avgScore.toFixed(2)), fill: '#e6b689' });
        }
        if (t2 && analyticsData.termDetails[t2]) {
            const subjects = analyticsData.termDetails[t2];
            const avgScore = subjects.reduce((sum, s) => sum + (s.score || 0), 0) / (subjects.length || 1);
            data.push({ name: t2.replace('sem_', 'Sem '), score: Number(avgScore.toFixed(2)), fill: '#10b981' });
        }
        return data;
    }, [analyticsData, selectedTerm1, selectedTerm2]);

    // --- STYLES (MATCHES MAIN GRADE PAGE) ---
    const commonSelectStyles = {
        trigger: "border-zinc-600 data-[hover=true]:border-[#e6b689] dark:data-[hover=true]:border-[#9d744d] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] transition-all duration-150 data-[open=true]:translate-x-[2px] data-[open=true]:translate-y-[2px] data-[open=true]:shadow-none data-[open=true]:border-[#e6b689]",
        label: "text-zinc-500 uppercase font-bold tracking-wider text-[12px]",
        value: "font-bold text-zinc-300",
        popoverContent: "rounded-none border-2 border-[#e6b689] mx-[2px] data-[selected=true]:bg-zinc-800 data-[selected=true]:text-[#e6b689] data-[selected=true]:font-bold",
    };

    const commonListboxProps = {
        itemClasses: {
            base: [
                "rounded-none", "text-zinc-500", "transition-colors", "outline-none",
                "data-[focus-visible=true]:ring-0", "data-[focus-visible=true]:ring-offset-0",
                "data-[hover=true]:!bg-[#e6b689]", "data-[hover=true]:!text-zinc-900",
                "data-[selected=true]:!bg-[#e6b689]", "data-[selected=true]:!text-zinc-900", "data-[selected=true]:font-bold",
                "data-[focus=true]:!bg-[#e6b689]", "data-[focus=true]:!text-zinc-900",
            ].join(" "),
        },
    };

    const buttonStyles = "bg-[#e6b689] hover:bg-[#d4a373] text-black border-2 border-black font-jersey10 min-w-10 h-10 shadow-pixel hover:shadow-pixel-hover active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all";

    return (
        <div className="flex flex-col gap-3 h-full overflow-y-auto transition-colors duration-300 rounded-xl pb-20 pr-2">
            {/* HEADER SECTION */}
            <div className="w-full relative z-20 flex flex-col gap-3 shrink-0">
                <section className="w-full">
                    <Card className="h-full bg-white dark:bg-[#18181b] 
  border-t-0 border-x-0 border-b-2 
  border-b-[#e6b689] dark:border-b-[#9d744d] 
  rounded-xl overflow-hidden relative 
  shadow-none dark:border-x dark:border-y dark:border-divider"
                    >
                        {/* Background pattern */}
                        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none 
    bg-[radial-gradient(#71717a_1px,transparent_1px)] 
    bg-size-[16px_16px]"
                        />

                        <CardHeader
                            className="relative z-10 
      flex flex-row items-center justify-between 
      px-5 py-4 md:px-6 md:py-5 
      h-full"
                        >
                            {/* Left content */}
                            <div className="flex flex-col gap-3">
                                {/* Title */}
                                <h1 className="text-3xl md:text-4xl font-black 
        text-retro-orange dark:text-white 
        uppercase tracking-wide 
        whitespace-nowrap
        [text-shadow:2px_2px_0_#c47c16] 
        md:[text-shadow:3px_3px_0_#c47c16]"
                                >
                                    {t('gradeChart.title')}
                                </h1>

                                {/* Player info */}
                                <div className="flex flex-col gap-1 
        text-[11px] md:text-sm 
        font-bold tracking-widest uppercase"
                                >
                                    <div className="flex items-center gap-1">
                                        <span className="text-zinc-500">
                                            {t('gradeChart.player')}:
                                        </span>
                                        <span className="text-zinc-900 dark:text-zinc-200 truncate">
                                            {user?.fullName || user?.username}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Right side button */}
                            <div className="flex items-center">
                                <Button
                                    onPress={onGuideOpen}
                                    radius="none"
                                    className={cn(
                                        buttonStyles,
                                        "font-bold tracking-widest uppercase hidden sm:flex !bg-emerald-500 !text-white"
                                    )}
                                >
                                    {t('grade.guide')}
                                </Button>
                            </div>
                        </CardHeader>
                    </Card>
                </section>
            </div>

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center p-20">
                    <Spinner color="warning" label="Crunching Numbers..." size="lg" />
                </div>
            ) : (
                <div className="flex flex-col gap-6">

                    {/* FILTER SECTION */}
                    <Card className="w-full bg-white dark:bg-[#18181b] border-t-0 border-x-0 border-b-2 border-b-zinc-600 rounded-xl relative shadow-none dark:border-divider">
                        <CardBody className="py-4 px-6 flex flex-col lg:flex-row gap-6 items-center justify-between">
                            <div className="flex items-center gap-4 w-full">
                                <i className="hn hn-filter text-2xl text-zinc-400" />
                                <Tabs
                                    selectedKey={filterMode}
                                    onSelectionChange={(k) => setFilterMode(k as string)}
                                    color="warning"
                                    variant="underlined"
                                    classNames={{
                                        tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                                        cursor: "w-full bg-[#e6b689]",
                                        tab: "max-w-fit px-0 h-10 font-bold uppercase tracking-widest text-[12px]",
                                        tabContent: "group-data-[selected=true]:text-[#e6b689]"
                                    }}
                                >
                                    <Tab key="all_graded" title="Graded Terms" />
                                    <Tab key="all" title="All Terms" />
                                    <Tab key="single" title="Single Term" />
                                    <Tab key="range" title="Term Range" />
                                </Tabs>
                            </div>

                            {/* Dynamic Filter Controls */}
                            <div className="flex gap-4 w-full lg:w-auto min-w-max justify-end">
                                {filterMode === "single" && (
                                    <Select
                                        size="sm"
                                        variant="bordered"
                                        radius="none"
                                        labelPlacement="outside"
                                        placeholder="Select Term"
                                        className="w-48"
                                        selectedKeys={filterSingleTerm}
                                        onSelectionChange={setFilterSingleTerm}
                                        classNames={commonSelectStyles}
                                        listboxProps={commonListboxProps}
                                    >
                                        {termsList.map((t) => (
                                            <SelectItem key={t.key}>{t.label}</SelectItem>
                                        ))}
                                    </Select>
                                )}

                                {filterMode === "range" && (
                                    <>
                                        <Select
                                            size="sm"
                                            variant="bordered"
                                            radius="none"
                                            labelPlacement="outside"
                                            placeholder="Start Term"
                                            className="w-40"
                                            selectedKeys={filterRangeStart}
                                            onSelectionChange={setFilterRangeStart}
                                            classNames={commonSelectStyles}
                                            listboxProps={commonListboxProps}
                                        >
                                            {termsList.map((t) => (
                                                <SelectItem key={t.key}>{t.label}</SelectItem>
                                            ))}
                                        </Select>
                                        <span className="text-zinc-500 font-bold self-center">to</span>
                                        <Select
                                            size="sm"
                                            variant="bordered"
                                            radius="none"
                                            labelPlacement="outside"
                                            placeholder="End Term"
                                            className="w-40"
                                            selectedKeys={filterRangeEnd}
                                            onSelectionChange={setFilterRangeEnd}
                                            classNames={commonSelectStyles}
                                            listboxProps={commonListboxProps}
                                        >
                                            {termsList.map((t) => (
                                                <SelectItem key={t.key}>{t.label}</SelectItem>
                                            ))}
                                        </Select>
                                    </>
                                )}
                            </div>
                        </CardBody>
                    </Card>

                    {/* NEW CHARTS GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <GradeFrequencyChart subjects={flatFilteredSubjects} />
                        <GradeBoxPlot termDetails={filteredTermDetails} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <GradeHeatmap termDetails={filteredTermDetails} />
                        <div className="flex flex-col gap-6">
                            <SubjectProgressionChart subjects={flatFilteredSubjects} />
                            <WeightStackedChart subjects={flatFilteredSubjects} />
                        </div>
                    </div>

                    <div className="w-full border-t border-dashed border-zinc-700 my-6"></div>

                    {/* LEGACY CHARTS GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* --- LINE CHART: CUMULATIVE GPA TREND --- */}
                        <Card className="lg:col-span-2 min-h-[400px] bg-white dark:bg-[#18181b] border-t-0 border-x-0 border-b-2 border-b-[#e6b689] rounded-xl relative shadow-none dark:border-divider">
                            <CardHeader className="pb-0 pt-6 px-6 flex-col items-start border-b border-zinc-200 dark:border-zinc-800/50">
                                <h4 className="font-black text-xl text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                                    <i className="hn hn-chart-line text-[#e6b689]" /> {t('gradeChart.overallGPATrend')}
                                </h4>
                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1 mb-4">
                                    {t('gradeChart.termVsCumulativePerformance')}
                                </p>
                            </CardHeader>
                            <CardBody className="pt-6">
                                <div className="w-full h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={lineChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" strokeOpacity={0.5} vertical={false} className="dark:stroke-[#27272a] dark:stroke-opacity-100" />
                                            <XAxis dataKey="term" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12, fontWeight: 'bold' }} />
                                            <YAxis domain={[0, 10]} stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12, fontWeight: 'bold' }} />
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: 'var(--tooltip-bg, #18181b)', borderColor: '#e6b689', borderRadius: '8px', color: 'var(--tooltip-text, #fff)' }}
                                                itemStyle={{ fontWeight: 'bold' }}
                                                wrapperClassName="dark:!bg-[#18181b] !bg-white dark:!text-white !text-black shadow-lg"
                                            />
                                            <Legend />
                                            <Line type="monotone" dataKey="gpa" name="Term GPA" stroke="#e6b689" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                            <Line type="monotone" dataKey="cumulativeGpa" name="Cumulative GPA" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardBody>
                        </Card>

                        {/* --- PIE CHART: STATUS DISTRIBUTION --- */}
                        <Card className="min-h-[400px] bg-white dark:bg-[#18181b] border-t-0 border-x-0 border-b-2 border-b-emerald-500 rounded-xl relative shadow-none dark:border-divider">
                            <CardHeader className="pb-0 pt-6 px-6 flex-col items-start border-b border-zinc-200 dark:border-zinc-800/50">
                                <h4 className="font-black text-xl text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                                    <i className="hn hn-pie-chart text-emerald-500" /> {t('gradeChart.subjectStatuses')}
                                </h4>
                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1 mb-4">
                                    {t('gradeChart.passFailRatio')}
                                </p>
                            </CardHeader>
                            <CardBody className="pt-2 items-center flex justify-center">
                                <div className="w-full h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieChartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {pieChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: 'var(--tooltip-bg, #18181b)', borderColor: '#10b981', borderRadius: '8px', color: 'var(--tooltip-text, #fff)' }}
                                                wrapperClassName="dark:!bg-[#18181b] !bg-white dark:!text-white !text-black shadow-lg"
                                            />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardBody>
                        </Card>

                        {/* NEW AREA CHART FOR MAGNITUDE OF CHANGE */}
                        <div className="lg:col-span-3">
                            <GpaAreaChart data={lineChartData} />
                        </div>

                        {/* --- BAR CHART: TERM COMPARER --- */}
                        <Card className="lg:col-span-3 min-h-[400px] bg-white dark:bg-[#18181b] border-t-0 border-x-0 border-b-2 border-b-blue-500 rounded-xl relative shadow-none dark:border-divider mb-10">
                            <CardHeader className="pb-0 pt-6 px-6 flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-200 dark:border-zinc-800/50">
                                <div>
                                    <h4 className="font-black text-xl text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                                        <i className="hn hn-bar-chart text-blue-500" /> {t('gradeChart.termComparer')}
                                    </h4>
                                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1 mb-4">
                                        {t('gradeChart.compareAverageScores')}
                                    </p>
                                </div>

                                <div className="flex gap-4 w-full md:w-auto pb-4 md:pb-0">
                                    <Select
                                        labelPlacement="outside"
                                        placeholder="Select Term A"
                                        variant="bordered"
                                        size="sm"
                                        radius="none"
                                        className="w-full md:w-40"
                                        selectedKeys={selectedTerm1}
                                        onSelectionChange={setSelectedTerm1}
                                        classNames={commonSelectStyles}
                                        listboxProps={commonListboxProps}
                                    >
                                        {termsList.map((t) => (
                                            <SelectItem key={t.key}>{t.label}</SelectItem>
                                        ))}
                                    </Select>
                                    <Select
                                        labelPlacement="outside"
                                        placeholder="Select Term B"
                                        variant="bordered"
                                        size="sm"
                                        radius="none"
                                        className="w-full md:w-40"
                                        selectedKeys={selectedTerm2}
                                        onSelectionChange={setSelectedTerm2}
                                        classNames={commonSelectStyles}
                                        listboxProps={commonListboxProps}
                                    >
                                        {termsList.map((t) => (
                                            <SelectItem key={t.key}>{t.label}</SelectItem>
                                        ))}
                                    </Select>
                                </div>
                            </CardHeader>
                            <CardBody className="pt-6">
                                {!comparisonData.length ? (
                                    <div className="h-full flex items-center justify-center text-zinc-600 font-mono text-sm py-10">
                                        <div className="text-center">
                                            <i className="hn hn-cursor-click text-4xl mb-2 opacity-50" />
                                            <p>{t('gradeChart.selectTwoTermsToCompare')}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" strokeOpacity={0.5} vertical={false} className="dark:stroke-[#27272a] dark:stroke-opacity-100" />
                                                <XAxis dataKey="name" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12, fontWeight: 'bold' }} />
                                                <YAxis domain={[0, 10]} stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12, fontWeight: 'bold' }} />
                                                <RechartsTooltip
                                                    contentStyle={{ backgroundColor: 'var(--tooltip-bg, #18181b)', borderColor: '#3b82f6', borderRadius: '8px', color: 'var(--tooltip-text, #fff)' }}
                                                    cursor={{ fill: '#27272a', opacity: 0.1 }}
                                                    wrapperClassName="dark:!bg-[#18181b] !bg-white dark:!text-white !text-black shadow-lg"
                                                />
                                                <Bar dataKey="score" name="Average Score" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                                    {comparisonData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </CardBody>
                        </Card>

                    </div>
                </div>
            )}

            {/* USER GUIDE MODAL */}
            <Modal isOpen={isGuideOpen} onOpenChange={onGuideOpenChange} classNames={{ base: "border-4 border-black rounded-none shadow-[8px_8px_0_rgba(0,0,0,1)] bg-white dark:bg-zinc-900 p-2 overflow-auto max-h-[90vh]", closeButton: "hover:bg-red-500 border-2 border-transparent hover:border-black rounded-none" }}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 border-b-4 border-black text-xl font-bold text-black dark:text-white uppercase shrink-0">
                                Hướng Dẫn: Phân Tích Điểm Số
                            </ModalHeader>
                            <ModalBody className="py-4 flex flex-col gap-3 text-sm md:text-base leading-relaxed text-black dark:text-white">
                                <p><strong>Bộ Lọc Thời Gian:</strong> Chọn xem dữ liệu của &quot;Tất cả kỳ học&quot;, &quot;Chỉ một kỳ&quot;, hoặc &quot;Từ kỳ A đến kỳ B&quot; qua thanh công cụ phía trên.</p>
                                <p><strong>Grade Frequency (Phân Bố Tần Suất Điểm):</strong> Thể hiện số lượng các môn học rớt vào từng mốc điểm cụ thể, giúp bạn biết mình thường đạt điểm ở khoảng nào nhất.</p>
                                <p><strong>Grade Box Plot (Biểu Đồ Hộp):</strong> Giúp bạn nắm bắt biên độ dao động, điểm trung bình và mức độ phân tán điểm số của từng học kỳ hoặc môn học.</p>
                                <p><strong>Grade Heatmap (Biểu Đồ Nhiệt):</strong> Trực quan hóa điểm số theo từng môn và học kỳ bằng màu sắc. Màu càng đậm thể hiện điểm số càng cao.</p>
                                <p><strong>Subject Progression (Tiến Độ Môn Học):</strong> Theo dõi sự thay đổi điểm số qua các bài kiểm tra/đánh giá trong cùng một môn học theo thời gian.</p>
                                <p><strong>Weight Stacked (Trọng Số Điểm):</strong> Hiển thị tỉ trọng của từng điểm thành phần cấu thành nên điểm tổng kết của môn học.</p>
                                <p><strong>Overall GPA Trend (Xu Hướng GPA Tổng Thể):</strong> Biểu đồ đường so sánh giữa GPA của từng học kỳ riêng biệt (Term GPA) và GPA tích lũy tổng cộng (Cumulative GPA).</p>
                                <p><strong>Subject Statuses (Trạng Thái Môn Học):</strong> Biểu đồ tròn cho thấy tỷ lệ hoàn thành môn học (Qua môn / Trượt / Học lại).</p>
                                <p><strong>GPA Area Chart (Biểu Đồ Diện Tích Tích Lũy):</strong> Quan sát độ lớn và sự biến động của điểm GPA qua các kỳ học.</p>
                                <p><strong>Term Comparer (So Sánh Học Kỳ):</strong> Lựa chọn 2 học kỳ khác nhau để phân tích, đối chiếu trực tiếp điểm trung bình giữa chúng bằng biểu đồ cột.</p>
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
