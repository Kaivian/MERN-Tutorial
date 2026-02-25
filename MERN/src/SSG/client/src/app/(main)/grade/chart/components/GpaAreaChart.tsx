"use client";

import React from "react";
import { UserAnalyticsTermGpa } from "@/types/user-curriculum.types";
import {
  Card,
  CardHeader,
  CardBody,
} from "@heroui/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface GpaAreaChartProps {
  data: UserAnalyticsTermGpa[];
}

export default function GpaAreaChart({ data }: GpaAreaChartProps) {
  return (
    <Card className="min-h-[400px] bg-white dark:bg-[#18181b] border-t-0 border-x-0 border-b-2 border-b-purple-500 rounded-xl relative shadow-none dark:border-divider w-full">
      <CardHeader className="pb-0 pt-6 px-6 flex-col items-start border-b border-zinc-200 dark:border-zinc-800/50">
        <h4 className="font-black text-xl text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
          <i className="hn hn-chart-area text-purple-500" /> Magnitude of Change
        </h4>
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1 mb-4">
          Area chart emphasizing GPA differences
        </p>
      </CardHeader>
      <CardBody className="pt-6">
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e6b689" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#e6b689" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" strokeOpacity={0.5} vertical={false} className="dark:stroke-[#27272a] dark:stroke-opacity-100" />
              <XAxis dataKey="term" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12, fontWeight: 'bold' }} />
              <YAxis domain={[0, 10]} stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12, fontWeight: 'bold' }} />
              <RechartsTooltip
                contentStyle={{ backgroundColor: 'var(--tooltip-bg, #18181b)', borderColor: '#8b5cf6', borderRadius: '8px', color: 'var(--tooltip-text, #fff)' }}
                itemStyle={{ fontWeight: 'bold' }}
                wrapperClassName="dark:!bg-[#18181b] !bg-white dark:!text-white !text-black shadow-lg"
              />
              <Legend />
              <Area type="monotone" dataKey="gpa" name="Term GPA" stroke="#e6b689" fillOpacity={1} fill="url(#colorGpa)" />
              <Area type="monotone" dataKey="cumulativeGpa" name="Cumulative GPA" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorCum)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
}
