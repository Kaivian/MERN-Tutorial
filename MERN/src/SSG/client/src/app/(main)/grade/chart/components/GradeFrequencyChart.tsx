"use client";

import React, { useMemo } from "react";
import { UserAnalyticsTermDetail } from "@/types/user-curriculum.types";
import {
  Card,
  CardHeader,
  CardBody,
} from "@heroui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

interface GradeFrequencyChartProps {
  subjects: UserAnalyticsTermDetail[];
}

export default function GradeFrequencyChart({ subjects }: GradeFrequencyChartProps) {
  const data = useMemo(() => {
    let maxBins = {
      "0-4.9 (Fail)": 0,
      "5-6.9 (Average)": 0,
      "7-8.9 (Good)": 0,
      "9-10 (Excellent)": 0
    };

    subjects.forEach(sub => {
      if (sub.score !== null && sub.score !== undefined) {
        if (sub.score < 5) maxBins["0-4.9 (Fail)"]++;
        else if (sub.score < 7) maxBins["5-6.9 (Average)"]++;
        else if (sub.score < 9) maxBins["7-8.9 (Good)"]++;
        else maxBins["9-10 (Excellent)"]++;
      }
    });

    return [
      { name: "0-4.9 (Fail)", count: maxBins["0-4.9 (Fail)"], fill: "#ef4444" },
      { name: "5-6.9 (Average)", count: maxBins["5-6.9 (Average)"], fill: "#e6b689" },
      { name: "7-8.9 (Good)", count: maxBins["7-8.9 (Good)"], fill: "#3b82f6" },
      { name: "9-10 (Excellent)", count: maxBins["9-10 (Excellent)"], fill: "#10b981" }
    ];
  }, [subjects]);

  return (
    <Card className="min-h-[400px] bg-white dark:bg-[#18181b] border-t-0 border-x-0 border-b-2 border-b-pink-500 rounded-xl relative shadow-none dark:border-divider w-full">
      <CardHeader className="pb-0 pt-6 px-6 flex-col items-start border-b border-zinc-200 dark:border-zinc-800/50">
        <h4 className="font-black text-xl text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
          <i className="hn hn-chart-bar text-pink-500" /> Grade Frequency
        </h4>
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1 mb-4">
          Score Distribution Bins
        </p>
      </CardHeader>
      <CardBody className="pt-6">
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" strokeOpacity={0.5} vertical={false} className="dark:stroke-[#27272a] dark:stroke-opacity-100" />
              <XAxis dataKey="name" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12, fontWeight: 'bold' }} />
              <YAxis allowDecimals={false} stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12, fontWeight: 'bold' }} />
              <RechartsTooltip
                contentStyle={{ backgroundColor: 'var(--tooltip-bg, #18181b)', borderColor: '#ec4899', borderRadius: '8px', color: 'var(--tooltip-text, #fff)' }}
                cursor={{ fill: '#27272a', opacity: 0.1 }}
                wrapperClassName="dark:!bg-[#18181b] !bg-white dark:!text-white !text-black shadow-lg"
              />
              <Bar dataKey="count" name="Subjects" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
}
