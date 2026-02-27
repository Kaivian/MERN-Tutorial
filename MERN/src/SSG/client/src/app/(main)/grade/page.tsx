"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/auth.provider";
import {
  Card,
  CardHeader,
  CardBody,
  Select,
  SelectItem,
  Input,
  Button,
  Selection,
  ScrollShadow,
  cn,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure
} from "@heroui/react";

import { SubjectRow } from "@/components/grade/Subject";
import { useCurriculumPrograms, useCurriculumSemesters } from "@/hooks/useCurriculum";
import { useUserCurriculum } from "@/hooks/useUserCurriculum";
import { Spinner } from "@heroui/react";
import { useTranslation } from "@/i18n";

// --- DATA DEFINITIONS ---
const majorGroups = [
  {
    key: "it_block",
    label: "INFORMATION TECHNOLOGY",
    items: [
      { key: "it", label: "Information Technology" },
      { key: "se", label: "Software Engineering" },
      { key: "ai", label: "Artificial Intelligence" },
      { key: "is", label: "Information Systems" },
      { key: "gd", label: "Graphic Design & Digital Art" },
    ]
  },
  {
    key: "comm_block",
    label: "COMMUNICATION TECH",
    items: [{ key: "multi", label: "Multimedia Communication" }]
  },
];

export default function GradePage() {
  const { user } = useAuth();
  const { t } = useTranslation();

  // --- LOGIC: State Management ---
  const [isEditing, setIsEditing] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const { isOpen: isGuideOpen, onOpen: onGuideOpen, onOpenChange: onGuideOpenChange } = useDisclosure();

  // --- API DATA FETCHING ---
  const { data: programsData, isLoading: isProgramsLoading } = useCurriculumPrograms();
  const { data: userCurriculum, isLoading: isUserCurriculumLoading, updateContext, saveGrades, refetch } = useUserCurriculum();

  // Extract selected keys from saved context, defaulting to empty sets if not loaded yet
  const selectedBlockKeys = React.useMemo(() => new Set(userCurriculum?.active_context?.block ? [userCurriculum.active_context.block] : []), [userCurriculum]);
  const selectedProgramKeys = React.useMemo(() => new Set(userCurriculum?.active_context?.program ? [userCurriculum.active_context.program] : []), [userCurriculum]);
  const selectedClassKeys = React.useMemo(() => new Set(userCurriculum?.active_context?.cohort_class ? [userCurriculum.active_context.cohort_class] : []), [userCurriculum]);
  const selectedCurrentTermKeys = React.useMemo(() => new Set(userCurriculum?.current_view_term ? [userCurriculum.current_view_term] : (userCurriculum?.active_context?.term ? [userCurriculum.active_context.term] : [])), [userCurriculum]);

  // --- MEMOIZED VALUES ---
  const getSingleKey = (selection: Selection): string | null => {
    if (selection === "all") return null;
    const key = Array.from(selection)[0] as string | undefined;
    return key || null;
  };

  const currentBlockKey = getSingleKey(selectedBlockKeys);
  const currentProgramKey = getSingleKey(selectedProgramKeys);
  const currentClassKey = getSingleKey(selectedClassKeys);
  const currentTermKey = getSingleKey(selectedCurrentTermKeys);

  const availablePrograms = useMemo(() => {
    const group = majorGroups.find((g) => g.key === currentBlockKey);
    return group ? group.items : [];
  }, [currentBlockKey]);

  const availableClasses = useMemo(() => {
    if (!currentProgramKey || !programsData) return [];
    const program = programsData[currentProgramKey];
    return program ? program.classes : [];
  }, [currentProgramKey, programsData]);

  // Hook for Term list (still fetched based on class)
  const { data: generatedTerms, isLoading: isTermsLoading } = useCurriculumSemesters(currentClassKey || undefined);

  // The subjects now come securely from the UserCurriculum context payload
  const currentSubjects = userCurriculum?.subjects || [];
  const termGpa = userCurriculum?.term_gpa;
  const isSubjectsLoading = isUserCurriculumLoading;

  const currentTermLabel = useMemo(() => {
    const term = generatedTerms.find(t => t.key === currentTermKey);
    return term ? term.shortLabel : "---";
  }, [currentTermKey, generatedTerms]);

  const handleTermChange = (keys: Selection) => {
    const selectedTerm = getSingleKey(keys);
    if (selectedTerm) {
      refetch(selectedTerm);
    }
  };

  const getProgramLabel = (progKey: string | null) => {
    if (!progKey) return "Not Set";
    for (const group of majorGroups) {
      const prog = group.items.find(i => i.key === progKey);
      if (prog) return prog.label;
    }
    return progKey;
  };

  // --- STYLES ---
  const commonSelectStyles = {
    trigger: "border-2 border-black shadow-pixel transition-all duration-150 data-[open=true]:translate-x-[2px] data-[open=true]:translate-y-[2px] data-[open=true]:shadow-none",
    label: "text-zinc-500 uppercase tracking-widest font-bold text-sm",
    value: "uppercase font-bold text-black dark:text-zinc-300",
    popoverContent: "rounded-none font-bold border-2 border-black shadow-pixel mx-[2px] data-[selected=true]:bg-zinc-800 data-[selected=true]:text-[#e6b689]",
    listbox: "p-0 gap-0 overflow-y-auto",
  };

  const getSelectStyles = (disabled: boolean) => ({
    ...commonSelectStyles,
    trigger: `${commonSelectStyles.trigger} ${disabled ? "opacity-50 cursor-not-allowed shadow-none border-zinc-800 pointer-events-none" : ""
      }`,
  });

  const commonListboxProps = {
    itemClasses: {
      base: [
        "rounded-none", "text-zinc-500", "transition-colors", "outline-none",
        "data-[focus-visible=true]:ring-0", "data-[focus-visible=true]:ring-offset-0",
        "data-[hover=true]:!bg-[#e6b689]", "data-[hover=true]:!text-black",
        "data-[selected=true]:!bg-[#e6b689]", "data-[selected=true]:!text-black", "data-[selected=true]:font-jersey10",
        "data-[focus=true]:!bg-[#e6b689]", "data-[focus=true]:!text-black",
      ].join(" "),
    },
  };

  const buttonStyles = "bg-[#e6b689] hover:bg-[#d4a373] text-black border-2 border-black font-jersey10 min-w-10 h-10 shadow-pixel hover:shadow-pixel-hover active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all";

  return (
    // CHANGE 1: h-auto cho mobile, md:h-screen cho desktop
    <div className="overflow-hidden flex flex-col gap-3 h-auto md:h-screen transition-colors duration-300 rounded-xl pb-10 md:pb-0">

      {/* HEADER & FILTERS */}
      {/* CHANGE 2: relative cho mobile (scroll được), sticky top-0 cho desktop */}
      <div className="w-full relative md:sticky md:top-0 z-20 flex flex-col md:flex-row gap-3 shrink-0">

        {/* SECTION 1: HEADER */}
        <section className="w-full md:w-auto">
          <Card className="h-full bg-white dark:bg-zinc-800 border-2 border-black rounded-none overflow-hidden relative shadow-pixel dark:shadow-pixel-dark min-w-[320px]">
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[radial-gradient(#000000_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-size-[16px_16px]" />
            <CardHeader className="relative z-10 flex flex-col items-start px-5 py-4 md:px-6 md:py-5 h-full justify-between">

              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-0">
                <i className="hn hn-chart-line text-[#e6b689] text-[28px] md:text-[32px] drop-shadow-[2px_2px_0_rgba(0,0,0,1)]" />
                <h1 className="text-3xl md:text-3xl font-jersey10 text-[#e6b689] uppercase tracking-widest drop-shadow-[2px_2px_0_rgba(0,0,0,1)] whitespace-nowrap">
                  {t('grade.title')}
                </h1>
              </div>

              <div className="flex w-full items-end justify-between">
                {/* Left section */}
                <div className="flex flex-col gap-1 text-[11px] md:text-sm font-bold tracking-widest uppercase">
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-500">{t('grade.player')}: </span>
                    <span className="text-zinc-900 dark:text-zinc-200 truncate max-w-37.5 sm:max-w-none">
                      {user?.fullName ? user?.fullName : user?.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-500">{t('grade.term')}: </span>
                    <span className="text-black dark:text-[#e6b689] font-bold">
                      {currentTermLabel}
                    </span>
                  </div>
                </div>

                {/* Right section - Term GPA */}
                <div className="flex flex-col text-right">
                  <p className="text-sm font-bold text-zinc-500 uppercase">
                    {t('grade.termGPA')}
                  </p>
                  <div className="flex items-baseline justify-end">
                    <span className="text-4xl text-[#e6b689] leading-none drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
                      {termGpa !== undefined && termGpa !== null ? termGpa.toFixed(1) : "-"}
                    </span>
                    <span className="text-md text-zinc-400 ml-1">
                      /10.0
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </section>

        {/* SECTION 2: FILTERS */}
        <section className="w-full md:flex-1">
          <Card className="h-full bg-white dark:bg-zinc-800 border-2 border-black rounded-none overflow-hidden relative shadow-pixel dark:shadow-pixel-dark">
            <div className="absolute inset-0 z-0 opacity-5 pointer-events-none bg-[radial-gradient(#000000_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-size-[10px_10px]" />
            <CardBody className="relative z-10 px-4 py-4 md:px-6 md:py-6 h-full justify-center">

              <div className="flex flex-col gap-4 justify-between items-center w-full">

                {/* MOBILE TOGGLE HEADER */}
                <div
                  className="flex md:hidden w-full justify-between items-center cursor-pointer select-none"
                  onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                >
                  <div className="flex items-center gap-2 text-[#e6b689] font-jersey10 uppercase tracking-widest text-lg drop-shadow-[1px_1px_0_rgba(0,0,0,1)]">
                    <i className="hn hn-filter" />
                    <span>{t('grade.filterConfiguration')}</span>
                  </div>
                  <i className={cn("hn text-xl transition-transform duration-300", isMobileFilterOpen ? "hn-caret-up" : "hn-caret-down")} />
                </div>

                <div
                  className={cn(
                    "grid grid-cols-1 md:grid-cols-4 gap-4 w-full md:-mt-2 transition-all duration-300",
                    isMobileFilterOpen ? "block opacity-100" : "hidden md:grid opacity-100"
                  )}
                >
                  {/* READ ONLY CONTEXT */}
                  <div className="md:col-span-3 flex flex-wrap gap-2 items-center text-xs font-bold uppercase tracking-widest text-zinc-500">
                    {currentBlockKey || currentProgramKey || currentClassKey ? (
                      <>
                        <span>
                          {majorGroups.find(g => g.key === currentBlockKey)?.label || "No Block"}
                        </span>
                        <i className="hn hn-caret-right" />
                        <span className="text-black dark:text-white">
                          {getProgramLabel(currentProgramKey)}
                        </span>
                        <i className="hn hn-caret-right" />
                        <span className="text-[#e6b689] bg-black px-2 py-1 border-2 border-[#e6b689]">
                          {currentClassKey || "No Class"}
                        </span>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-red-400">
                        <i className="hn hn-error-warning-line text-lg" />
                        <span>{t('grade.profileAcademicContextNotConfigured')}</span>
                        <Button
                          as={Link}
                          href="/profile"
                          size="sm"
                          radius="none"
                          className="bg-[#e6b689] text-black font-black uppercase shadow-[2px_2px_0_#000] border-2 border-black ml-2 h-7"
                        >
                          {t('grade.setProfile')}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* TERM SELECT */}
                  <div className="md:col-span-1 flex justify-end">
                    <div className="w-full max-w-full min-w-[240px]">
                      <Select
                        isDisabled={!currentClassKey}
                        labelPlacement="outside-left"
                        label="4. Current Term"
                        classNames={getSelectStyles(!currentClassKey)}
                        placeholder={!currentClassKey ? "Select class first" : "Select current term"}
                        variant="bordered"
                        size="md"
                        radius="none"
                        selectedKeys={selectedCurrentTermKeys}
                        onSelectionChange={handleTermChange}
                        listboxProps={commonListboxProps}
                        isLoading={isTermsLoading}
                        className="w-full"
                      >
                        {generatedTerms.map((term) => (
                          <SelectItem key={term.key} textValue={term.label}>
                            <span className="font-bold uppercase tracking-wider whitespace-nowrap">
                              {term.label}
                            </span>
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 w-full justify-end mt-2 md:mt-0">
                  <Input
                    classNames={{
                      inputWrapper: [
                        "bg-white dark:bg-zinc-900", "border-2 border-black", "rounded-none",
                        "shadow-pixel dark:shadow-pixel-dark", "h-[40px]",
                        "transition-all duration-150",
                        "data-[hover=true]:border-black", "data-[focus=true]:!border-black",
                        "data-[focus=true]:translate-x-[2px]", "data-[focus=true]:translate-y-[2px]",
                        "data-[focus=true]:shadow-none",
                      ].join(" "),
                      input: "font-bold tracking-wider uppercase text-black dark:text-white placeholder:text-zinc-400 placeholder:placeholder:font-bold placeholder:tracking-wider",
                    }}
                    isClearable
                    placeholder="SEARCH..."
                    size="sm"
                    radius="none"
                    variant="bordered"
                    startContent={<i className="hn hn-search" />}
                  />
                  <Button as={Link} href="/grade/chart" radius="none" className={cn(buttonStyles, "px-4 font-bold tracking-wider uppercase hidden sm:flex")}>
                    {t('grade.analytics')}
                  </Button>
                  <Button as={Link} href="/grade/chart" isIconOnly radius="none" className={cn(buttonStyles, "flex sm:hidden")}>
                    <i className="hn hn-pie-chart text-lg" />
                  </Button>
                  <Button onPress={onGuideOpen} radius="none" className={cn(buttonStyles, "px-4 font-bold tracking-widest uppercase hidden sm:flex !bg-emerald-500 !text-white")}>
                    {t('grade.guide')}
                  </Button>
                  <Button isIconOnly radius="none" className={cn(buttonStyles, "hidden md:flex")}>
                    <i className="hn hn-filter" />
                  </Button>
                  <Button isIconOnly radius="none" className={buttonStyles} onPress={() => setIsEditing(!isEditing)}>
                    <i className={`hn ${isEditing ? "hn-save text-lg" : "hn-pen text-lg"}`} />
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </section>
      </div>

      {/* SECTION 3: CONTENT LIST */}
      {/* CHANGE 3: h-auto cho mobile để scroll trang, min-h-0 cho desktop để scroll internal */}
      <section className="flex-1 flex flex-col h-auto md:min-h-0">
        <Card className="flex-1 h-full bg-white dark:bg-zinc-800 border-2 border-black rounded-none overflow-hidden relative shadow-pixel dark:shadow-pixel-dark">
          <div className="absolute inset-0 z-0 opacity-5 pointer-events-none bg-[radial-gradient(#000000_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-size-[10px_10px]" />
          <div className="z-20 flex justify-between px-4 py-3 border-b-2 border-black text-xs font-bold text-zinc-500 uppercase tracking-wider bg-zinc-50 dark:bg-zinc-900">
            <div>{t('grade.subjectInfo')}</div>
            <div className="pr-4">{t('grade.statusScore')}</div>
          </div>

          <div className="absolute inset-0 z-0 opacity-5 pointer-events-none bg-[radial-gradient(#e6b689_1px,transparent_1px)] bg-size-[20px_20px]" />

          <CardBody className="relative z-10 p-0 h-full overflow-visible md:overflow-hidden">
            {isSubjectsLoading ? (
              <div className="h-full flex items-center justify-center py-10 md:py-0">
                <Spinner color="warning" label={t('grade.loadingSubjects')} />
              </div>
            ) : !currentTermKey ? (
              <div className="h-full flex items-center justify-center text-zinc-600 font-mono text-sm py-10 md:py-0">
                <div className="text-center">
                  <i className="hn hn-cursor-click text-4xl mb-2 opacity-50" />
                  <p>{t('grade.selectATermToBegin')}</p>
                </div>
              </div>
            ) : currentSubjects.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-600 font-mono text-sm py-10 md:py-0">
                <div className="text-center">
                  <i className="hn hn-folder-open text-4xl mb-2 opacity-50" />
                  <p>{t('grade.noDataFound')}</p>
                </div>
              </div>
            ) : (
              // CHANGE 4: Điều kiện render ScrollShadow
              // Mobile: Div thường (để scroll toàn trang)
              // Desktop: ScrollShadow (để scroll nội bộ)
              <>
                <div className="block md:hidden w-full h-full">
                  <div className="flex flex-col">
                    {currentSubjects.map((sub) => (
                      <SubjectRow key={sub.code} subject={sub} onSave={saveGrades} />
                    ))}
                  </div>
                  {/* Spacer cho mobile scroll */}
                  <div className="h-10" />
                </div>

                <ScrollShadow className="hidden md:block w-full h-full">
                  <div className="flex flex-col">
                    {currentSubjects.map((sub) => (
                      <SubjectRow key={sub.code} subject={sub} onSave={saveGrades} />
                    ))}
                  </div>
                  <div className="h-20" />
                </ScrollShadow>
              </>
            )}
          </CardBody>
        </Card>
      </section>

      {/* USER GUIDE MODAL */}
      <Modal isOpen={isGuideOpen} onOpenChange={onGuideOpenChange} classNames={{ base: "border-4 border-black rounded-none shadow-[8px_8px_0_rgba(0,0,0,1)] bg-white dark:bg-zinc-900 p-2", closeButton: "hover:bg-red-500 border-2 border-transparent hover:border-black rounded-none" }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b-4 border-black text-xl font-bold text-black dark:text-white uppercase">
                Hướng Dẫn: Theo Dõi Điểm Số
              </ModalHeader>
              <ModalBody className="py-4 flex flex-col gap-3 text-sm md:text-base leading-relaxed text-black dark:text-white">
                <p><strong>Chọn Kỳ Học:</strong> Sử dụng bộ lọc "Current Term" để xem danh sách môn học và điểm số của từng học kỳ cụ thể.</p>
                <p><strong>Cập Nhật Điểm:</strong> Nhấn vào biểu tượng bút chì (hoặc nút Save) để bật chế độ lưu/chỉnh sửa. Bạn có thể nhập điểm mới cho các bài kiểm tra chuyên cần (Attendance), thi giữa kỳ, cuối kỳ... cho từng môn.</p>
                <p><strong>Tính Điểm Trung Bình (GPA):</strong> Hệ thống tự động tính toán điểm trung bình tích lũy của học kỳ hiện tại (Term GPA) dựa trên số tín chỉ và điểm số của môn học đó.</p>
                <p><strong>Phân Tích (Analytics):</strong> Chuyển sang nút Analytics để xem các biểu đồ thống kê chi tiết toàn bộ quá trình học tập của bạn.</p>
              </ModalBody>
              <ModalFooter className="border-t-4 border-black">
                <Button color="primary" onPress={onClose} className="border-2 border-black rounded-none shadow-[2px_2px_0_rgba(0,0,0,1)] font-bold uppercase">
                  Đã hiểu
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

    </div>
  );
}
