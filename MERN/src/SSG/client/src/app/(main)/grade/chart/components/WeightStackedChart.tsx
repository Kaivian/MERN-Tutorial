"use client";

import React, { useState, useMemo } from "react";
import { UserAnalyticsTermDetail } from "@/types/user-curriculum.types";
import {
  Card,
  CardHeader,
  CardBody,
  Select,
  SelectItem,
} from "@heroui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface WeightStackedChartProps {
  subjects: UserAnalyticsTermDetail[];
}

export default function WeightStackedChart({ subjects }: WeightStackedChartProps) {
  const [selectedCode, setSelectedCode] = useState<string>("");

  const subjectList = useMemo(() => {
    return subjects.filter(s => s.assessment_plan && s.assessment_plan.length > 0).map(s => ({
      key: s.code,
      label: `${s.code} - ${s.name_en}`
    }));
  }, [subjects]);

  React.useEffect(() => {
    if (!selectedCode && subjectList.length > 0) {
      setSelectedCode(subjectList[0].key);
    }
  }, [subjectList, selectedCode]);

  const chartData = useMemo(() => {
    if (!selectedCode) return { data: [], keys: [] };
    const subject = subjects.find(s => s.code === selectedCode);
    if (!subject || !subject.assessment_plan) return { data: [], keys: [] };

    const dataObj: any = { name: subject.code };
    const keys: string[] = [];

    subject.assessment_plan.forEach(item => {
      if (item.weight_percent > 0) {
        keys.push(item.category);

        // calculate how much the user actually scored out of this weight limit
        // if they scored 8/10 on a 10% weight, they earned 8% of the total 100%
        let earnedWeight = 0;
        if (subject.grades) {
          const matchedGrades = subject.grades.filter(g => g.category === item.category);
          if (matchedGrades.length > 0) {
            const avgScore = matchedGrades.reduce((sum, g) => sum + g.score, 0) / item.part_count;
            earnedWeight = (avgScore * item.weight_percent) / 10;
          }
        }

        dataObj[`${item.category} Earned`] = earnedWeight;
        dataObj[`${item.category} Unearned`] = item.weight_percent - earnedWeight;
      }
    });

    return { data: [dataObj], keys };
  }, [subjects, selectedCode]);

  const commonSelectStyles = {
    trigger: "border-zinc-800 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200",
    label: "text-zinc-500",
    popoverContent: "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700",
  };

  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];
  const dimColors = ["#1e3a8a", "#064e3b", "#78350f", "#4c1d95", "#831843"];

  return (
    <Card className="min-h-[400px] bg-white dark:bg-[#18181b] border-t-0 border-x-0 border-b-2 border-b-cyan-500 rounded-xl relative shadow-none dark:border-divider w-full">
      <CardHeader className="pb-0 pt-6 px-6 flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-200 dark:border-zinc-800/50">
        <div>
          <h4 className="font-black text-xl text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <i className="hn hn-layers text-cyan-500" /> Score Composition
          </h4>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1 mb-4">
            Earned vs Missing Weight Percentage
          </p>
        </div>
        <div className="w-full md:w-64 pb-4 md:pb-0">
          <Select
            size="sm"
            label="Select Subject"
            selectedKeys={selectedCode ? [selectedCode] : []}
            onChange={(e) => setSelectedCode(e.target.value)}
            classNames={commonSelectStyles}
          >
            {subjectList.map(s => (
              <SelectItem key={s.key}>{s.label}</SelectItem>
            ))}
          </Select>
        </div>
      </CardHeader>
      <CardBody className="pt-6">
        {!chartData.data.length ? (
          <div className="h-full flex items-center justify-center text-zinc-600 font-mono text-sm py-10">
            No assessment plan available for the selected subject.
          </div>
        ) : (
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" strokeOpacity={0.5} horizontal={false} className="dark:stroke-[#27272a] dark:stroke-opacity-100" />
                <XAxis type="number" domain={[0, 100]} stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12, fontWeight: 'bold' }} />
                <YAxis dataKey="name" type="category" stroke="#71717a" width={100} tick={{ fill: '#71717a', fontSize: 12, fontWeight: 'bold' }} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: 'var(--tooltip-bg, #18181b)', borderColor: '#06b6d4', borderRadius: '8px', color: 'var(--tooltip-text, #fff)' }}
                  cursor={{ fill: '#27272a', opacity: 0.1 }}
                  wrapperClassName="dark:!bg-[#18181b] !bg-white dark:!text-white !text-black shadow-lg"
                  wrapperStyle={{ zIndex: 1000 }}
                  allowEscapeViewBox={{ x: true, y: true }}
                />
                <Legend />

                {chartData.keys.map((key, index) => (
                  <React.Fragment key={key}>
                    {/* Earned portion of the weight */}
                    <Bar dataKey={`${key} Earned`} name={`${key} (Earned)`} stackId="a" fill={colors[index % colors.length]} />
                    {/* Unearned portion of the weight */}
                    <Bar dataKey={`${key} Unearned`} name={`${key} (Lost)`} stackId="a" fill={dimColors[index % dimColors.length]} />
                  </React.Fragment>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
