/* eslint-disable @typescript-eslint/no-explicit-any */
// client/src/app/(main)/curriculums/[code]/subjects/page.tsx
"use client";

import React, { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext, DragOverlay, DragStartEvent, DragEndEvent,
  PointerSensor, useSensor, useSensors, useDroppable, useDraggable,
  pointerWithin, rectIntersection,
  type Modifier
} from "@dnd-kit/core";
import {
  Button,
  Input,
  Spinner,
  Tooltip,
  useDisclosure,
  Chip,
  addToast
} from "@heroui/react";
import { Plus, Search, Edit2, Trash2, ArrowLeft, Settings2, BookOpen, GraduationCap, GripVertical } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { adminCurriculumService, curriculumService } from "@/services/curriculum.service";
import { useAuth } from "@/providers/auth.provider";
import SubjectModal from "@/components/curriculums/SubjectModal";
import AssessmentPlanModal from "@/components/curriculums/AssessmentPlanModal";

// ============ Retro Pixel Style Constants ============
const RETRO = {
  card: "rounded-none border-4 border-black dark:border-white shadow-pixel dark:shadow-pixel-dark bg-retro-bg dark:bg-retro-bg-dark",
  btn: "rounded-none border-2 border-black dark:border-white font-bold uppercase shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-y-[2px] hover:shadow-none transition-transform",
  btnIcon: "rounded-none border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-y-[1px] hover:shadow-none transition-all",
  chip: "rounded-none border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] font-jersey10",
} as const;

// ============ Draggable Subject Card ============
function DraggableSubjectCard({ subject, canManage, onEdit, onDelete, onAssessment }: {
  subject: any;
  canManage: boolean;
  onEdit: (s: any) => void;
  onDelete: (id: string) => void;
  onAssessment: (s: any) => void;
}) {
  const id = subject._id || subject.id || subject.code;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `subject-${id}`,
    data: { subject }
  });
  const assessCount = subject.assessment_plan?.length || 0;

  return (
    <div
      ref={setNodeRef}
      style={{ opacity: isDragging ? 0.3 : 1 }}
      className={`
        ${RETRO.card} p-0 overflow-hidden group
        hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] dark:hover:shadow-[6px_6px_0px_0px_#fff]
        transition-all duration-200
        ${isDragging ? "ring-2 ring-retro-orange" : ""}
      `}
    >
      {/* Card Header — draggable area */}
      <div
        {...listeners}
        {...attributes}
        className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-retro-orange/20 to-transparent border-b-4 border-black dark:border-white cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-default-400 flex-shrink-0" />
          <div className="w-8 h-8 rounded-none border-2 border-black dark:border-white bg-retro-orange/20 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-retro-orange" />
          </div>
          <span className="text-xl font-mono font-bold text-retro-orange uppercase drop-shadow-[1px_1px_0px_#000]">
            {subject.code}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Chip size="sm" variant="flat" color="primary" className={`${RETRO.chip} text-base`}>
            {subject.credit}cr
          </Chip>
        </div>
      </div>

      {/* Card Body */}
      <div className="px-4 py-3 flex flex-col gap-2">
        <div>
          <p className="text-lg font-bold truncate">{subject.name_vi || "—"}</p>
          <p className="text-base text-default-400 truncate">{subject.name_en || "—"}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {subject.prerequisite && subject.prerequisite !== "None" && (
            <Chip size="sm" variant="flat" className={`${RETRO.chip} text-sm bg-yellow-500/15 text-yellow-600 dark:text-yellow-400`}>
              Prereq: {subject.prerequisite}
            </Chip>
          )}
          <Chip size="sm" variant="flat" color={assessCount > 0 ? "success" : "warning"} className={`${RETRO.chip} text-sm`}>
            {assessCount > 0 ? `${assessCount} assessments` : "No assessment"}
          </Chip>
        </div>
      </div>

      {/* Card Footer — Actions */}
      {canManage && (
        <div className="flex items-center justify-end gap-2 px-4 py-2.5 border-t-2 border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03]">
          <Tooltip content="Assessment Plan">
            <Button isIconOnly size="sm" className={`${RETRO.btnIcon} bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400`}
              onPress={() => onAssessment(subject)}>
              <Settings2 className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Tooltip content="Edit Subject">
            <Button isIconOnly size="sm" className={`${RETRO.btnIcon} bg-retro-orange/10 text-retro-orange`}
              onPress={() => onEdit(subject)}>
              <Edit2 className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Tooltip color="danger" content="Delete Subject">
            <Button isIconOnly size="sm" className={`${RETRO.btnIcon} bg-red-100 dark:bg-red-900/20 text-red-500`}
              onPress={() => onDelete(subject._id || subject.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </Tooltip>
        </div>
      )}
    </div>
  );
}

// ============ Droppable Semester Zone ============
function SemesterDropZone({ semester, children, subjectCount, creditSum, canManage, onAddNew }: {
  semester: number;
  children: React.ReactNode;
  subjectCount: number;
  creditSum: number;
  canManage: boolean;
  onAddNew: (semester: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `semester-zone-${semester}`,
    data: { semester }
  });

  return (
    <div className="flex flex-col gap-3">
      {/* Semester Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="bg-retro-orange text-black font-bold text-xl uppercase px-4 py-2 border-4 border-black dark:border-white shadow-pixel dark:shadow-pixel-dark flex items-center gap-2">
          <span>⚔</span>
          <span>Semester {semester || "?"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Chip size="sm" variant="flat" className={`${RETRO.chip} text-base`}>
            {subjectCount} subjects
          </Chip>
          <Chip size="sm" variant="flat" className={`${RETRO.chip} text-base bg-blue-500/15 text-blue-600 dark:text-blue-400`}>
            {creditSum} credits
          </Chip>
        </div>
        {canManage && (
          <Button size="sm" className={`${RETRO.btn} text-sm px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400`}
            startContent={<Plus className="w-3.5 h-3.5" />}
            onPress={() => onAddNew(semester)}>
            New Subject
          </Button>
        )}
        <div className="flex-1 h-1 border-t-2 border-dashed border-black/20 dark:border-white/20" />
      </div>

      {/* Drop zone with grid */}
      <div
        ref={setNodeRef}
        className={`
          grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-3 p-3 min-h-[100px]
          rounded-none border-2 transition-all duration-200
          ${isOver
            ? "border-retro-orange border-dashed bg-retro-orange/5 shadow-[inset_0_0_30px_rgba(238,157,43,0.1)]"
            : "border-transparent"
          }
        `}
      >
        {children}
      </div>
    </div>
  );
}

// ============ Snap modifier ============
const snapCenterToCursor: Modifier = ({ activatorEvent, draggingNodeRect, transform }) => {
  if (draggingNodeRect && activatorEvent && 'clientX' in activatorEvent) {
    const evt = activatorEvent as PointerEvent;
    const offsetX = evt.clientX - draggingNodeRect.left - draggingNodeRect.width / 2;
    const offsetY = evt.clientY - draggingNodeRect.top - draggingNodeRect.height / 2;
    return { ...transform, x: transform.x + offsetX, y: transform.y + offsetY };
  }
  return transform;
};

function customCollisionDetection(args: Parameters<typeof pointerWithin>[0]) {
  const pointer = pointerWithin(args);
  if (pointer.length > 0) return pointer;
  return rectIntersection(args);
}

// ============ Drag Overlay Card ============
function OverlayCard({ subject }: { subject: any }) {
  return (
    <div className={`
      ${RETRO.card} p-0 overflow-hidden w-[320px] opacity-90 rotate-1 scale-105
    `}>
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-retro-orange/30 to-transparent border-b-4 border-black dark:border-white">
        <BookOpen className="w-4 h-4 text-retro-orange" />
        <span className="text-xl font-mono font-bold text-retro-orange uppercase">{subject.code}</span>
        <Chip size="sm" variant="flat" color="primary" className={`${RETRO.chip} text-base ml-auto`}>{subject.credit}cr</Chip>
      </div>
      <div className="px-4 py-2">
        <p className="text-lg font-bold truncate">{subject.name_vi || "—"}</p>
      </div>
    </div>
  );
}

// ============ Main Page ============
export default function SubjectsPage() {
  const params = useParams();
  const router = useRouter();
  const majorId = params.code as string;
  const qc = useQueryClient();

  const { hasPermission } = useAuth();
  const canManage = hasPermission("curriculums:manage");

  const [searchQuery, setSearchQuery] = useState("");
  const [activeDragSubject, setActiveDragSubject] = useState<any>(null);
  const [defaultSemester, setDefaultSemester] = useState<number | undefined>(undefined);

  // Modals
  const { isOpen: isSubjectOpen, onOpen: onSubjectOpen, onClose: onSubjectClose } = useDisclosure();
  const { isOpen: isAssessmentOpen, onOpen: onAssessmentOpen, onClose: onAssessmentClose } = useDisclosure();
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  // Sensors
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // Fetch major info
  const { data: majorResponse } = useQuery({
    queryKey: ["admin-major-info", majorId],
    queryFn: async () => {
      const res = await adminCurriculumService.getMajors();
      const major = (res?.data || []).find((m: any) => m._id === majorId);
      return major;
    }
  });
  const majorName = majorResponse?.name || majorId;
  const majorCode = majorResponse?.code || "";

  // Fetch subjects
  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ["majorSubjects", majorId],
    queryFn: () => adminCurriculumService.getMajorSubjects(majorId)
  });

  const subjects = React.useMemo(() => {
    if (!response?.data) return [];
    return response.data.filter((s: any) =>
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.name_vi && s.name_vi.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.name_en && s.name_en.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [response, searchQuery]);

  const groupedBySemester = React.useMemo(() => {
    const map = new Map<number, any[]>();
    subjects.forEach(s => {
      const sem = s.semester || 0;
      if (!map.has(sem)) map.set(sem, []);
      map.get(sem)!.push(s);
    });
    return [...map.entries()].sort(([a], [b]) => a - b);
  }, [subjects]);

  const totalCredits = subjects.reduce((sum: number, s: any) => sum + (s.credit || 0), 0);

  // ---- Handlers ----
  const handleAddSubject = useCallback((semester?: number) => {
    setSelectedSubject(null);
    setDefaultSemester(semester);
    onSubjectOpen();
  }, [onSubjectOpen]);

  const handleEditSubject = useCallback((subject: any) => {
    setSelectedSubject(subject);
    setDefaultSemester(undefined);
    onSubjectOpen();
  }, [onSubjectOpen]);

  const handleManageAssessment = useCallback((subject: any) => {
    setSelectedSubject(subject);
    onAssessmentOpen();
  }, [onAssessmentOpen]);

  const handleDelete = useCallback(async (subjectId: string) => {
    if (!confirm("Are you sure you want to delete this subject?")) return;
    try {
      await curriculumService.deleteSubject(majorId, subjectId);
      addToast({ title: "Subject deleted successfully", color: "success" });
      refetch();
    } catch (error: any) {
      addToast({ title: error.response?.data?.message || "Failed to delete subject", color: "danger" });
    }
  }, [majorId, refetch]);

  // ---- DnD ----
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as { subject: any };
    setActiveDragSubject(data?.subject ?? null);
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveDragSubject(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current as { subject: any };
    const overId = over.id.toString();

    // Determine target semester from droppable zone
    let targetSemester: number | null = null;
    if (overId.startsWith("semester-zone-")) {
      targetSemester = parseInt(overId.replace("semester-zone-", ""));
    }
    if (targetSemester === null) return;

    const subject = activeData.subject;
    const currentSemester = subject.semester || 0;

    // Only act if moving to a different semester
    if (currentSemester === targetSemester) return;

    try {
      await adminCurriculumService.moveSubjectSemester(majorId, subject._id || subject.id, targetSemester);
      addToast({ title: `Moved "${subject.code}" to Semester ${targetSemester}`, color: "success" });
      refetch();
    } catch (error: any) {
      addToast({ title: error.response?.data?.message || "Failed to move subject", color: "danger" });
    }
  }, [majorId, refetch]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full h-full flex flex-col gap-5 mx-auto font-jersey10 tracking-wide overflow-y-auto">

        {/* ═══ RETRO HEADER ═══ */}
        <div className={`${RETRO.card}`}>
          <div className="relative">
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ea580c_1px,transparent_1px)] bg-[length:12px_12px]" />
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center p-6 gap-4">
              <div className="flex items-center gap-4">
                <Button isIconOnly className={`${RETRO.btn} bg-transparent`} onPress={() => router.push('/curriculums')}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <GraduationCap className="w-8 h-8 text-retro-orange" />
                    <h1 className="text-3xl md:text-4xl font-bold text-retro-orange uppercase drop-shadow-[2px_2px_0px_#000]">
                      {majorName}
                    </h1>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {majorCode && (
                      <Chip size="md" variant="flat" className={`${RETRO.chip} text-lg bg-black/10 dark:bg-white/10`}>{majorCode}</Chip>
                    )}
                    <Chip size="md" variant="flat" className={`${RETRO.chip} text-lg bg-retro-orange/15 text-retro-orange`}>{subjects.length} subjects</Chip>
                    <Chip size="md" variant="flat" className={`${RETRO.chip} text-lg bg-blue-500/15 text-blue-600 dark:text-blue-400`}>{totalCredits} total credits</Chip>
                  </div>
                </div>
              </div>
              {canManage && (
                <Button color="primary" className={`${RETRO.btn} text-lg px-6`}
                  endContent={<Plus className="w-5 h-5" />}
                  onPress={() => handleAddSubject()}>
                  ✚ Add Subject
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ═══ SEARCH BAR ═══ */}
        <div className="flex gap-4">
          <Input
            isClearable
            className="w-full sm:max-w-[50%] font-jersey10 text-xl"
            classNames={{ inputWrapper: "rounded-none border-4 border-black dark:border-white shadow-pixel dark:shadow-pixel-dark bg-white dark:bg-black h-12" }}
            placeholder="Search subjects..."
            startContent={<Search size={18} className="text-default-400" />}
            value={searchQuery}
            onClear={() => setSearchQuery("")}
            onValueChange={setSearchQuery}
          />
          <div className="hidden md:flex items-center gap-2 text-default-400 text-base">
            <span>Showing</span>
            <Chip size="sm" variant="flat" className={`${RETRO.chip} text-base`}>{subjects.length}</Chip>
            <span>of</span>
            <Chip size="sm" variant="flat" className={`${RETRO.chip} text-base`}>{response?.data?.length || 0}</Chip>
          </div>
        </div>

        {/* ═══ LOADING STATE ═══ */}
        {isLoading && (
          <div className={`${RETRO.card} p-12 flex flex-col items-center justify-center`}>
            <Spinner color="warning" size="lg" />
            <p className="text-xl text-retro-orange mt-4 uppercase animate-pulse">Loading Subjects...</p>
          </div>
        )}

        {/* ═══ EMPTY STATE ═══ */}
        {!isLoading && subjects.length === 0 && (
          <div className={`${RETRO.card} p-12 flex flex-col items-center justify-center text-center`}>
            <p className="text-2xl text-default-400 uppercase font-bold">No subjects found</p>
            <p className="text-base text-default-300 mt-2">
              {searchQuery ? "Try a different search." : "Add subjects to get started."}
            </p>
          </div>
        )}

        {/* ═══ SUBJECT CARDS BY SEMESTER (droppable) ═══ */}
        {!isLoading && groupedBySemester.map(([semester, semSubjects]) => (
          <SemesterDropZone
            key={semester}
            semester={semester}
            subjectCount={semSubjects.length}
            creditSum={semSubjects.reduce((sum: number, s: any) => sum + (s.credit || 0), 0)}
            canManage={canManage}
            onAddNew={handleAddSubject}
          >
            {semSubjects.map((subject: any) => (
              <DraggableSubjectCard
                key={subject._id || subject.id || subject.code}
                subject={subject}
                canManage={canManage}
                onEdit={handleEditSubject}
                onDelete={handleDelete}
                onAssessment={handleManageAssessment}
              />
            ))}
          </SemesterDropZone>
        ))}

        <div className="h-4" />

        <SubjectModal
          isOpen={isSubjectOpen}
          onClose={onSubjectClose}
          subject={selectedSubject}
          curriculumCode={majorId}
          onSuccess={refetch}
        />

        <AssessmentPlanModal
          isOpen={isAssessmentOpen}
          onClose={onAssessmentClose}
          subject={selectedSubject}
          onSuccess={refetch}
        />
      </div>

      {/* Drag Overlay */}
      <DragOverlay dropAnimation={null} modifiers={[snapCenterToCursor]}>
        {activeDragSubject && <OverlayCard subject={activeDragSubject} />}
      </DragOverlay>
    </DndContext>
  );
}
