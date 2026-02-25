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
  const [selectedCode, setSelectedCode] = useState<string>("");

  const subjectList = useMemo(() => {
    return subjects.filter(s => s.grades && s.grades.length > 0).map(s => ({
      key: s.code,
      label: `${s.code} - ${s.name_en}`
    }));
  }, [subjects]);

  // Set first subject as default if list populates and none is selected
  React.useEffect(() => {
    if (!selectedCode && subjectList.length > 0) {
      setSelectedCode(subjectList[0].key);
    }
  }, [subjectList, selectedCode]);

  const chartData = useMemo(() => {
    if (!selectedCode) return [];
    const subject = subjects.find(s => s.code === selectedCode);
    if (!subject || !subject.grades) return [];

    // Organize grades chronologically if possible, or by category
    // In a real scenario, you'd map "PT1", "PT2", "FE" to points on the line
    const dataMap: { [key: string]: number } = {};

    subject.grades.forEach(g => {
      const key = g.part_index > 1 ? `${g.category} ${g.part_index}` : g.category;
      dataMap[key] = g.score;
    });

    // Ensure chronological order for known types or fallback to arbitrary
    const ordering = ["Participation", "Progress Test 1", "Progress Test 2", "Progress Test", "Assignment", "Project", "Final Exam"];
    const output: { name: string; score: number }[] = [];

    Object.keys(dataMap).sort((a, b) => {
      const iA = ordering.findIndex(v => a.includes(v));
      const iB = ordering.findIndex(v => b.includes(v));
      if (iA !== -1 && iB !== -1) return iA - iB;
      if (iA !== -1) return -1;
      if (iB !== -1) return 1;
      return a.localeCompare(b);
    }).forEach(k => {
      output.push({
        name: k,
        score: dataMap[k]
      });
    });

    return output;
  }, [subjects, selectedCode]);

  const commonSelectStyles = {
    trigger: "border-zinc-800 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200",
    label: "text-zinc-500",
    popoverContent: "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700",
  };

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
        {!chartData.length ? (
          <div className="h-full flex items-center justify-center text-zinc-600 font-mono text-sm py-10">
            No detailed grades available for the selected subject.
          </div>
        ) : (
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
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
                <Line type="monotone" dataKey="score" name="Score" stroke="#f97316" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
