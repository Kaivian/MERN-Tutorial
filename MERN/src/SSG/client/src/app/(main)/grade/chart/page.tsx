"use client";

import React, { useState, useMemo } from "react";
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
    cn
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

export default function GradeChartPage() {
    const { user } = useAuth();
    const { data: analyticsData, isLoading } = useUserAnalytics();

    // --- COMPARSION STATE ---
    const [selectedTerm1, setSelectedTerm1] = useState<Selection>(new Set([]));
    const [selectedTerm2, setSelectedTerm2] = useState<Selection>(new Set([]));

    // --- MEMOIZED CHARTS DATA ---
    const lineChartData = useMemo(() => {
        return analyticsData?.termGpas || [];
    }, [analyticsData]);

    const pieChartData = useMemo(() => {
        return analyticsData?.subjectStatuses || [];
    }, [analyticsData]);

    const termsList = useMemo(() => {
        if (!analyticsData?.termDetails) return [];
        return Object.keys(analyticsData.termDetails).map(k => ({
            key: k,
            label: k.replace('sem_', 'Semester ')
        }));
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
        label: "text-zinc-500 uppercase tracking-wider text-[12px]",
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

    return (
        <div className="flex flex-col gap-3 h-auto min-h-screen transition-colors duration-300 rounded-xl pb-10">
            {/* HEADER SECTION */}
            <div className="w-full relative z-20 flex flex-col gap-3 shrink-0">
                <section className="w-full">
                    <Card className="h-full dark:bg-[#18181b] border-t-0 border-x-0 border-b-2 border-b-[#e6b689] dark:border-b-[#9d744d] rounded-xl overflow-hidden relative shadow-none dark:border-x dark:border-y dark:border-divider">
                        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[radial-gradient(#71717a_1px,transparent_1px)] bg-size-[16px_16px]" />
                        <CardHeader className="relative z-10 flex flex-col items-start px-5 py-4 md:px-6 md:py-5 h-full justify-between">
                            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-0">
                                <Button as={Link} href="/grade" isIconOnly radius="none" className="bg-transparent text-zinc-500 hover:text-white mr-1 md:mr-2" size="sm">
                                    <i className="hn hn-arrow-left text-2xl" />
                                </Button>
                                <i className="hn hn-pie-chart text-retro-orange text-[28px] md:text-[32px]" />
                                <h1 className="text-3xl md:text-4xl font-black text-retro-orange dark:text-white uppercase tracking-wide [text-shadow:2px_2px_0_#c47c16] md:[text-shadow:3px_3px_0_#c47c16] whitespace-nowrap">
                                    Grade Analytics
                                </h1>
                            </div>

                            <div className="flex flex-row justify-between items-end w-full md:w-auto gap-4 md:gap-8 mt-2">
                                <div className="flex flex-col gap-1 text-[11px] md:text-xs font-bold tracking-widest uppercase font-mono">
                                    <div className="flex items-center gap-1">
                                        <span className="text-zinc-500"><i className="hn hn-user mr-1" />Player:</span>
                                        <span className="text-zinc-900 dark:text-zinc-200 truncate">{user?.fullName || user?.username}</span>
                                    </div>
                                </div>
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* --- LINE CHART: CUMULATIVE GPA TREND --- */}
                    <Card className="lg:col-span-2 min-h-[400px] dark:bg-[#18181b] border-t-0 border-x-0 border-b-2 border-b-[#e6b689] rounded-xl relative shadow-none dark:border-divider">
                        <CardHeader className="pb-0 pt-6 px-6 flex-col items-start border-b border-zinc-800/50">
                            <h4 className="font-black text-xl text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                                <i className="hn hn-chart-line text-[#e6b689]" /> Overall GPA Trend
                            </h4>
                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1 mb-4">
                                Term vs Cumulative performance
                            </p>
                        </CardHeader>
                        <CardBody className="pt-6">
                            <div className="w-full h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={lineChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                        <XAxis dataKey="term" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12, fontWeight: 'bold' }} />
                                        <YAxis domain={[0, 10]} stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12, fontWeight: 'bold' }} />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#18181b', border: '2px solid #e6b689', borderRadius: '4px' }}
                                            itemStyle={{ fontWeight: 'bold' }}
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
                    <Card className="min-h-[400px] dark:bg-[#18181b] border-t-0 border-x-0 border-b-2 border-b-emerald-500 rounded-xl relative shadow-none dark:border-divider">
                        <CardHeader className="pb-0 pt-6 px-6 flex-col items-start border-b border-zinc-800/50">
                            <h4 className="font-black text-xl text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                                <i className="hn hn-pie-chart text-emerald-500" /> Subject Statuses
                            </h4>
                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1 mb-4">
                                Pass / Fail Ratio
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
                                            contentStyle={{ backgroundColor: '#18181b', border: '2px solid #10b981', borderRadius: '4px' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardBody>
                    </Card>

                    {/* --- BAR CHART: TERM COMPARER --- */}
                    <Card className="lg:col-span-3 min-h-[400px] dark:bg-[#18181b] border-t-0 border-x-0 border-b-2 border-b-blue-500 rounded-xl relative shadow-none dark:border-divider mb-10">
                        <CardHeader className="pb-0 pt-6 px-6 flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-800/50">
                            <div>
                                <h4 className="font-black text-xl text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                                    <i className="hn hn-bar-chart text-blue-500" /> Term Comparer
                                </h4>
                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1 mb-4">
                                    Compare average scores
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
                                        <p>Select two terms above to compare their average scores.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                            <XAxis dataKey="name" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12, fontWeight: 'bold' }} />
                                            <YAxis domain={[0, 10]} stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12, fontWeight: 'bold' }} />
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: '#18181b', border: '2px solid #3b82f6', borderRadius: '4px' }}
                                                cursor={{ fill: '#27272a' }}
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
            )}
        </div>
    );
}
