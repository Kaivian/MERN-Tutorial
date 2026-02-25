"use client";

import React, { useState, useMemo } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
  Chip,
  Progress,
  cn,
  ScrollShadow,
  Tabs,
  Tab,
} from "@heroui/react";
import { UserSubjectGrade, UpdateGradePayload } from "@/types/user-curriculum.types";

// --- TYPE DEFINITIONS ---
type AssessmentPlanItem = UserSubjectGrade["assessment_plan"][number];

// --- STYLE CONSTANTS ---
const rowCardStyles = "bg-white dark:bg-zinc-800 border-2 border-black shadow-pixel dark:shadow-pixel-dark transition-all duration-200";
const rowInteractiveStyles = "hover:shadow-pixel-hover active:translate-y-[2px] active:translate-x-[2px] active:shadow-none";

// --- HELPER: SORT ASSESSMENTS ---
const sortAssessments = (plans: AssessmentPlanItem[]): AssessmentPlanItem[] => {
  return [...plans].sort((a, b) => {
    const getScore = (cat: string) => {
      const lower = cat.toLowerCase();
      if (lower.includes("final exam")) return 3;
      if (lower.includes("practical exam")) return 2;
      return 1;
    };
    return getScore(a.category) - getScore(b.category);
  });
};

// --- HELPER: PARSE & CHECK CRITERIA ---
const checkCondition = (grades: (string | undefined)[], criteriaString?: string) => {
  if (!criteriaString) return { isMet: true, isPending: false };

  const validScores = grades
    .map(v => (v === undefined || v === "") ? NaN : parseFloat(v))
    .filter(n => !isNaN(n));

  if (validScores.length === 0) return { isMet: false, isPending: true };

  const avg = validScores.reduce((a, b) => a + b, 0) / validScores.length;

  const match = criteriaString.match(/([><=]+)\s*([0-9.]+)/);
  if (!match) return { isMet: true, isPending: false };

  const operator = match[1];
  const target = parseFloat(match[2]);

  let passed = false;
  switch (operator) {
    case ">": passed = avg > target; break;
    case ">=": passed = avg >= target; break;
    case "<": passed = avg < target; break;
    case "<=": passed = avg <= target; break;
    case "=": passed = avg === target; break;
    default: passed = true;
  }

  return { isMet: passed, isPending: false };
};

// --- SUB-COMPONENT: SYLLABUS CONTENT ---
const SyllabusColumn = ({ subject, sortedPlans }: {
  subject: UserSubjectGrade,
  sortedPlans: AssessmentPlanItem[],
  grades: Record<string, (string | undefined)[]>
}) => (
  <div className="h-full flex flex-col pr-2 overflow-hidden">
    <div className="mb-6 p-4 rounded-xl bg-zinc-50 border-2 border-zinc-200 shrink-0">
      <div className="text-[#e6b689] font-mono text-xs font-bold mb-2 tracking-widest uppercase">
        Course Info
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] text-zinc-400 uppercase font-bold">Code</p>
          <p className="text-base font-black text-zinc-800">{subject.code}</p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-400 uppercase font-bold">Credits</p>
          <p className="text-base font-black text-zinc-800">{subject.credit}</p>
        </div>
      </div>
    </div>

    <div className="flex-1 min-h-0 flex flex-col">
      <h3 className="text-sm font-bold text-zinc-400 uppercase mb-3 flex items-center gap-2 shrink-0">
        <i className="hn hn-checklist text-[#e6b689]" /> Assessment Structure
      </h3>

      <ScrollShadow
        hideScrollBar
        className="h-full w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        <div className="space-y-2 pb-10">
          {sortedPlans.map((plan, idx) => {
            return (
              <div key={idx} className="flex justify-between items-center p-3 rounded-lg border border-zinc-200 bg-white hover:border-zinc-400 transition-colors">
                <span className="text-xs font-bold text-zinc-600 truncate max-w-[60%]">{plan.category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline-block">{plan.part_count} part(s)</span>
                  <Chip size="sm" variant="flat" className="h-5 bg-[#e6b689]/20 text-[#d97706] font-mono text-[10px] font-bold">
                    {plan.weight_percent}%
                  </Chip>
                </div>
              </div>
            );
          })}

          <div className="mt-4 p-3 rounded border border-orange-200 bg-orange-50">
            <h3 className="text-[10px] font-bold text-orange-600 uppercase mb-1">Pass Criteria</h3>
            <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
              FE ≥ 4.0 and Total Score ≥ 5.0
            </p>
          </div>
        </div>
      </ScrollShadow>
    </div>
  </div>
);

// --- MAIN COMPONENT ---
export const SubjectRow = ({ subject, onSave }: { subject: UserSubjectGrade, onSave: (subjectId: string, payload: UpdateGradePayload) => Promise<unknown> }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [showSyllabus, setShowSyllabus] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"grades" | "syllabus">("grades");
  const [isSaving, setIsSaving] = useState(false);

  // Initialize local grades from mapped backend UserSubjectGrade parts
  const initialGrades = useMemo(() => {
    const map: Record<string, (string | undefined)[]> = {};
    if (subject.grades) {
      subject.grades.forEach((g) => {
        if (!map[g.category]) map[g.category] = [];
        map[g.category][g.part_index] = g.score.toString();
      });
    }
    return map;
  }, [subject.grades]);

  const [grades, setGrades] = useState<Record<string, (string | undefined)[]>>(initialGrades);

  // Sync state if server data changes (e.g. from a Save response)
  React.useEffect(() => {
    setGrades(initialGrades);
  }, [initialGrades]);

  const sortedPlans = useMemo(() => sortAssessments(subject.assessment_plan || []), [subject]);

  const { totalScore, currentWeight, statusColor } = useMemo(() => {
    let weightedScoreSum = 0;
    let accumulatedWeight = 0;
    let hasFailCondition = false;

    sortedPlans.forEach((plan) => {
      const parts = grades[plan.category] || [];
      const validScores = parts
        .map(v => (v === undefined || v === "") ? NaN : parseFloat(v))
        .filter(n => !isNaN(n));

      if (validScores.length > 0) {
        const sumPart = validScores.reduce((a, b) => a + b, 0);
        const catAvg = sumPart / plan.part_count;

        weightedScoreSum += catAvg * (plan.weight_percent / 100);
        accumulatedWeight += (plan.weight_percent / plan.part_count) * validScores.length;

        if (plan.completion_criteria) {
          const { isMet, isPending } = checkCondition(parts, plan.completion_criteria);
          if (!isPending && !isMet) {
            hasFailCondition = true;
          }
        }
      }
    });

    let color: "default" | "success" | "warning" | "danger" = "default";
    if (accumulatedWeight > 0) {
      if (hasFailCondition) color = "danger";
      else if (accumulatedWeight >= 99 && weightedScoreSum < 5) color = "danger";
      else if (weightedScoreSum >= 5) color = "success";
      else color = "warning";
    }

    return { totalScore: weightedScoreSum, currentWeight: accumulatedWeight, statusColor: color };
  }, [grades, sortedPlans]);

  const handleInputChange = (category: string, partIdx: number, val: string) => {
    setGrades((prev) => {
      const plan = subject.assessment_plan?.find((p: AssessmentPlanItem) => p.category === category);
      const limit = plan ? plan.part_count : 1;
      const currentParts = [...(prev[category] || Array(limit).fill(undefined))];

      if (val === "") {
        currentParts[partIdx] = undefined;
      } else {
        const numVal = parseFloat(val);
        if ((!isNaN(numVal) && numVal >= 0 && numVal <= 10) || val === "." || (val.endsWith(".") && !isNaN(parseFloat(val.slice(0, -1))))) {
          if (numVal > 10 && val !== "10.") return prev;
          currentParts[partIdx] = val;
        }
      }
      return { ...prev, [category]: currentParts };
    });
  };

  const handleSave = async () => {
    if (isEditing) {
      // Attempt to Save
      setIsSaving(true);

      // Re-flatten the nested map
      const flattenedGrades: { category: string, part_index: number, score: number }[] = [];
      Object.entries(grades).forEach(([category, parts]) => {
        parts.forEach((scoreStr, part_index) => {
          if (scoreStr !== undefined && scoreStr !== "") {
            flattenedGrades.push({
              category,
              part_index,
              score: parseFloat(scoreStr)
            });
          }
        });
      });

      try {
        // Note: subject.id is the ObjectId populated from backend
        await onSave(subject.id as string, {
          semester: subject.semester,
          grades: flattenedGrades
        });
      } catch (err) {
        console.error("Failed to save", err);
      } finally {
        setIsSaving(false);
        setIsEditing(false); // Only close if saved successfuly
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleClose = () => {
    setShowSyllabus(false);
    setIsEditing(false);
    setActiveTab("grades");
    setGrades(initialGrades); // Revert drafts
  };

  return (
    <>
      {/* --- ROW ITEM --- */}
      <div
        onClick={onOpen}
        className={cn(
          "group relative flex items-center justify-between p-4 mb-3 cursor-pointer",
          rowCardStyles,
          rowInteractiveStyles
        )}
      >
        <div className="flex items-center gap-5">
          <div className={cn(
            "absolute left-0 top-0 bottom-0 w-1.5 transition-all",
            statusColor === 'success' ? "bg-emerald-500" :
              statusColor === 'danger' ? "bg-red-500" :
                statusColor === 'warning' ? "bg-[#e6b689]" : "bg-zinc-300"
          )} />

          <div className="w-20 shrink-0 pl-2">
            <span className="font-pixelify text-black dark:text-white text-lg tracking-widest">{subject.code}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white uppercase tracking-wide transition-colors line-clamp-1">
              {subject.name_en}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono font-bold mt-0.5">
              {subject.credit} CREDITS // {subject.assessment_plan.length} ITEMS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col w-28 gap-1">
            <span className="text-[9px] text-zinc-400 text-right uppercase font-bold tracking-widest">Progress</span>
            <Progress
              size="sm"
              radius="none"
              value={currentWeight}
              classNames={{
                indicator: "bg-[#e6b689]",
                track: "bg-zinc-200 border border-zinc-300"
              }}
            />
          </div>

          <div className={cn(
            "flex items-center justify-center w-14 h-12 border-2 transition-all font-black text-xl",
            statusColor === 'default' ? "border-zinc-300 text-zinc-400 bg-zinc-50" :
              statusColor === 'success' ? "border-emerald-500 text-emerald-600 bg-emerald-50" :
                statusColor === 'danger' ? "border-red-500 text-red-600 bg-red-50" :
                  "border-[#e6b689] text-orange-600 bg-orange-50"
          )}>
            {totalScore > 0 ? totalScore.toFixed(1) : "-"}
          </div>
        </div>
      </div>

      {/* --- MODAL --- */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={handleClose}
        isDismissable={false}
        backdrop="blur"
        scrollBehavior="inside"
        motionProps={{
          variants: {
            enter: { opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
            exit: { opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
          }
        }}
        classNames={{
          wrapper: "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overflow-hidden",
          base: cn(
            "bg-white dark:bg-zinc-800 border-2 border-black shadow-pixel dark:shadow-pixel-dark h-[90vh] max-h-[90vh] rounded-none",
            "w-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
            showSyllabus ? "md:max-w-5xl" : "md:max-w-2xl"
          ),
          header: "border-b-2 border-black pb-0 shrink-0 bg-white dark:bg-zinc-800",
          body: "p-0 overflow-hidden bg-white dark:bg-zinc-800 flex flex-col",
          footer: "border-t-2 border-black pt-4 shrink-0 bg-zinc-50 dark:bg-zinc-900",
          closeButton: "hover:bg-red-500 hover:text-white active:bg-red-700 rounded-none border border-transparent hover:border-black text-zinc-800 dark:text-white transition-colors duration-200 z-50",
        }}
      >
        <ModalContent>
          {() => (
            <>
              {/* SỬA LỖI Ở ĐÂY: Tăng padding phải (md:pr-12) để tránh nút Close */}
              <ModalHeader className="flex flex-col gap-1 p-4 pb-0">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start pr-8 md:pr-12">

                  {/* Title Section */}
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-xl md:text-2xl font-pixelify text-[#e6b689] uppercase tracking-widest drop-shadow-[2px_2px_0_rgba(0,0,0,1)] leading-tight">
                      {subject.name_en}
                    </h3>
                    <div className="flex flex-wrap gap-2 md:gap-3 mt-2 items-center">
                      <Chip size="sm" radius="none" className="bg-[#e6b689] text-black font-bold h-6">
                        {subject.code}
                      </Chip>
                      <span className="text-xs md:text-sm text-zinc-500 font-bold self-center font-sans">
                        {subject.name_vi}
                      </span>
                    </div>
                  </div>

                  {/* Score Section (Responsive) */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-dashed border-zinc-200 pb-3 md:pb-0">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest md:order-2 md:mt-1">
                      Current Average
                    </span>
                    <div className={cn(
                      "text-3xl md:text-5xl font-sans font-bold tracking-widest md:order-1",
                      statusColor === 'danger' ? "text-red-500" :
                        statusColor === 'success' ? "text-emerald-500" : "text-[#e6b689]"
                    )}>
                      {totalScore > 0 ? totalScore.toFixed(1) : "0.0"}
                    </div>
                  </div>
                </div>
              </ModalHeader>

              <ModalBody>
                {/* --- MOBILE TABS (Visible only on < md) --- */}
                <div className="md:hidden px-4 pt-4 shrink-0">
                  <Tabs
                    aria-label="View options"
                    selectedKey={activeTab}
                    onSelectionChange={(key) => setActiveTab(key as "grades" | "syllabus")}
                    variant="underlined"
                    color="warning"
                    fullWidth
                    classNames={{
                      tabList: "border-b border-zinc-200 p-0 gap-0",
                      cursor: "bg-[#e6b689] h-[3px]",
                      tab: "h-10 data-[hover=true]:opacity-100",
                      tabContent: "font-bold text-zinc-400 group-data-[selected=true]:text-[#d97706] uppercase tracking-wider text-xs"
                    }}
                  >
                    <Tab key="grades" title="Grades" />
                    <Tab key="syllabus" title="Syllabus" />
                  </Tabs>
                </div>

                <div className="flex flex-col md:flex-row gap-6 h-full p-4 md:p-6 overflow-hidden">

                  {/* --- LEFT: SYLLABUS --- */}
                  <div className={cn(
                    "h-full overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    // Desktop Styles (md:)
                    "md:block md:border-r-2 md:border-zinc-100 md:pr-6",
                    showSyllabus ? "md:w-1/3 md:min-w-75 md:opacity-100" : "md:w-0 md:min-w-0 md:pr-0 md:border-none md:opacity-0",
                    // Mobile Styles
                    activeTab === "syllabus" ? "block w-full opacity-100" : "hidden"
                  )}>
                    <SyllabusColumn subject={subject} sortedPlans={sortedPlans} grades={grades} />
                  </div>

                  {/* --- RIGHT: GRADES CALCULATOR --- */}
                  <div className={cn(
                    "h-full flex flex-col overflow-hidden",
                    // Desktop Styles (md:)
                    "md:flex md:flex-1",
                    // Mobile Styles
                    activeTab === "grades" ? "flex w-full" : "hidden"
                  )}>

                    {/* Header showing on Desktop when split view is active */}
                    <div className={cn(
                      "mb-4 text-[#e6b689] font-mono text-xs font-bold tracking-widest uppercase shrink-0 border-b-2 border-zinc-100 pb-2 animate-appearance-in",
                      (showSyllabus || activeTab === "grades") ? "block" : "hidden md:hidden"
                    )}>
                      Grade Calculator
                    </div>

                    <ScrollShadow
                      hideScrollBar
                      className="h-full w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    >
                      <div className="grid grid-cols-1 gap-6 pb-20 pt-2">
                        {sortedPlans.map((plan, catIdx) => {
                          const { isMet, isPending } = checkCondition(grades[plan.category] || [], plan.completion_criteria);
                          const shouldShowCriteria = !isMet;

                          return (
                            <div key={catIdx}>
                              <div className="flex justify-between items-end mb-2 border-b border-zinc-100 pb-1">
                                <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">{plan.category}</span>

                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-mono font-bold text-[#d97706]">WEIGHT: {plan.weight_percent}%</span>
                                  {shouldShowCriteria && plan.completion_criteria && (
                                    <span className={cn(
                                      "text-[9px] font-mono font-bold px-1.5 rounded border",
                                      isPending
                                        ? "bg-zinc-100 text-zinc-400 border-zinc-200"
                                        : "bg-red-50 text-red-500 border-red-200"
                                    )}>
                                      REQ {plan.completion_criteria}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(plan.part_count, 5)}, 1fr)` }}>
                                {Array.from({ length: plan.part_count }).map((_, partIdx) => (
                                  <Input
                                    key={partIdx}
                                    placeholder={isEditing ? `#${partIdx + 1}` : "-"}
                                    labelPlacement="outside"
                                    type="number"
                                    step="any"
                                    min={0} max={10}
                                    isDisabled={!isEditing}
                                    variant="bordered"
                                    radius="none"
                                    size="md"
                                    value={grades[plan.category]?.[partIdx] ?? ""}
                                    onValueChange={(val) => handleInputChange(plan.category, partIdx, val)}
                                    classNames={{
                                      input: cn(
                                        "text-center font-bold font-sans text-base transition-colors",
                                        "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                                        grades[plan.category]?.[partIdx] !== undefined && parseFloat(grades[plan.category]?.[partIdx] || "0") < 5 ? "text-red-500" :
                                          grades[plan.category]?.[partIdx] !== undefined && parseFloat(grades[plan.category]?.[partIdx] || "0") >= 8 ? "text-emerald-600" :
                                            "text-zinc-800 dark:text-zinc-200",
                                        !isEditing && !grades[plan.category]?.[partIdx] ? "text-zinc-300 dark:text-zinc-600" : ""
                                      ),
                                      inputWrapper: cn(
                                        "transition-all duration-200 h-10 min-h-10 shadow-none",
                                        isEditing ? [
                                          "bg-white", "border-2 border-zinc-200",
                                          "data-[hover=true]:border-[#e6b689]",
                                          "group-data-[focus=true]:!border-[#e6b689]",
                                          "group-data-[focus=true]:translate-x-[1px]", "group-data-[focus=true]:translate-y-[1px]",
                                        ] : [
                                          "bg-zinc-50/50", "border-2 border-zinc-200", "!cursor-default",
                                          "group-data-[focus=true]:border-transparent"
                                        ]
                                      )
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollShadow>
                  </div>
                </div>
              </ModalBody>

              <ModalFooter className="justify-between items-center gap-6">
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-400 mb-2 tracking-widest">
                    <span>Completion Progress</span>
                    <span className="text-[#e6b689]">{currentWeight.toFixed(0)}% / 100%</span>
                  </div>
                  <Progress
                    size="md"
                    radius="none"
                    value={currentWeight}
                    classNames={{
                      indicator: "bg-[#e6b689]",
                      track: "bg-zinc-100 border border-zinc-200 h-3"
                    }}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    className={cn(
                      "font-sans font-bold uppercase tracking-widest border-2 border-black shadow-pixel hover:shadow-pixel-hover active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all",
                      "hidden md:flex",
                      showSyllabus ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-500" : "bg-white dark:bg-zinc-800 text-black dark:text-white"
                    )}
                    radius="none"
                    onPress={() => setShowSyllabus(!showSyllabus)}
                  >
                    {showSyllabus ? "HIDE SYLLABUS" : "VIEW SYLLABUS"}
                  </Button>

                  <Button
                    className={cn(
                      "font-sans font-bold uppercase tracking-widest border-2 border-black transition-all shadow-pixel hover:shadow-pixel-hover active:translate-y-[2px] active:translate-x-[2px] active:shadow-none min-w-35",
                      isEditing ? "bg-emerald-400 text-black hover:bg-emerald-300" : "bg-[#e6b689] text-black hover:bg-[#d4a373]"
                    )}
                    radius="none"
                    isLoading={isSaving}
                    startContent={!isSaving && (isEditing ? <i className="hn hn-check-circle-fill text-lg" /> : <i className="hn hn-edit text-lg" />)}
                    onPress={handleSave}
                  >
                    {isEditing ? "SAVE GRADES" : "EDIT GRADES"}
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};