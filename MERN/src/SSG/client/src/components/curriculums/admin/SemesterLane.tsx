// client/src/components/curriculums/admin/SemesterLane.tsx
"use client";
import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SubjectCard } from "./SubjectCard";
import { CurriculumEntry, AdminSubject } from "@/types/curriculum.types";

interface SemesterLaneProps {
  semester: number;
  entries: CurriculumEntry[];
  onRemove: (mappingId: string) => void;
  onSubjectClick?: (subject: AdminSubject) => void;
}

export function SemesterLane({ semester, entries, onRemove, onSubjectClick }: SemesterLaneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `semester-${semester}`,
    data: { semester }
  });

  const sortableIds = entries.map(e => e.mappingId);
  const totalCredits = entries.reduce((sum, e) => sum + (e.subject?.credit || 0), 0);

  return (
    <div className="flex flex-col min-w-[240px] max-w-[280px] w-full flex-shrink-0 font-jersey10 tracking-wide">
      {/* Lane header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-retro-orange text-black font-bold text-lg uppercase border-4 border-black dark:border-white border-b-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚔</span>
          <span>Sem {semester}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono bg-black/20 px-2 py-0.5 border border-black/30">
            {totalCredits}cr
          </span>
          <span className="text-sm font-mono bg-black/20 px-2 py-0.5 border border-black/30">
            {entries.length}
          </span>
        </div>
      </div>

      {/* Drop zone */}
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`
            flex flex-col gap-2 p-3 min-h-[200px] flex-1
            border-4 border-t-0 border-black dark:border-white
            transition-all duration-200
            ${isOver
              ? "bg-retro-orange/10 border-dashed border-retro-orange shadow-[inset_0_0_20px_rgba(238,157,43,0.15)]"
              : "bg-retro-bg/50 dark:bg-retro-bg-dark/50"
            }
          `}
        >
          {entries.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-default-300 border-2 border-dashed border-default-200 dark:border-default-700">
              <span className="text-2xl mb-1 opacity-40">📦</span>
              <p className="text-sm uppercase font-bold opacity-60">Drop Here</p>
            </div>
          )}
          {entries.map(entry => (
            <SubjectCard
              key={entry.mappingId}
              id={entry.mappingId}
              subject={entry.subject}
              onRemove={onRemove}
              onClick={onSubjectClick}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
