"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/providers/auth.provider";
import {
  Card,
  CardHeader,
  CardBody,
  Select,
  SelectItem,
  Input,
  Button,
  Selection
} from "@heroui/react";

// --- DATA DEFINITIONS ---
const majorGroups = [
  {
    key: "it_block",
    label: "INFORMATION TECHNOLOGY",
    items: [
      { key: "it", label: "Information Technology" },
      { key: "se", label: "Software Engineering" },
      { key: "ai", label: "Artificial Intelligence" },
      { key: "ads", label: "Applied Data Science" },
      { key: "ia", label: "Information Assurance" },
      { key: "semi", label: "Semiconductor Circuit" },
      { key: "auto", label: "Digital Automotive Tech" },
      { key: "is", label: "Information Systems" },
      { key: "gd", label: "Graphic Design & Digital Art" },
    ]
  },
  {
    key: "comm_block",
    label: "COMMUNICATION TECH",
    items: [
      { key: "multi", label: "Multimedia Communication" },
      { key: "pr", label: "Public Relations" },
      { key: "imc", label: "Integrated Marketing Comm" },
      { key: "brand", label: "Brand Communication" },
    ]
  },
  {
    key: "lang_block",
    label: "LANGUAGES",
    items: [
      { key: "eng", label: "English Language" },
      { key: "eng_bus", label: "Business English" },
      { key: "kor", label: "Korean Language" },
      { key: "kor_bus", label: "Business Korean" },
      { key: "chn", label: "Chinese Language" },
      { key: "chn_bus", label: "Business Chinese" },
    ]
  },
  {
    key: "law_block",
    label: "LAW",
    items: [
      { key: "law", label: "Law" },
      { key: "elaw", label: "Economic Law" },
    ]
  },
  {
    key: "biz_block",
    label: "BUSINESS ADMIN",
    items: [
      { key: "mkt", label: "Marketing" },
      { key: "ib", label: "International Business" },
      { key: "ecom", label: "E-Commerce" },
      { key: "ba", label: "Business Administration" },
      { key: "event", label: "Event & Entertainment Mgmt" },
      { key: "cx", label: "Customer Experience Mgmt" },
      { key: "purch", label: "Purchasing Management" },
      { key: "hotel", label: "Hotel Management" },
      { key: "tour", label: "Tourism & Travel Mgmt" },
      { key: "ban", label: "Business Analytics" },
      { key: "log", label: "Logistics & Supply Chain" },
      { key: "fintech", label: "Fintech" },
      { key: "cfin", label: "Corporate Finance" },
      { key: "sfin", label: "Smart Finance" },
      { key: "bank", label: "Banking & Finance" },
    ]
  },
  {
    key: "talent_block",
    label: "TALENT PROGRAMS",
    items: [
      { key: "ai_ds_t", label: "AI & Data Science (Talent)" },
      { key: "cyber_t", label: "Cybersecurity (Talent)" },
    ]
  }
];

// --- LOGIC HELPER: Sinh 9 kỳ học ---
type Season = "Spring" | "Summer" | "Fall";

const generateSemesters = (startSeason: Season, startYear: number, count: number = 9) => {
  const seasons: Season[] = ["Spring", "Summer", "Fall"];
  let currentSeasonIndex = seasons.indexOf(startSeason);
  let currentYear = startYear;
  const result = [];

  for (let i = 1; i <= count; i++) {
    const seasonName = seasons[currentSeasonIndex];
    result.push({
      key: `sem_${i}`, // Key định danh (Semester 1 -> 9)
      label: `Semester ${i} (${seasonName} ${currentYear})`, // Label hiển thị
      shortLabel: `${seasonName} ${currentYear}`, // Label ngắn cho header
      semesterIndex: i
    });

    // Tăng kỳ tiếp theo
    currentSeasonIndex++;
    if (currentSeasonIndex >= 3) {
      currentSeasonIndex = 0;
      currentYear++;
    }
  }
  return result;
};

// --- DATA MAPPING: Thêm StartDate vào Class ---
const semesterMapping: Record<string, { key: string; label: string; startSeason: Season; startYear: number }[]> = {
  se: [
    {
      key: "BIT_SE_K19D_K20A",
      label: "BIT_SE_K19D_K20A",
      startSeason: "Spring", // Bắt đầu từ Spring
      startYear: 2025        // Năm 2025
    },
  ],
};

export default function GradePage() {
  const { user } = useAuth();

  // --- LOGIC: State Management ---
  const [isEditing, setIsEditing] = useState(false);

  // Các Select chính (Cần Edit Mode)
  const [selectedBlockKeys, setSelectedBlockKeys] = useState<Selection>(new Set([]));
  const [selectedProgramKeys, setSelectedProgramKeys] = useState<Selection>(new Set([]));
  const [selectedClassKeys, setSelectedClassKeys] = useState<Selection>(new Set([])); // Đổi tên Semester -> Class cho đúng nghĩa

  // Select thứ 4 (Không cần Edit Mode, chọn kỳ đang học)
  const [selectedCurrentTermKeys, setSelectedCurrentTermKeys] = useState<Selection>(new Set([]));

  // --- MEMOIZED VALUES ---

  // Helper lấy key string
  const getSingleKey = (selection: Selection): string | undefined => {
    if (selection === "all") return undefined;
    return Array.from(selection)[0] as string | undefined;
  };

  const currentBlockKey = getSingleKey(selectedBlockKeys);
  const currentProgramKey = getSingleKey(selectedProgramKeys);
  const currentClassKey = getSingleKey(selectedClassKeys);
  const currentTermKey = getSingleKey(selectedCurrentTermKeys);

  // 1. List Programs
  const availablePrograms = useMemo(() => {
    const group = majorGroups.find((g) => g.key === currentBlockKey);
    return group ? group.items : [];
  }, [currentBlockKey]);

  // 2. List Classes (Trước đây là Semester)
  const availableClasses = useMemo(() => {
    if (!currentProgramKey) return [];
    return semesterMapping[currentProgramKey] || [];
  }, [currentProgramKey]);

  // 3. List 9 Semesters (Tính toán dựa trên Class đã chọn)
  const generatedTerms = useMemo(() => {
    if (!currentClassKey || !currentProgramKey) return [];

    // Tìm thông tin lớp học đã chọn để lấy ngày bắt đầu
    const classInfo = semesterMapping[currentProgramKey].find(c => c.key === currentClassKey);

    if (classInfo) {
      return generateSemesters(classInfo.startSeason, classInfo.startYear, 9);
    }
    return [];
  }, [currentClassKey, currentProgramKey]);

  // Lấy Label của kỳ hiện tại để hiển thị trên Header
  const currentTermLabel = useMemo(() => {
    const term = generatedTerms.find(t => t.key === currentTermKey);
    return term ? term.shortLabel : "---";
  }, [currentTermKey, generatedTerms]);

  // --- HANDLERS ---

  const handleBlockChange = (keys: Selection) => {
    setSelectedBlockKeys(keys);
    setSelectedProgramKeys(new Set([]));
    setSelectedClassKeys(new Set([]));
    setSelectedCurrentTermKeys(new Set([])); // Reset kỳ học
  };

  const handleProgramChange = (keys: Selection) => {
    setSelectedProgramKeys(keys);
    setSelectedClassKeys(new Set([]));
    setSelectedCurrentTermKeys(new Set([])); // Reset kỳ học
  };

  const handleClassChange = (keys: Selection) => {
    setSelectedClassKeys(keys);
    // Tự động chọn kỳ đầu tiên (Semester 1) khi chọn lớp xong (Optional UX Improvement)
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
    <div className="flex h-screen transition-colors duration-300 rounded-xl flex-col gap-3">

      {/* HEADER SECTION */}
      <section className="w-full">
        <Card fullWidth className="dark:bg-[#18181b] border-t-0 border-x-0 border-b-2 border-b-[#e6b689] dark:border-b-[#9d744d] rounded-xl overflow-hidden relative shadow-none dark:border-x dark:border-y dark:border-divider">
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[radial-gradient(#71717a_1px,transparent_1px)] bg-size-[16px_16px]" />
          <CardHeader className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-end px-5 py-4 md:px-6 md:py-5 gap-2 md:gap-0">
            <div className="flex flex-col w-full md:w-auto items-start">
              <div className="flex items-center gap-2 md:gap-3">
                <i className="hn hn-chart-line text-retro-orange text-[28px] md:text-[32px]" />
                <h1 className="text-3xl md:text-4xl font-black text-retro-orange dark:text-white uppercase tracking-wide [text-shadow:2px_2px_0_#c47c16] md:[text-shadow:3px_3px_0_#c47c16] whitespace-nowrap">
                  Grade Tracker
                </h1>
              </div>
              <div className="flex flex-row justify-between items-end w-full md:w-auto mt-2 md:mt-2">
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 text-[11px] md:text-xs font-bold tracking-widest uppercase font-mono">
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-500"><i className="hn hn-user mr-1 hidden md:inline-block" />Player:</span>
                    <span className="text-zinc-900 dark:text-zinc-200 truncate max-w-37.5 sm:max-w-none">{user?.fullName ? user?.fullName : user?.username}</span>
                  </div>
                  <div className="hidden md:block h-3 w-px bg-zinc-600 mx-1"></div>
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-500"><i className="hn hn-calendar mr-1 hidden md:inline-block" />Current Term:</span>
                    {/* Hiển thị kỳ học đã chọn (Ví dụ: Spring 2026) */}
                    <span className="text-retro-orange">{currentTermLabel}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end md:hidden">
                  <p className="text-[9px] font-bold text-zinc-500 tracking-widest uppercase mb-0">Current GPA</p>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-black text-retro-orange leading-none">3.4</span>
                    <span className="text-sm font-bold text-zinc-600 ml-1">/4.0</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden md:flex flex-col items-end mb-1 ml-2">
              <p className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase mb-0 text-right">Current GPA</p>
              <div className="flex items-baseline">
                <span className="text-4xl font-black text-retro-orange leading-none">3.4</span>
                <span className="text-xl font-bold text-zinc-600 ml-1">/4.0</span>
              </div>
            </div>
          </CardHeader>
        </Card>
      </section>

      {/* FILTERS SECTION */}
      <section className="w-full sticky top-0 z-20">
        <Card fullWidth className="dark:bg-[#18181b] border-t-0 border-x-0 border-b-2 border-b-[#e6b689] dark:border-b-[#9d744d] rounded-xl overflow-hidden relative shadow-none dark:border-x dark:border-y dark:border-divider">
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[radial-gradient(#71717a_1px,transparent_1px)] bg-size-[10px_10px]" />
          <CardBody className="relative z-10 px-6 py-6">
            <div className="flex flex-col gap-4 justify-between items-center w-full">

              {/* Grid 4 cột cho 4 ô Select */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full -mt-2">

                {/* 1. MAJOR BLOCK */}
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

                {/* 2. PROGRAM */}
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

                {/* 3. COHORT / CLASS */}
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

                {/* 4. CURRENT SEMESTER (MỚI THÊM) */}
                <Select
                  // Điều kiện Enable: Phải chọn xong Lớp (bước 3) thì mới được chọn Kỳ
                  isDisabled={!currentClassKey}
                  labelPlacement="outside"
                  label="4. Current Term"
                  // Style: Nếu chưa chọn lớp -> mờ đi. Nếu chọn rồi -> sáng lên (bất kể Edit Mode)
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

              <div className="flex gap-2 w-full justify-end mt-4 md:mt-0">
                <Input
                  classNames={{
                    inputWrapper: [
                      "bg-transparent",
                      "border-zinc-600",
                      "rounded-none",
                      "shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]",
                      "h-[40px]",
                      "transition-all duration-150",
                      "data-[hover=true]:border-[#e6b689]",
                      "data-[focus=true]:!border-[#e6b689]",
                      "data-[focus=true]:translate-x-[2px]",
                      "data-[focus=true]:translate-y-[2px]",
                      "data-[focus=true]:shadow-none",
                      "group-data-[focus=true]:bg-transparent",
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
                <Button isIconOnly radius="none" className={buttonStyles}>
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

      {/* CONTENT SECTION */}
      <section className="grow">
        <Card fullWidth className="h-full dark:bg-[#18181b] border-t-0 border-x-0 border-b-2 border-b-[#e6b689] dark:border-b-[#9d744d] rounded-xl overflow-hidden relative shadow-none dark:border-x dark:border-y dark:border-divider">
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[radial-gradient(#71717a_1px,transparent_1px)] bg-size-[10px_10px]" />
          <CardBody className="relative z-10 flex items-center justify-center text-zinc-600 font-mono text-sm">
            <div className="text-center">
              <i className="hn hn-folder-open text-4xl mb-2 opacity-50" />
              <p>No subjects loaded.</p>
              {isEditing && <p className="text-retro-orange mt-2 text-xs uppercase animate-pulse">-- Editing Mode --</p>}

              {/* Debug: Hiển thị kỳ đang chọn */}
              {currentTermLabel !== "---" && (
                <p className="mt-4 text-xs text-zinc-500">
                  Viewing: <span className="text-zinc-300 font-bold">{currentTermLabel}</span>
                </p>
              )}
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}