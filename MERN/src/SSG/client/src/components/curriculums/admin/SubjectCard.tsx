// client/src/components/curriculums/admin/SubjectCard.tsx
"use client";
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { X, BookOpen } from "lucide-react";
import { Chip } from "@heroui/react";
import { AdminSubject } from "@/types/curriculum.types";

interface SubjectCardProps {
  id: string;
  subject: AdminSubject;
  isDragging?: boolean;
  onRemove?: (mappingId: string) => void;
  onClick?: (subject: AdminSubject) => void;
  isPoolItem?: boolean;
}

/**
 * SubjectCard — used inside SemesterLane (sortable + removable).
 * Entire card is draggable. Delete always visible. Click opens detail.
 */
export function SubjectCard({ id, subject, onRemove, onClick, isPoolItem = false }: SubjectCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: { subject, isPoolItem, mappingId: id }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        group relative flex items-center gap-2 px-3 py-2
        rounded-none border-2 border-black dark:border-white
        bg-white dark:bg-black/60
        shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]
        cursor-grab active:cursor-grabbing
        hover:translate-y-[1px] hover:shadow-none
        transition-all font-jersey10 tracking-wide
        ${isDragging ? "ring-2 ring-retro-orange shadow-none translate-y-[1px]" : ""}
      `}
    >
      {/* Subject icon */}
      <div className="flex-shrink-0 w-7 h-7 rounded-none border-2 border-black dark:border-white bg-retro-orange/15 flex items-center justify-center">
        <BookOpen className="w-3.5 h-3.5 text-retro-orange" />
      </div>

      {/* Subject info — click to open detail */}
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onPointerDown={(e) => {
          // Only intercept click, not drag (drag is handled by parent)
          // We use onPointerUp instead
        }}
        onPointerUp={(e) => {
          // Only fire click if pointer hasn't moved (i.e. not a drag)
          if (onClick && !isDragging) {
            e.stopPropagation();
            onClick(subject);
          }
        }}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-mono font-bold text-retro-orange uppercase truncate">{subject.code}</span>
          <Chip size="sm" variant="flat" className="rounded-none border border-black dark:border-white text-xs px-1 py-0 h-5 font-jersey10">
            {subject.credit}cr
          </Chip>
        </div>
        <p className="text-xs text-default-500 truncate">{subject.name_vi}</p>
      </div>

      {/* Remove button — always visible */}
      {onRemove && !isPoolItem && (
        <button
          className="flex-shrink-0 p-1 border-2 border-black dark:border-white bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onRemove(id); }}
          title="Remove"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

/**
 * PoolSubjectCard — drag source only, uses useDraggable.
 * Entire card is draggable.
 */
interface PoolSubjectCardProps {
  subject: AdminSubject;
  onClick?: (subject: AdminSubject) => void;
}
export function PoolSubjectCard({ subject, onClick }: PoolSubjectCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `pool-${subject._id}`,
    data: { subject, isPoolItem: true }
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ opacity: isDragging ? 0.3 : 1 }}
      className={`
        flex items-center gap-2 px-3 py-2
        rounded-none border-2 border-black dark:border-white
        bg-white dark:bg-black/60
        shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]
        cursor-grab active:cursor-grabbing
        hover:translate-y-[1px] hover:shadow-none hover:border-retro-orange
        transition-all font-jersey10 tracking-wide
      `}
    >
      <div className="flex-shrink-0 w-6 h-6 rounded-none border-2 border-black dark:border-white bg-retro-orange/15 flex items-center justify-center">
        <BookOpen className="w-3 h-3 text-retro-orange" />
      </div>
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onPointerUp={(e) => {
          if (onClick && !isDragging) {
            e.stopPropagation();
            onClick(subject);
          }
        }}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono font-bold text-retro-orange uppercase">{subject.code}</span>
          <span className="text-xs text-default-400">{subject.credit}cr</span>
        </div>
        <p className="text-xs text-default-500 truncate">{subject.name_vi}</p>
      </div>
    </div>
  );
}
