// client/src/app/(main)/curriculums/page.tsx
"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button, Spinner, Chip, addToast
} from "@heroui/react";
import {
  Plus, Edit2, Trash2, ChevronRight, ChevronDown,
  Layers, BookOpen, GraduationCap, Users, ArrowLeft, Eye
} from "lucide-react";

import { adminCurriculumService } from "@/services/curriculum.service";
import { MajorCategory, Major, AdminClass } from "@/types/curriculum.types";
import { MajorCategoryModal, MajorModal, ClassModal } from "@/components/curriculums/admin/EntityModals";
import { useAuth } from "@/providers/auth.provider";
import { CurriculumBuilderWithDnd } from "@/components/curriculums/admin/CurriculumBuilder";
import { useRouter } from "next/navigation";

// ============ Retro Pixel Style Constants ============
const RETRO = {
  header: "bg-retro-bg dark:bg-retro-bg-dark border-4 border-black dark:border-white shadow-pixel dark:shadow-pixel-dark",
  title: "text-4xl font-bold text-retro-orange uppercase drop-shadow-[2px_2px_0px_#000]",
  subtitle: "text-xl text-default-500 dark:text-default-400 mt-1",
  btn: "rounded-none border-2 border-black font-bold uppercase shadow-pixel dark:shadow-pixel-dark hover:translate-y-[2px] hover:shadow-pixel-hover dark:hover:shadow-pixel-dark-hover transition-transform",
  btnIcon: "rounded-none border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-y-[2px] hover:shadow-none transition-transform bg-transparent",
  chip: "rounded-none border-2 border-black shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] font-jersey10 text-lg",
  panel: "rounded-none border-4 border-black dark:border-white shadow-pixel dark:shadow-pixel-dark bg-retro-bg dark:bg-retro-bg-dark",
  panelHeader: "bg-retro-orange text-black font-bold text-xl uppercase border-b-4 border-black dark:border-white px-4 py-3",
  listItem: "rounded-none border-2 border-black dark:border-white bg-white dark:bg-black/50 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer",
  listItemActive: "rounded-none border-2 border-retro-orange bg-retro-orange/20 dark:bg-retro-orange/10 shadow-[2px_2px_0px_0px_#ee9d2b]",
  card: "rounded-none border-4 border-black dark:border-white bg-white dark:bg-black/40 shadow-pixel dark:shadow-pixel-dark hover:translate-y-[2px] hover:shadow-pixel-hover dark:hover:shadow-pixel-dark-hover transition-all cursor-pointer",
} as const;

// ============================================================
// Main Page
// ============================================================
export default function CurriculumsPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("curriculums:manage");
  const qc = useQueryClient();
  const router = useRouter();

  // Selection state
  const [selectedCategory, setSelectedCategory] = useState<MajorCategory | null>(null);
  const [selectedMajor, setSelectedMajor] = useState<Major | null>(null);
  const [selectedClass, setSelectedClass] = useState<AdminClass | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Modal state
  const [catModal, setCatModal] = useState<{ open: boolean; item?: MajorCategory }>({ open: false });
  const [majorModal, setMajorModal] = useState<{ open: boolean; item?: Major }>({ open: false });
  const [classModal, setClassModal] = useState<{ open: boolean; item?: AdminClass }>({ open: false });

  // ── Queries ──
  const { data: catData, isLoading: catLoading } = useQuery({
    queryKey: ["admin-major-categories"],
    queryFn: adminCurriculumService.getMajorCategories,
  });
  const categories: MajorCategory[] = catData?.data || [];

  const { data: majorData, isLoading: majorLoading } = useQuery({
    queryKey: ["admin-majors", selectedCategory?._id],
    queryFn: () => adminCurriculumService.getMajors(selectedCategory?._id),
    enabled: !!selectedCategory,
  });
  const majors: Major[] = majorData?.data || [];

  const { data: classData, isLoading: classLoading } = useQuery({
    queryKey: ["admin-classes", selectedMajor?._id],
    queryFn: () => adminCurriculumService.getClasses(selectedMajor?._id),
    enabled: !!selectedMajor,
  });
  const classes: AdminClass[] = classData?.data || [];

  const { data: allClassesData } = useQuery({
    queryKey: ["admin-classes-all"],
    queryFn: () => adminCurriculumService.getClasses(),
  });
  const allClasses: AdminClass[] = allClassesData?.data || [];

  // ── Handlers ──
  const handleDeleteCategory = async (cat: MajorCategory) => {
    if (!confirm(`Delete category "${cat.name}"? This will fail if it has linked majors.`)) return;
    try {
      await adminCurriculumService.deleteMajorCategory(cat._id);
      addToast({ title: "Category deleted", color: "success" });
      qc.invalidateQueries({ queryKey: ["admin-major-categories"] });
      if (selectedCategory?._id === cat._id) setSelectedCategory(null);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      addToast({ title: err?.response?.data?.message || "Delete failed", color: "danger" });
    }
  };

  const handleDeleteMajor = async (major: Major) => {
    if (!confirm(`Delete major "${major.name}"? This will fail if it has linked classes.`)) return;
    try {
      await adminCurriculumService.deleteMajor(major._id);
      addToast({ title: "Major deleted", color: "success" });
      qc.invalidateQueries({ queryKey: ["admin-majors"] });
      if (selectedMajor?._id === major._id) setSelectedMajor(null);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      addToast({ title: err?.response?.data?.message || "Delete failed", color: "danger" });
    }
  };

  const handleDeleteClass = async (cls: AdminClass) => {
    if (!confirm(`Delete class "${cls.code}"? This will also delete its entire curriculum.`)) return;
    try {
      await adminCurriculumService.deleteClass(cls._id);
      addToast({ title: "Class deleted", color: "success" });
      qc.invalidateQueries({ queryKey: ["admin-classes"] });
      if (selectedClass?._id === cls._id) setSelectedClass(null);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      addToast({ title: err?.response?.data?.message || "Delete failed", color: "danger" });
    }
  };

  const toggleCategoryExpand = (id: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── If a class is selected — show the curriculum builder ──
  if (selectedClass) {
    return (
      <div className="flex flex-col h-full gap-4 overflow-hidden font-jersey10 tracking-wide">
        {/* Retro Header */}
        <div className={`flex items-center gap-4 p-4 ${RETRO.header}`}>
          <Button
            isIconOnly
            className={RETRO.btnIcon}
            onPress={() => setSelectedClass(null)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-retro-orange uppercase drop-shadow-[2px_2px_0px_#000] flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              Curriculum Builder
            </h1>
            <p className="text-lg text-default-500 dark:text-default-400 font-mono">
              {selectedClass.code} · {selectedClass.name}
            </p>
          </div>
          <div className="flex gap-2">
            <Chip size="md" variant="flat" color="primary" className={RETRO.chip}>{selectedClass.totalSemesters} Semesters</Chip>
            {selectedClass.intake && <Chip size="md" variant="flat" className={RETRO.chip}>{selectedClass.intake}</Chip>}
          </div>
        </div>
        <p className="text-lg text-default-400 flex-shrink-0">
          ▶ Drag subjects from the pool on the left into the semester columns on the right.
        </p>

        {/* Builder */}
        <div className="flex-1 overflow-hidden">
          <CurriculumBuilderWithDnd selectedClass={selectedClass} allClasses={allClasses} />
        </div>
      </div>
    );
  }

  // ── Default view: Retro Hierarchy Explorer ──
  return (
    <div className="flex flex-col h-full overflow-hidden font-jersey10 tracking-wide">
      {/* ── Top Header ── */}
      <div className={`flex items-center justify-between p-6 m-4 mb-0 ${RETRO.header}`}>
        <div>
          <h1 className={RETRO.title}>
            ⚔ Curriculum Manager
          </h1>
          <p className={RETRO.subtitle}>Select Category → Major → Class to manage curricula.</p>
        </div>
      </div>

      {/* ── 3-Column Explorer ── */}
      <div className="flex flex-1 gap-4 p-4 overflow-hidden">
        {/* ── Column 1: Major Categories ── */}
        <div className={`flex flex-col w-72 flex-shrink-0 overflow-hidden ${RETRO.panel}`}>
          <div className={RETRO.panelHeader}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                <span>Categories</span>
              </div>
              {canManage && (
                <Button isIconOnly size="sm" className={`${RETRO.btnIcon} !border-black`} onPress={() => setCatModal({ open: true })}>
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 bg-retro-bg/50 dark:bg-black/20">
            {catLoading && <div className="flex justify-center p-8"><Spinner size="sm" /></div>}
            {categories.map(cat => (
              <div
                key={cat._id}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedMajor(null);
                  setSelectedClass(null);
                  toggleCategoryExpand(cat._id);
                }}
                className={`group flex flex-col gap-1 px-3 py-2.5 ${selectedCategory?._id === cat._id ? RETRO.listItemActive : RETRO.listItem
                  }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-none border-2 border-black flex-shrink-0" style={{ backgroundColor: cat.color || "#6366f1" }} />
                  <span className="flex-1 text-lg font-bold truncate uppercase">{cat.name}</span>
                  <span className="text-base text-default-500 font-mono">{cat.code}</span>
                  {cat.majorCount !== undefined && (
                    <Chip size="sm" variant="flat" className={`${RETRO.chip} !text-sm`}>{cat.majorCount} majors</Chip>
                  )}
                  {expandedCategories.has(cat._id)
                    ? <ChevronDown className="w-4 h-4 text-default-500" />
                    : <ChevronRight className="w-4 h-4 text-default-500" />
                  }
                  {canManage && (
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1 ml-1" onClick={e => e.stopPropagation()}>
                      <button className="p-1 hover:text-retro-orange transition-colors" onClick={() => setCatModal({ open: true, item: cat })}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1 hover:text-red-500 transition-colors" onClick={() => handleDeleteCategory(cat)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                {cat.description && (
                  <p className="text-sm text-default-400 truncate pl-6">{cat.description}</p>
                )}
              </div>
            ))}
            {!catLoading && categories.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-default-400 gap-3">
                <Layers className="w-10 h-10 opacity-40" />
                <p className="text-lg">No categories yet</p>
                {canManage && (
                  <Button size="sm" color="primary" className={RETRO.btn} startContent={<Plus className="w-4 h-4" />}
                    onPress={() => setCatModal({ open: true })}>
                    Add one
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Column 2: Majors ── */}
        <div className={`flex flex-col w-72 flex-shrink-0 overflow-hidden ${RETRO.panel}`}>
          <div className={RETRO.panelHeader}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                <span>Majors</span>
              </div>
              {canManage && selectedCategory && (
                <Button isIconOnly size="sm" className={`${RETRO.btnIcon} !border-black`}
                  onPress={() => setMajorModal({ open: true })}>
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 bg-retro-bg/50 dark:bg-black/20">
            {!selectedCategory && (
              <div className="flex flex-col items-center justify-center py-12 text-default-400 gap-3">
                <ChevronRight className="w-10 h-10 opacity-40" />
                <p className="text-lg text-center">← Select a category</p>
              </div>
            )}
            {selectedCategory && majorLoading && <div className="flex justify-center p-8"><Spinner size="sm" /></div>}
            {selectedCategory && majors.map(major => (
              <div
                key={major._id}
                onClick={() => { setSelectedMajor(major); setSelectedClass(null); }}
                className={`group flex flex-col gap-1 px-3 py-2.5 ${selectedMajor?._id === major._id ? RETRO.listItemActive : RETRO.listItem
                  }`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold truncate uppercase">{major.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-base text-default-500 font-mono">{major.code}</span>
                      {major.classCount !== undefined && (
                        <Chip size="sm" variant="flat" className={`${RETRO.chip} !text-sm`}>{major.classCount} classes</Chip>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <button
                      className="p-1.5 border-2 border-black dark:border-white bg-retro-orange/10 hover:bg-retro-orange/30 transition-colors"
                      title="View Subjects"
                      onClick={() => router.push(`/curriculums/${major._id}/subjects`)}
                    >
                      <Eye className="w-4 h-4 text-retro-orange" />
                    </button>
                  </div>
                  <ChevronRight className="w-4 h-4 text-default-500 flex-shrink-0" />
                  {canManage && (
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1 ml-1" onClick={e => e.stopPropagation()}>
                      <button className="p-1 hover:text-retro-orange transition-colors" onClick={() => setMajorModal({ open: true, item: major })}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1 hover:text-red-500 transition-colors" onClick={() => handleDeleteMajor(major)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                {major.description && (
                  <p className="text-sm text-default-400 truncate pl-1">{major.description}</p>
                )}
              </div>
            ))}
            {selectedCategory && !majorLoading && majors.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-default-400 gap-3">
                <GraduationCap className="w-10 h-10 opacity-40" />
                <p className="text-lg">No majors found</p>
                {canManage && (
                  <Button size="sm" color="primary" className={RETRO.btn} startContent={<Plus className="w-4 h-4" />}
                    onPress={() => setMajorModal({ open: true })}>
                    Add Major
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Column 3: Classes ── */}
        <div className={`flex flex-col flex-1 overflow-hidden ${RETRO.panel}`}>
          <div className={RETRO.panelHeader}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>Classes</span>
                {selectedMajor && <span className="text-base font-normal ml-2 opacity-70">under {selectedMajor.name}</span>}
              </div>
              {canManage && selectedMajor && (
                <Button size="sm" color="primary" className={RETRO.btn}
                  startContent={<Plus className="w-4 h-4" />}
                  onPress={() => setClassModal({ open: true })}>
                  New Class
                </Button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-retro-bg/50 dark:bg-black/20">
            {!selectedMajor && (
              <div className="flex flex-col items-center justify-center h-full text-default-400 gap-3">
                <Users className="w-14 h-14 opacity-30" />
                <p className="text-xl">← Select a major to view classes</p>
              </div>
            )}
            {selectedMajor && classLoading && <div className="flex justify-center p-8"><Spinner /></div>}
            {selectedMajor && !classLoading && classes.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-default-400 gap-3">
                <Users className="w-14 h-14 opacity-30" />
                <p className="text-xl">No classes yet</p>
                {canManage && (
                  <Button size="sm" color="primary" className={RETRO.btn}
                    startContent={<Plus className="w-4 h-4" />}
                    onPress={() => setClassModal({ open: true })}>
                    Add Class
                  </Button>
                )}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {selectedMajor && classes.map(cls => (
                <div
                  key={cls._id}
                  onClick={() => setSelectedClass(cls)}
                  className={`group relative flex flex-col gap-3 p-4 ${RETRO.card}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono font-bold text-xl text-retro-orange truncate uppercase">{cls.code}</p>
                      <p className="text-lg text-default-600 dark:text-default-300 truncate">{cls.name}</p>
                    </div>
                    <BookOpen className="w-5 h-5 text-retro-orange/50 flex-shrink-0 mt-0.5 group-hover:text-retro-orange transition-colors" />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {cls.intake && <Chip size="sm" variant="flat" className={RETRO.chip}>{cls.intake}</Chip>}
                    {cls.academicYear && <Chip size="sm" variant="flat" className={RETRO.chip}>{cls.academicYear}</Chip>}
                    <Chip size="sm" variant="flat" color="primary" className={RETRO.chip}>{cls.totalSemesters} sem</Chip>
                  </div>
                  {cls.notes && <p className="text-base text-default-400 truncate">{cls.notes}</p>}

                  {/* Actions */}
                  {canManage && (
                    <div className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 flex gap-1 transition-opacity"
                      onClick={e => e.stopPropagation()}>
                      <button className="p-1.5 border-2 border-black dark:border-white bg-white dark:bg-black hover:bg-retro-orange/20 transition-colors" onClick={() => setClassModal({ open: true, item: cls })}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 border-2 border-black dark:border-white bg-white dark:bg-black hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors" onClick={() => handleDeleteClass(cls)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="text-base text-retro-orange/60 group-hover:text-retro-orange transition-colors font-bold mt-1 flex items-center gap-1 uppercase">
                    <span>▶ Open Builder</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <MajorCategoryModal
        isOpen={catModal.open}
        onClose={() => setCatModal({ open: false })}
        item={catModal.item}
      />
      <MajorModal
        isOpen={majorModal.open}
        onClose={() => setMajorModal({ open: false })}
        item={majorModal.item}
        categories={categories}
        defaultCategoryId={selectedCategory?._id}
      />
      <ClassModal
        isOpen={classModal.open}
        onClose={() => setClassModal({ open: false })}
        item={classModal.item}
        majors={majors}
        defaultMajorId={selectedMajor?._id}
      />
    </div>
  );
}
