"use client";

import React, { useState, useMemo } from "react";
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
  cn
} from "@heroui/react";

// --- IMPORTS MỚI ---
import { SubjectRow } from "@/components/grade/Subject"; 
import { MOCK_SUBJECTS } from "@/data/mock-curriculum";

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

type Season = "Spring" | "Summer" | "Fall";

const generateSemesters = (startSeason: Season, startYear: number, count: number = 9) => {
  const seasons: Season[] = ["Spring", "Summer", "Fall"];
  let currentSeasonIndex = seasons.indexOf(startSeason);
  let currentYear = startYear;
  const result = [];

  for (let i = 1; i <= count; i++) {
    const seasonName = seasons[currentSeasonIndex];
    result.push({
      key: `sem_${i}`,
      label: `Semester ${i} (${seasonName} ${currentYear})`,
      shortLabel: `${seasonName} ${currentYear}`,
      semesterIndex: i
    });

    currentSeasonIndex++;
    if (currentSeasonIndex >= 3) {
      currentSeasonIndex = 0;
      currentYear++;
    }
  }
  return result;
};

const semesterMapping: Record<string, { key: string; label: string; startSeason: Season; startYear: number }[]> = {
  se: [
    {
      key: "BIT_SE_K19D_K20A",
      label: "BIT_SE_K19D_K20A",
      startSeason: "Spring",
      startYear: 2025
    },
  ],
};

export default function GradePage() {
  const { user } = useAuth();

  // --- LOGIC: State Management ---
  const [isEditing, setIsEditing] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false); // State cho mobile dropdown

  const [selectedBlockKeys, setSelectedBlockKeys] = useState<Selection>(new Set(["it_block"]));
  const [selectedProgramKeys, setSelectedProgramKeys] = useState<Selection>(new Set(["se"]));
  const [selectedClassKeys, setSelectedClassKeys] = useState<Selection>(new Set(["BIT_SE_K19D_K20A"]));
  const [selectedCurrentTermKeys, setSelectedCurrentTermKeys] = useState<Selection>(new Set(["sem_1"]));

  // --- MEMOIZED VALUES ---
  const getSingleKey = (selection: Selection): string | undefined => {
    if (selection === "all") return undefined;
    return Array.from(selection)[0] as string | undefined;
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
    if (!currentProgramKey) return [];
    return semesterMapping[currentProgramKey] || [];
  }, [currentProgramKey]);

  const generatedTerms = useMemo(() => {
    if (!currentClassKey || !currentProgramKey) return [];
    const classInfo = semesterMapping[currentProgramKey].find(c => c.key === currentClassKey);
    if (classInfo) {
      return generateSemesters(classInfo.startSeason, classInfo.startYear, 9);
    }
    return [];
  }, [currentClassKey, currentProgramKey]);

  const currentTermLabel = useMemo(() => {
    const term = generatedTerms.find(t => t.key === currentTermKey);
    return term ? term.shortLabel : "---";
  }, [currentTermKey, generatedTerms]);

  const currentSubjects = useMemo(() => {
    if (!currentTermKey) return [];
    const parts = currentTermKey.split('_'); 
    if (parts.length < 2) return [];
    const termIndex = parseInt(parts[1]);
    return MOCK_SUBJECTS.filter(s => s.semester === termIndex);
  }, [currentTermKey]);

  // --- HANDLERS ---
  const handleBlockChange = (keys: Selection) => {
    setSelectedBlockKeys(keys);
    setSelectedProgramKeys(new Set([]));
    setSelectedClassKeys(new Set([]));
    setSelectedCurrentTermKeys(new Set([]));
  };

  const handleProgramChange = (keys: Selection) => {
    setSelectedProgramKeys(keys);
    setSelectedClassKeys(new Set([]));
    setSelectedCurrentTermKeys(new Set([]));
  };

  const handleClassChange = (keys: Selection) => {
    setSelectedClassKeys(keys);
    setSelectedCurrentTermKeys(new Set(["sem_1"]));
  };

  // --- STYLES ---
  const commonSelectStyles = {
    trigger: "border-zinc-600 data-[hover=true]:border-[#e6b689] dark:data-[hover=true]:border-[#9d744d] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] transition-all duration-150 data-[open=true]:translate-x-[2px] data-[open=true]:translate-y-[2px] data-[open=true]:shadow-none data-[open=true]:border-[#e6b689]",
    label: "text-zinc-500 uppercase tracking-wider text-[12px]",
    value: "font-bold text-zinc-300",
    popoverContent: "rounded-none border-2 border-[#e6b689] mx-[2px] data-[selected=true]:bg-zinc-800 data-[selected=true]:text-[#e6b689] data-[selected=true]:font-bold",
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
        "data-[hover=true]:!bg-[#e6b689]", "data-[hover=true]:!text-zinc-900",
        "data-[selected=true]:!bg-[#e6b689]", "data-[selected=true]:!text-zinc-900", "data-[selected=true]:font-bold",
        "data-[focus=true]:!bg-[#e6b689]", "data-[focus=true]:!text-zinc-900",
      ].join(" "),
    },
  };

  const buttonStyles = "bg-[#e6b689] dark:bg-[#9d744d] text-white border-2 border-transparent font-black min-w-10 h-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none transition-all";

  return (
    // CHANGE 1: h-auto cho mobile, md:h-screen cho desktop
    <div className="flex flex-col gap-3 h-auto md:h-screen transition-colors duration-300 rounded-xl pb-10 md:pb-0">

      {/* HEADER & FILTERS */}
      {/* CHANGE 2: relative cho mobile (scroll được), sticky top-0 cho desktop */}
      <div className="w-full relative md:sticky md:top-0 z-20 flex flex-col md:flex-row gap-3 shrink-0">

        {/* SECTION 1: HEADER */}
        <section className="w-full md:w-auto">
          <Card className="h-full dark:bg-[#18181b] border-t-0 border-x-0 border-b-2 border-b-[#e6b689] dark:border-b-[#9d744d] rounded-xl overflow-hidden relative shadow-none dark:border-x dark:border-y dark:border-divider">
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[radial-gradient(#71717a_1px,transparent_1px)] bg-size-[16px_16px]" />
            <CardHeader className="relative z-10 flex flex-col items-start px-5 py-4 md:px-6 md:py-5 h-full justify-between">
              
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-0">
                <i className="hn hn-chart-line text-retro-orange text-[28px] md:text-[32px]" />
                <h1 className="text-3xl md:text-4xl font-black text-retro-orange dark:text-white uppercase tracking-wide [text-shadow:2px_2px_0_#c47c16] md:[text-shadow:3px_3px_0_#c47c16] whitespace-nowrap">
                  Grade Tracker
                </h1>
              </div>

              <div className="flex flex-row justify-between items-end w-full md:w-auto gap-4 md:gap-8">
                <div className="flex flex-col gap-1 text-[11px] md:text-xs font-bold tracking-widest uppercase font-mono">
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-500"><i className="hn hn-user mr-1" />Player:</span>
                    <span className="text-zinc-900 dark:text-zinc-200 truncate max-w-37.5 sm:max-w-none">{user?.fullName ? user?.fullName : user?.username}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-500"><i className="hn hn-calendar mr-1" />Term:</span>
                    <span className="text-retro-orange">{currentTermLabel}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-[9px] md:text-[10px] font-bold text-zinc-500 tracking-widest uppercase mb-0">Current GPA</p>
                  <div className="flex items-baseline">
                    <span className="text-3xl md:text-4xl font-black text-retro-orange leading-none">3.4</span>
                    <span className="text-sm md:text-xl font-bold text-zinc-600 ml-1">/4.0</span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </section>

        {/* SECTION 2: FILTERS */}
        <section className="w-full md:flex-1">
          <Card className="h-full dark:bg-[#18181b] border-t-0 border-x-0 border-b-2 border-b-[#e6b689] dark:border-b-[#9d744d] rounded-xl overflow-hidden relative shadow-none dark:border-x dark:border-y dark:border-divider">
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[radial-gradient(#71717a_1px,transparent_1px)] bg-size-[10px_10px]" />
            <CardBody className="relative z-10 px-4 py-4 md:px-6 md:py-6 h-full justify-center">
              
              <div className="flex flex-col gap-4 justify-between items-center w-full">
                
                {/* MOBILE TOGGLE HEADER */}
                <div 
                  className="flex md:hidden w-full justify-between items-center cursor-pointer select-none"
                  onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                >
                    <div className="flex items-center gap-2 text-[#e6b689] font-black uppercase tracking-widest">
                        <i className="hn hn-filter" />
                        <span>Filter Configuration</span>
                    </div>
                    <i className={cn("hn text-xl transition-transform duration-300", isMobileFilterOpen ? "hn-caret-up" : "hn-caret-down")} />
                </div>

                {/* FILTER GRID - Hidden on mobile unless open, visible on desktop */}
                <div className={cn(
                    "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full md:-mt-2 transition-all duration-300",
                    isMobileFilterOpen ? "block opacity-100" : "hidden md:grid opacity-100"
                )}>
                  <Select
                    isDisabled={!isEditing}
                    labelPlacement="outside"
                    label="1. Major Block"
                    placeholder="Select block"
                    variant="bordered"
                    size="md"
                    radius="none"
                    selectedKeys={selectedBlockKeys}
                    onSelectionChange={handleBlockChange}
                    classNames={getSelectStyles(!isEditing)}
                    listboxProps={commonListboxProps}
                  >
                    {majorGroups.map((group) => (
                      <SelectItem key={group.key}>{group.label}</SelectItem>
                    ))}
                  </Select>

                  <Select
                    isDisabled={!isEditing || !currentBlockKey}
                    labelPlacement="outside"
                    label="2. Program"
                    placeholder={currentBlockKey ? "Select program" : "Select block first"}
                    variant="bordered"
                    size="md"
                    radius="none"
                    selectedKeys={selectedProgramKeys}
                    onSelectionChange={handleProgramChange}
                    classNames={getSelectStyles(!isEditing || !currentBlockKey)}
                    listboxProps={commonListboxProps}
                  >
                    {availablePrograms.map((major) => (
                      <SelectItem key={major.key}>{major.label}</SelectItem>
                    ))}
                  </Select>

                  <Select
                    isDisabled={!isEditing || !currentProgramKey}
                    labelPlacement="outside"
                    label="3. Cohort / Class"
                    placeholder={!currentProgramKey ? "Select program first" : "Select class"}
                    variant="bordered"
                    size="md"
                    radius="none"
                    selectedKeys={selectedClassKeys}
                    onSelectionChange={handleClassChange}
                    classNames={getSelectStyles(!isEditing || !currentProgramKey)}
                    listboxProps={commonListboxProps}
                  >
                    {availableClasses.map((cls) => (
                      <SelectItem key={cls.key}>{cls.label}</SelectItem>
                    ))}
                  </Select>

                  <Select
                    isDisabled={!currentClassKey}
                    labelPlacement="outside"
                    label="4. Current Term"
                    classNames={getSelectStyles(!currentClassKey)}
                    placeholder={!currentClassKey ? "Select class first" : "Select current term"}
                    variant="bordered"
                    size="md"
                    radius="none"
                    selectedKeys={selectedCurrentTermKeys}
                    onSelectionChange={setSelectedCurrentTermKeys}
                    listboxProps={commonListboxProps}
                  >
                    {generatedTerms.map((term) => (
                      <SelectItem key={term.key} textValue={term.label}>
                        <div className="flex flex-col">
                          <span className="font-bold">{term.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <div className="flex gap-2 w-full justify-end mt-2 md:mt-0">
                  <Input
                    classNames={{
                      inputWrapper: [
                        "bg-transparent", "border-zinc-600", "rounded-none",
                        "shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]", "h-[40px]",
                        "transition-all duration-150",
                        "data-[hover=true]:border-[#e6b689]", "data-[focus=true]:!border-[#e6b689]",
                        "data-[focus=true]:translate-x-[2px]", "data-[focus=true]:translate-y-[2px]",
                        "data-[focus=true]:shadow-none", "group-data-[focus=true]:bg-transparent",
                      ].join(" "),
                      input: "font-bold font-mono text-zinc-700 placeholder:text-zinc-400",
                    }}
                    isClearable
                    placeholder="SEARCH..."
                    size="sm"
                    radius="none"
                    variant="bordered"
                    startContent={<i className="hn hn-search" />}
                  />
                  {/* Ẩn nút filter trên mobile vì đã có toggle ở trên, hoặc giữ lại tùy ý */}
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
        <Card className="flex-1 h-full dark:bg-[#18181b] border-t-0 border-x-0 border-b-2 border-b-[#e6b689] dark:border-b-[#9d744d] rounded-xl overflow-hidden relative shadow-none dark:border-x dark:border-y dark:border-divider">
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[radial-gradient(#71717a_1px,transparent_1px)] bg-size-[10px_10px]" />
          <div className="z-20 flex justify-between px-4 py-3 border-b border-divider text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              <div>Subject Info</div>
              <div className="pr-4">Status / Score</div>
          </div>

          <div className="absolute inset-0 z-0 opacity-5 pointer-events-none bg-[radial-gradient(#e6b689_1px,transparent_1px)] bg-size-[20px_20px]" />
          
          <CardBody className="relative z-10 p-0 h-full overflow-visible md:overflow-hidden">
            {!currentTermKey ? (
               <div className="h-full flex items-center justify-center text-zinc-600 font-mono text-sm py-10 md:py-0">
                  <div className="text-center">
                    <i className="hn hn-cursor-click text-4xl mb-2 opacity-50" />
                    <p>Select a Term to begin.</p>
                  </div>
               </div>
            ) : currentSubjects.length === 0 ? (
               <div className="h-full flex items-center justify-center text-zinc-600 font-mono text-sm py-10 md:py-0">
                  <div className="text-center">
                    <i className="hn hn-folder-open text-4xl mb-2 opacity-50" />
                    <p>No data found.</p>
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
                        <SubjectRow key={sub.code} subject={sub} />
                      ))}
                    </div>
                    {/* Spacer cho mobile scroll */}
                    <div className="h-10" /> 
                 </div>

                 <ScrollShadow className="hidden md:block w-full h-full">
                    <div className="flex flex-col">
                      {currentSubjects.map((sub) => (
                        <SubjectRow key={sub.code} subject={sub} />
                      ))}
                    </div>
                    <div className="h-20" /> 
                 </ScrollShadow>
               </>
            )}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}