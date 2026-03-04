"use client";

import React, { useMemo } from "react";
import { UserAnalyticsTermDetail } from "@/types/user-curriculum.types";
import {
  Card,
  CardHeader,
  CardBody,
} from "@heroui/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface SubjectProgressionChartProps {
  subjects: UserAnalyticsTermDetail[];
}

export default function SubjectProgressionChart({ subjects }: SubjectProgressionChartProps) {
  const chartData = useMemo(() => {
    const allCategories = new Set<string>();
    const subjectDataMap: Record<string, Record<string, number>> = {};

    subjects.filter(s => s.grades && s.grades.length > 0).forEach(sub => {
      subjectDataMap[sub.code] = {};
      sub.grades!.forEach(g => {
        const key = g.part_index > 1 ? `${g.category} ${g.part_index}` : g.category;
        allCategories.add(key);
        subjectDataMap[sub.code][key] = g.score;
      });
    });

    const ordering = ["Participation", "Progress Test 1", "Progress Test 2", "Progress Test", "Assignment", "Project", "Final Exam"];
    const sortedCategories = Array.from(allCategories).sort((a, b) => {
      const iA = ordering.findIndex(v => a.includes(v));
      const iB = ordering.findIndex(v => b.includes(v));
      if (iA !== -1 && iB !== -1) return iA - iB;
      if (iA !== -1) return -1;
      if (iB !== -1) return 1;
      return a.localeCompare(b);
    });

    const output = sortedCategories.map(category => {
      const point: any = { name: category };
      Object.keys(subjectDataMap).forEach(code => {
        if (subjectDataMap[code][category] !== undefined) {
          point[code] = subjectDataMap[code][category];
        }
      });
      return point;
    });

    return { data: output, codes: Object.keys(subjectDataMap) };
  }, [subjects]);

  // A fixed color palette for different subjects
  const colors = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#ef4444", "#14b8a6", "#f59e0b", "#06b6d4"];

  return (
    <Card className="min-h-[400px] bg-white dark:bg-[#18181b] border-t-0 border-x-0 border-b-2 border-b-orange-500 rounded-xl relative shadow-none dark:border-divider w-full">
      <CardHeader className="pb-0 pt-6 px-6 flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-200 dark:border-zinc-800/50">
        <div>
          <h4 className="font-black text-xl text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <i className="hn hn-analytics text-orange-500" /> Progression By Subject
          </h4>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1 mb-4">
            Grades across assessment components
          </p>
        </div>
      </CardHeader>
      <CardBody className="pt-6">
        {!chartData.data.length ? (
          <div className="h-full flex items-center justify-center text-zinc-600 font-mono text-sm py-10">
            No detailed grades available.
          </div>
        ) : (
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" strokeOpacity={0.5} vertical={false} className="dark:stroke-[#27272a] dark:stroke-opacity-100" />
                <XAxis
                  dataKey="name"
                  stroke="#71717a"
                  tick={{ fill: '#71717a', fontSize: 11, fontWeight: 'bold' }}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis domain={[0, 10]} stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12, fontWeight: 'bold' }} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: 'var(--tooltip-bg, #18181b)', borderColor: '#f97316', borderRadius: '8px', color: 'var(--tooltip-text, #fff)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                  wrapperClassName="dark:!bg-[#18181b] !bg-white dark:!text-white !text-black shadow-lg"
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                {chartData.codes.map((code, index) => (
                  <Line
                    key={code}
                    type="monotone"
                    dataKey={code}
                    name={code}
                    stroke={colors[index % colors.length]}
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
