"use client";

import React, { useMemo } from "react";
import { UserAnalyticsData } from "@/types/user-curriculum.types";
import {
  Card,
  CardHeader,
  CardBody,
  Tooltip,
} from "@heroui/react";

interface GradeHeatmapProps {
  termDetails: UserAnalyticsData['termDetails'];
}

export default function GradeHeatmap({ termDetails }: GradeHeatmapProps) {
  const { semesters, subjects, matrix } = useMemo(() => {
    const sems = Object.keys(termDetails);
    const subMap = new Set<string>();

    // Collect all unique subjects
    sems.forEach(sem => {
      termDetails[sem].forEach(sub => {
        subMap.add(sub.code);
      });
    });

    const sortedSubjects = Array.from(subMap).sort();

    // Build matrix: matrix[subjectCode][semester] = score | null
    const mat: Record<string, Record<string, number | null>> = {};
    sortedSubjects.forEach(code => {
      mat[code] = {};
      sems.forEach(sem => {
        const found = termDetails[sem].find(s => s.code === code);
        mat[code][sem] = found && found.score !== null ? found.score : null;
      });
    });

    return {
      semesters: sems,
      subjects: sortedSubjects,
      matrix: mat
    };
  }, [termDetails]);

  // Color scaling: Red(0) -> Yellow(5) -> Green(10)
  // For retro vibe, we use distinct buckets or a continuous HSL scale
  const getScoreColor = (score: number | null) => {
    if (score === null) return "bg-zinc-800/20 shadow-inner";
    if (score < 5) return "bg-red-500/80 shadow-[inset_0_0_10px_rgba(239,68,68,0.5)]";
    if (score < 7) return "bg-yellow-500/80 shadow-[inset_0_0_10px_rgba(234,179,8,0.5)]";
    if (score < 9) return "bg-blue-500/80 shadow-[inset_0_0_10px_rgba(59,130,246,0.5)]";
    return "bg-emerald-500/80 shadow-[inset_0_0_10px_rgba(16,185,129,0.5)]";
  };

  return (
    <Card className="flex-1 min-h-full max-h-220 bg-white dark:bg-[#18181b] border-t-0 border-x-0 border-b-2 border-b-rose-500 rounded-xl relative shadow-none dark:border-divider w-full">
      <CardHeader className="pb-0 pt-6 px-6 flex-col items-start border-b border-zinc-200 dark:border-zinc-800/50">
        <h4 className="font-black text-xl text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
          <i className="hn hn-grid text-rose-500" /> Subject Heatmap
        </h4>
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1 mb-4">
          Score intensity across all semesters
        </p>
      </CardHeader>
      <CardBody className="pt-6 flex-1 flex flex-col">
        {!semesters.length ? (
          <div className="flex-1 flex items-center justify-center text-zinc-600 font-mono text-sm py-10">
            No subject data available.
          </div>
        ) : (
          <div className="w-full flex-1 flex flex-col pb-4">
            <div className="min-w-max flex-1 flex flex-col">
              {/* Header Row */}
              <div className="flex mb-2">
                <div className="w-28 shrink-0 font-bold text-xs text-zinc-500 uppercase tracking-widest pl-2">
                  Subject
                </div>
                {semesters.map(sem => (
                  <div key={sem} className="w-24 shrink-0 text-center font-bold text-xs text-zinc-500 uppercase tracking-widest">
                    {sem.replace('sem_', 'S')}
                  </div>
                ))}
              </div>

              {/* Data Rows */}
              <div className="flex flex-col gap-1 flex-1 overflow-y-auto overflow-x-auto pr-2 custom-scrollbar">
                {subjects.map(code => (
                  <div key={code} className="flex items-center">
                    <div className="w-24 shrink-0 font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate pr-2 pl-2" title={code}>
                      {code}
                    </div>
                    {semesters.map(sem => {
                      const score = matrix[code][sem];
                      return (
                        <Tooltip
                          key={sem}
                          content={
                            <div className="px-1 py-2 font-mono text-xs">
                              <div className="text-zinc-500 dark:text-zinc-400 mb-1">{code} - {sem.replace('sem_', 'Semester ')}</div>
                              <div className="font-bold text-black dark:text-white text-sm">
                                Score: {score !== null ? score.toFixed(1) : 'N/A'}
                              </div>
                            </div>
                          }
                          placement="top"
                          classNames={{ content: 'bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 shadow-md' }}
                        >
                          <div className="w-24 h-10 shrink-0 p-0.5" aria-label={`Score for ${code} in ${sem.replace('sem_', 'Semester ')}: ${score !== null ? score.toFixed(1) : 'N/A'}`}>
                            <div className={`w-full h-full rounded ${getScoreColor(score)} flex items-center justify-center border border-zinc-800/50 transition-all hover:brightness-125 cursor-crosshair`}>
                              {score !== null && (
                                <span className="text-[10px] font-bold text-white/90 drop-shadow-md">
                                  {score.toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>
                        </Tooltip>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
