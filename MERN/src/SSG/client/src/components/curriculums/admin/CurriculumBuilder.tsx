// client/src/components/curriculums/admin/CurriculumBuilder.tsx
"use client";

import React, { useState, useCallback } from "react";
import {
  DndContext, DragOverlay, DragStartEvent, DragEndEvent,
  DragOverEvent, PointerSensor, useSensor, useSensors,
  pointerWithin, rectIntersection,
  type Modifier
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button, Input, Spinner, addToast, Tooltip,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Select, SelectItem, Chip
} from "@heroui/react";
import { SemesterLane } from "./SemesterLane";
import { SubjectCard, PoolSubjectCard } from "./SubjectCard";
import { adminCurriculumService } from "@/services/curriculum.service";
import { AdminClass, AdminSubject, SemesterCurriculumData } from "@/types/curriculum.types";
import { Search, Copy, BookOpen, Save } from "lucide-react";

// Retro style constants
const RETRO = {
  panel: "rounded-none border-4 border-black dark:border-white shadow-pixel dark:shadow-pixel-dark bg-retro-bg dark:bg-retro-bg-dark",
  panelHeader: "bg-retro-orange text-black font-bold text-lg uppercase border-b-4 border-black dark:border-white px-4 py-2.5",
  btn: "rounded-none border-2 border-black font-bold uppercase shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-y-[2px] hover:shadow-none transition-transform",
  input: "rounded-none border-4 border-black dark:border-white shadow-pixel dark:shadow-pixel-dark bg-white dark:bg-black",
} as const;

interface CurriculumBuilderProps {
  selectedClass: AdminClass;
  allClasses: AdminClass[];
}

function CurriculumBuilderInner({
  selectedClass,
  allClasses,
  semesters,
  setSemesters,
  isDirty,
  onSave,
  isSaving,
  onSubjectClick,
}: CurriculumBuilderProps & {
  semesters: SemesterCurriculumData[];
  setSemesters: React.Dispatch<React.SetStateAction<SemesterCurriculumData[]>>;
  isDirty: boolean;
  onSave: () => void;
  isSaving: boolean;
  onSubjectClick: (subject: AdminSubject) => void;
}) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [copySourceId, setCopySourceId] = useState("");
  const [copyOverwrite, setCopyOverwrite] = useState(false);
  const [copyLoading, setCopyLoading] = useState(false);

  // Fetch curriculum for selected class
  const { isLoading: curriculumLoading } = useQuery({
    queryKey: ["admin-class-curriculum", selectedClass._id],
    queryFn: async () => {
      const res = await adminCurriculumService.getClassCurriculum(selectedClass._id);
      setSemesters(res.data.semesters);
      return res.data;
    },
    enabled: !!selectedClass._id,
  });

  // Fetch subject pool
  const { data: poolData, isLoading: poolLoading } = useQuery({
    queryKey: ["admin-subject-pool", search],
    queryFn: () => adminCurriculumService.getSubjectPool(search || undefined),
    placeholderData: prev => prev,
  });

  const subjectPool: AdminSubject[] = poolData?.data || [];

  // IDs already in any semester
  const assignedSubjectIds = new Set(
    semesters.flatMap(s => s.subjects.map(e => e.subject?._id))
  );

  const filteredPool = subjectPool.filter(s => !assignedSubjectIds.has(s._id));

  const handleRemove = async (mappingId: string) => {
    try {
      await adminCurriculumService.removeSubjectFromClass(selectedClass._id, mappingId);
      await qc.invalidateQueries({ queryKey: ["admin-class-curriculum", selectedClass._id] });
    } catch {
      addToast({ title: "Failed to remove subject", color: "danger" });
    }
  };

  const handleCopy = async () => {
    if (!copySourceId) return;
    setCopyLoading(true);
    try {
      const res = await adminCurriculumService.copyCurriculumFromClass(selectedClass._id, copySourceId, copyOverwrite);
      addToast({ title: `Copied ${res.data.copiedCount} subjects`, color: "success" });
      await qc.invalidateQueries({ queryKey: ["admin-class-curriculum", selectedClass._id] });
      setCopyModalOpen(false);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      addToast({ title: err?.response?.data?.message || "Copy failed", color: "danger" });
    } finally {
      setCopyLoading(false);
    }
  };

  const otherClasses = allClasses.filter(c => c._id !== selectedClass._id);

  return (
    <div className="flex h-full gap-4 overflow-hidden font-jersey10 tracking-wide">
      {/* ── Left Panel: Subject Pool ── */}
      <div className={`flex flex-col w-72 flex-shrink-0 overflow-hidden ${RETRO.panel}`}>
        <div className={RETRO.panelHeader}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              <span>Subject Pool</span>
            </div>
            {poolLoading && <Spinner size="sm" />}
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b-2 border-black/20 dark:border-white/20">
          <Input
            isClearable size="sm"
            placeholder="Search subjects..."
            startContent={<Search className="text-default-400 w-4 h-4" />}
            value={search}
            onValueChange={setSearch}
            onClear={() => setSearch("")}
            classNames={{ inputWrapper: "rounded-none border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] bg-white dark:bg-black h-10" }}
          />
        </div>

        {/* Pool items */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 bg-retro-bg/50 dark:bg-black/20">
          {filteredPool.length === 0 && !poolLoading && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-default-400">
              <span className="text-3xl mb-2 opacity-40">📚</span>
              <p className="text-sm uppercase font-bold">
                {search ? "No match" : "All assigned"}
              </p>
            </div>
          )}
          {filteredPool.map(subject => (
            <PoolSubjectCard key={subject._id} subject={subject} onClick={onSubjectClick} />
          ))}
        </div>
      </div>

      {/* ── Right Panel: Semester Lanes ── */}
      <div className="flex flex-col flex-1 overflow-hidden gap-3">
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-retro-orange uppercase drop-shadow-[1px_1px_0px_#000]">{selectedClass.code}</h3>
            {curriculumLoading && <Spinner size="sm" />}
          </div>
          <div className="flex items-center gap-2">
            {/* Save button — only when dirty */}
            {isDirty && (
              <Button
                size="sm"
                color="success"
                className={RETRO.btn}
                startContent={<Save className="w-4 h-4" />}
                isLoading={isSaving}
                onPress={onSave}
              >
                Save Order
              </Button>
            )}
            <Tooltip content="Copy curriculum from another class">
              <Button size="sm" className={RETRO.btn} startContent={<Copy className="w-4 h-4" />} onPress={() => setCopyModalOpen(true)}>
                Copy From
              </Button>
            </Tooltip>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <div className="flex gap-3 h-full pb-2" style={{ minWidth: "max-content" }}>
            {semesters.map(sem => (
              <SemesterLane
                key={sem.semester}
                semester={sem.semester}
                entries={sem.subjects}
                onRemove={handleRemove}
                onSubjectClick={onSubjectClick}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Copy modal — retro styled */}
      <Modal isOpen={copyModalOpen} onClose={() => setCopyModalOpen(false)} size="sm"
        classNames={{ base: "rounded-none border-4 border-black dark:border-white shadow-pixel dark:shadow-pixel-dark bg-retro-bg dark:bg-retro-bg-dark font-jersey10" }}>
        <ModalContent>
          <ModalHeader className="text-xl font-bold text-retro-orange uppercase border-b-4 border-black dark:border-white bg-retro-orange/10 drop-shadow-[1px_1px_0px_#000]">
            Copy Curriculum
          </ModalHeader>
          <ModalBody className="gap-3 p-4">
            <Select label="Source Class" selectedKeys={copySourceId ? [copySourceId] : []}
              onSelectionChange={keys => setCopySourceId([...keys][0] as string)}
              classNames={{ trigger: "rounded-none border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]" }}>
              {otherClasses.map(c => <SelectItem key={c._id}>{c.code} – {c.name}</SelectItem>)}
            </Select>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="overwrite" checked={copyOverwrite} onChange={e => setCopyOverwrite(e.target.checked)} className="w-4 h-4 accent-danger" />
              <label htmlFor="overwrite" className="text-base text-danger uppercase font-bold">Overwrite existing</label>
            </div>
            <p className="text-sm text-default-400">
              {copyOverwrite
                ? "⚠️ This will REPLACE the entire curriculum of this class."
                : "Subjects that already exist in a semester will be skipped."}
            </p>
          </ModalBody>
          <ModalFooter className="border-t-4 border-black dark:border-white">
            <Button variant="flat" onPress={() => setCopyModalOpen(false)} className={RETRO.btn}>Cancel</Button>
            <Button color="primary" isLoading={copyLoading} onPress={handleCopy} isDisabled={!copySourceId} className={RETRO.btn}>Copy</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

/**
 * Custom collision detection: prioritizes pointerWithin for droppable containers,
 * falls back to rectIntersection for finer-grained sorting within lanes.
 */
function customCollisionDetection(args: Parameters<typeof pointerWithin>[0]) {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) return pointerCollisions;
  return rectIntersection(args);
}

/**
 * Modifier: snaps the center of the DragOverlay to the cursor position.
 */
const snapCenterToCursor: Modifier = ({
  activatorEvent,
  draggingNodeRect,
  transform,
}) => {
  if (draggingNodeRect && activatorEvent && 'clientX' in activatorEvent) {
    const evt = activatorEvent as PointerEvent;
    const offsetX = evt.clientX - draggingNodeRect.left - draggingNodeRect.width / 2;
    const offsetY = evt.clientY - draggingNodeRect.top - draggingNodeRect.height / 2;
    return {
      ...transform,
      x: transform.x + offsetX,
      y: transform.y + offsetY,
    };
  }
  return transform;
};

/**
 * CurriculumBuilderWithDnd — wraps everything with DndContext.
 * Handles drag state, events, isDirty tracking, manual save, and subject detail modal.
 */
export function CurriculumBuilderWithDnd({ selectedClass, allClasses }: CurriculumBuilderProps) {
  const qc = useQueryClient();
  const [activeDragSubject, setActiveDragSubject] = useState<AdminSubject | null>(null);
  const [semesters, setSemesters] = useState<SemesterCurriculumData[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Subject detail modal state
  const [detailSubject, setDetailSubject] = useState<AdminSubject | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleSubjectClick = useCallback((subject: AdminSubject) => {
    setDetailSubject(subject);
  }, []);

  // ── Manual Save ──
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const updates = semesters.flatMap(s =>
        s.subjects.map((e, idx) => ({
          mappingId: e.mappingId,
          semester: s.semester,
          order_index: idx
        }))
      );
      await adminCurriculumService.reorderCurriculum(selectedClass._id, updates);
      setIsDirty(false);
      addToast({ title: "Curriculum order saved!", color: "success" });
    } catch {
      addToast({ title: "Failed to save order", color: "danger" });
    } finally {
      setIsSaving(false);
    }
  }, [semesters, selectedClass._id]);

  // ── DnD Handlers ──
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as { subject: AdminSubject };
    setActiveDragSubject(data?.subject ?? null);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current as { subject: AdminSubject; isPoolItem: boolean; mappingId?: string };
    const overId = over.id.toString();

    if (activeData.isPoolItem || !activeData.mappingId) return;

    let targetSemester: number | null = null;
    if (overId.startsWith("semester-")) {
      targetSemester = parseInt(overId.replace("semester-", ""));
    } else {
      for (const sem of semesters) {
        if (sem.subjects.some(e => e.mappingId === overId)) {
          targetSemester = sem.semester;
          break;
        }
      }
    }
    if (targetSemester === null) return;

    setSemesters(prev => {
      const next = prev.map(s => ({ ...s, subjects: [...s.subjects] }));
      let srcSemIdx = -1, srcSubIdx = -1;
      for (let i = 0; i < next.length; i++) {
        const idx = next[i].subjects.findIndex(e => e.mappingId === activeData.mappingId);
        if (idx !== -1) { srcSemIdx = i; srcSubIdx = idx; break; }
      }
      if (srcSemIdx === -1) return prev;
      const tgtSemIdx = next.findIndex(s => s.semester === targetSemester);
      if (tgtSemIdx === -1 || srcSemIdx === tgtSemIdx) return prev;

      const [moved] = next[srcSemIdx].subjects.splice(srcSubIdx, 1);
      next[tgtSemIdx].subjects.push(moved);
      return next;
    });
    setIsDirty(true);
  }, [semesters]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveDragSubject(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current as { subject: AdminSubject; isPoolItem: boolean; mappingId?: string };
    const overId = over.id.toString();

    let targetSemester: number | null = null;
    if (overId.startsWith("semester-")) {
      targetSemester = parseInt(overId.replace("semester-", ""));
    } else {
      for (const sem of semesters) {
        if (sem.subjects.some(e => e.mappingId === overId)) {
          targetSemester = sem.semester;
          break;
        }
      }
    }
    if (targetSemester === null) return;

    // Pool → semester: add via API immediately
    if (activeData.isPoolItem) {
      try {
        await adminCurriculumService.addSubjectToClass(selectedClass._id, {
          subjectId: activeData.subject._id,
          semester: targetSemester
        });
        await qc.invalidateQueries({ queryKey: ["admin-class-curriculum", selectedClass._id] });
      } catch (e: unknown) {
        const err = e as { response?: { data?: { message?: string } } };
        addToast({ title: err?.response?.data?.message || "Failed to add subject", color: "danger" });
      }
      return;
    }

    // Reorder within same semester — local only, no API call
    if (!activeData.mappingId) return;

    setSemesters(prev => {
      const next = prev.map(s => ({ ...s, subjects: [...s.subjects] }));
      let srcSemIdx = -1, srcSubIdx = -1;
      for (let i = 0; i < next.length; i++) {
        const idx = next[i].subjects.findIndex(e => e.mappingId === activeData.mappingId);
        if (idx !== -1) { srcSemIdx = i; srcSubIdx = idx; break; }
      }
      if (srcSemIdx === -1) return prev;

      const tgtSemIdx = next.findIndex(s => s.semester === targetSemester);
      if (tgtSemIdx === -1) return prev;

      if (srcSemIdx === tgtSemIdx) {
        const overIdx = next[tgtSemIdx].subjects.findIndex(e => e.mappingId === overId);
        if (overIdx !== -1 && srcSubIdx !== overIdx) {
          next[tgtSemIdx].subjects = arrayMove(next[tgtSemIdx].subjects, srcSubIdx, overIdx);
        }
      }

      return next;
    });
    setIsDirty(true);
  }, [semesters, selectedClass._id, qc]);

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <CurriculumBuilderInner
          selectedClass={selectedClass}
          allClasses={allClasses}
          semesters={semesters}
          setSemesters={setSemesters}
          isDirty={isDirty}
          onSave={handleSave}
          isSaving={isSaving}
          onSubjectClick={handleSubjectClick}
        />
        <DragOverlay dropAnimation={null} modifiers={[snapCenterToCursor]}>
          {activeDragSubject && (
            <div className="opacity-90 rotate-1 scale-105">
              <SubjectCard id="overlay" subject={activeDragSubject} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Subject Detail Modal */}
      <Modal isOpen={!!detailSubject} onClose={() => setDetailSubject(null)} size="lg"
        classNames={{ base: "rounded-none border-4 border-black dark:border-white shadow-pixel dark:shadow-pixel-dark bg-retro-bg dark:bg-retro-bg-dark font-jersey10 tracking-wide" }}>
        <ModalContent>
          {detailSubject && (
            <>
              <ModalHeader className="text-2xl font-bold text-retro-orange uppercase border-b-4 border-black dark:border-white bg-retro-orange/10 drop-shadow-[1px_1px_0px_#000]">
                📖 {detailSubject.code}
              </ModalHeader>
              <ModalBody className="p-6 gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-default-400 uppercase mb-1">Code</p>
                    <p className="text-xl font-bold font-mono">{detailSubject.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-400 uppercase mb-1">Credits</p>
                    <Chip size="lg" variant="flat" color="primary" className="rounded-none border-2 border-black text-lg font-bold">
                      {detailSubject.credit}
                    </Chip>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-default-400 uppercase mb-1">Tên (VI)</p>
                    <p className="text-lg">{detailSubject.name_vi || "—"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-default-400 uppercase mb-1">Name (EN)</p>
                    <p className="text-lg">{detailSubject.name_en || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-400 uppercase mb-1">Semester</p>
                    <p className="text-lg">{detailSubject.semester || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-400 uppercase mb-1">Prerequisite</p>
                    <p className="text-lg">{detailSubject.prerequisite || "None"}</p>
                  </div>
                  {detailSubject.assessment_plan && detailSubject.assessment_plan.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-sm text-default-400 uppercase mb-2">Assessment Plan</p>
                      <div className="flex flex-wrap gap-2">
                        {detailSubject.assessment_plan.map((col: { name: string; weight?: number }, i: number) => (
                          <Chip key={i} size="md" variant="flat" className="rounded-none border-2 border-black text-base">
                            {col.name} {col.weight ? `(${col.weight}%)` : ""}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter className="border-t-4 border-black dark:border-white">
                <Button variant="flat" onPress={() => setDetailSubject(null)}
                  className={RETRO.btn}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
