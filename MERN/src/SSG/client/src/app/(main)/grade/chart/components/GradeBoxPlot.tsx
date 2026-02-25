"use client";

import React, { useMemo } from "react";
import { UserAnalyticsData } from "@/types/user-curriculum.types";
import {
  Card,
  CardHeader,
  CardBody,
} from "@heroui/react";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from "recharts";

interface GradeBoxPlotProps {
  termDetails: UserAnalyticsData['termDetails'];
}

// Helper to calc quartiles
const asc = (arr: number[]) => arr.sort((a, b) => a - b);
const quantile = (arr: number[], q: number) => {
  const sorted = asc(arr);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
};

const CustomBoxWidget = (props: any) => {
  const { x, y, width, height, min, max, q1, median, q3 } = props;
  if (!width || min === undefined || max === undefined) return null;

  // Normalize coordinates based on the Y-axis scale
  // Recharts passes `y` and `height` based on the dataKey value array [q1, q3]
  const pixelRatio = height / Math.max(0.001, (q3 - q1));

  const yMin = y + height + (q1 - min) * pixelRatio;
  const yMax = y - (max - q3) * pixelRatio;
  const yMedian = y + (q3 - median) * pixelRatio;

  const center = x + width / 2;

  return (
    <g>
      {/* Whiskers */}
      <line x1={center} y1={yMax} x2={center} y2={y} stroke="#facc15" strokeWidth={2} />
      <line x1={center} y1={y + height} x2={center} y2={yMin} stroke="#facc15" strokeWidth={2} />

      {/* Min/Max Caps */}
      <line x1={center - width / 4} y1={yMax} x2={center + width / 4} y2={yMax} stroke="#facc15" strokeWidth={2} />
      <line x1={center - width / 4} y1={yMin} x2={center + width / 4} y2={yMin} stroke="#facc15" strokeWidth={2} />

      {/* Box */}
      <rect x={x} y={y} width={width} height={height} fill="#eab308" fillOpacity={0.2} stroke="#facc15" strokeWidth={2} rx={2} />

      {/* Median Line */}
      <line x1={x} y1={yMedian} x2={x + width} y2={yMedian} stroke="#eab308" strokeWidth={3} />
    </g>
  );
};

export default function GradeBoxPlot({ termDetails }: GradeBoxPlotProps) {
  const chartData = useMemo(() => {
    const data = [];
    for (const [key, subjects] of Object.entries(termDetails)) {
      const scores = subjects.filter(s => s.score !== null).map(s => s.score as number);
      if (scores.length === 0) continue;

      const name = key.replace('sem_', 'Sem ');
      const min = Math.min(...scores);
      const max = Math.max(...scores);
      const q1 = quantile(scores, 0.25);
      const median = quantile(scores, 0.5);
      const q3 = quantile(scores, 0.75);

      data.push({
        name,
        min,
        max,
        q1,
        median,
        q3,
        box: [q1, q3] // Used by Bar to set 'y' and 'height'
      });
    }
    return data;
  }, [termDetails]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-[#18181b] border-2 border-yellow-500 rounded-lg p-2 text-sm font-mono text-zinc-700 dark:text-zinc-300 shadow-lg">
          <p className="font-bold text-yellow-500 mb-1">{data.name}</p>
          <p>Max: <span className="text-black dark:text-white">{data.max.toFixed(2)}</span></p>
          <p>Q3: <span className="text-black dark:text-white">{data.q3.toFixed(2)}</span></p>
          <p>Median: <span className="text-black dark:text-white">{data.median.toFixed(2)}</span></p>
          <p>Q1: <span className="text-black dark:text-white">{data.q1.toFixed(2)}</span></p>
          <p>Min: <span className="text-black dark:text-white">{data.min.toFixed(2)}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="min-h-[400px] bg-white dark:bg-[#18181b] border-t-0 border-x-0 border-b-2 border-b-yellow-500 rounded-xl relative shadow-none dark:border-divider w-full">
      <CardHeader className="pb-0 pt-6 px-6 flex-col items-start border-b border-zinc-200 dark:border-zinc-800/50">
        <h4 className="font-black text-xl text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
          <i className="hn hn-chart-box text-yellow-500" /> Statistical Distribution
        </h4>
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1 mb-4">
          Box and Whisker Plot per Semester
        </p>
      </CardHeader>
      <CardBody className="pt-6">
        {!chartData.length ? (
          <div className="h-full flex items-center justify-center text-zinc-600 font-mono text-sm py-10">
            Insufficient data to render box plot.
          </div>
        ) : (
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" strokeOpacity={0.5} vertical={false} className="dark:stroke-[#27272a] dark:stroke-opacity-100" />
                <XAxis dataKey="name" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12, fontWeight: 'bold' }} />
                <YAxis domain={[0, 10]} stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12, fontWeight: 'bold' }} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#27272a', opacity: 0.1 }} />
                <Bar
                  dataKey="box"
                  maxBarSize={40}
                  shape={(props: any) => {
                    const { x, y, width, height, payload } = props;
                    return <CustomBoxWidget x={x} y={y} width={width} height={height} {...payload} />;
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
