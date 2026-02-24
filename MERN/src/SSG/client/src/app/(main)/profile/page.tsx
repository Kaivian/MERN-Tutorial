"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/providers/auth.provider";
import { useCurriculumPrograms, useCurriculumSemesters } from "@/hooks/useCurriculum";
import { useUserCurriculum } from "@/hooks/useUserCurriculum";
import {
    Card,
    CardHeader,
    CardBody,
    Select,
    SelectItem,
    Button,
    Selection,
    Input,
    cn
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

export default function ProfilePage() {
    const { user } = useAuth();

    // Local state for editing form before saving
    const [editContext, setEditContext] = useState({
        block: null as string | null,
        program: null as string | null,
        cohort_class: null as string | null,
        term: null as string | null,
    });

    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // --- API DATA FETCHING ---
    const { data: programsData } = useCurriculumPrograms();
    const { data: userCurriculum, updateContext, isLoading: isContextLoading } = useUserCurriculum();

    // Load existing context into editable state
    useEffect(() => {
        if (userCurriculum?.active_context) {
            setEditContext({
                block: userCurriculum.active_context.block || null,
                program: userCurriculum.active_context.program || null,
                cohort_class: userCurriculum.active_context.cohort_class || null,
                term: userCurriculum.active_context.term || null,
            });
        }
    }, [userCurriculum]);

    // Handle Selections
    const selectedBlockKeys = useMemo(() => new Set(editContext.block ? [editContext.block] : []), [editContext.block]);
    const selectedProgramKeys = useMemo(() => new Set(editContext.program ? [editContext.program] : []), [editContext.program]);
    const selectedClassKeys = useMemo(() => new Set(editContext.cohort_class ? [editContext.cohort_class] : []), [editContext.cohort_class]);
    const selectedTermKeys = useMemo(() => new Set(editContext.term ? [editContext.term] : []), [editContext.term]);

    const getSingleKey = (selection: Selection): string | null => {
        if (selection === "all") return null;
        return (Array.from(selection)[0] as string) || null;
    };

    const handleBlockChange = (keys: Selection) => {
        setEditContext({
            block: getSingleKey(keys),
            program: null,
            cohort_class: null,
            term: null
        });
        setSaveSuccess(false);
    };

    const handleProgramChange = (keys: Selection) => {
        setEditContext(prev => ({
            ...prev,
            program: getSingleKey(keys),
            cohort_class: null,
            term: null
        }));
        setSaveSuccess(false);
    };

    const handleClassChange = (keys: Selection) => {
        setEditContext(prev => ({
            ...prev,
            cohort_class: getSingleKey(keys),
            term: "sem_1"
        }));
        setSaveSuccess(false);
    };

    const handleTermChange = (keys: Selection) => {
        setEditContext(prev => ({
            ...prev,
            term: getSingleKey(keys)
        }));
        setSaveSuccess(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        await updateContext(editContext);
        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    // Derivative Options
    const availablePrograms = useMemo(() => {
        const group = majorGroups.find((g) => g.key === editContext.block);
        return group ? group.items : [];
    }, [editContext.block]);

    const availableClasses = useMemo(() => {
        if (!editContext.program || !programsData) return [];
        const program = programsData[editContext.program];
        return program ? program.classes : [];
    }, [editContext.program, programsData]);

    const { data: generatedTerms } = useCurriculumSemesters(editContext.cohort_class || undefined);

    // STYLES
    const commonSelectStyles = {
        trigger: "border-zinc-600 data-[hover=true]:border-[#e6b689] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] transition-all duration-150 data-[open=true]:translate-x-[2px] data-[open=true]:translate-y-[2px] data-[open=true]:shadow-none data-[open=true]:border-[#e6b689]",
        label: "text-zinc-500 uppercase tracking-wider text-[12px] font-bold mb-1",
        value: "font-bold text-zinc-300",
        popoverContent: "rounded-none border-2 border-[#e6b689] mx-[2px] data-[selected=true]:bg-zinc-800 data-[selected=true]:text-[#e6b689] data-[selected=true]:font-bold",
    };

    const getSelectStyles = (disabled: boolean) => ({
        ...commonSelectStyles,
        trigger: `${commonSelectStyles.trigger} ${disabled ? "opacity-30 cursor-not-allowed shadow-none border-zinc-800 pointer-events-none" : ""}`,
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

    const buttonStyles = "bg-[#e6b689] text-black border-2 border-black font-black uppercase tracking-widest px-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#d4a373] hover:translate-x-[2px] hover:translate-y-[2px] transition-all hover:shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none";

    return (
        <div className="flex flex-col gap-6 p-4 md:p-8 max-w-5xl mx-auto w-full text-white">
            {/* HEADER */}
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black text-[#e6b689] uppercase tracking-tighter [text-shadow:3px_3px_0_#000]">
                    Profile Management
                </h1>
                <p className="text-zinc-500 font-bold tracking-wide">Configure your identity and global academic context.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* LEFT: IDENTITY CARD */}
                <Card className="bg-zinc-100 dark:bg-zinc-900 border-4 border-black shadow-[8px_8px_0_#000] rounded-none overflow-visible w-full h-full">
                    <div className="p-4 border-b-4 border-black bg-[#e6b689] text-black">
                        <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
                            <i className="hn hn-user" /> User Identity
                        </h2>
                    </div>
                    <CardBody className="p-6 flex flex-col gap-5">
                        <div className="flex items-center gap-4 border-b-2 border-zinc-200 dark:border-zinc-800 pb-5">
                            <div className="w-16 h-16 bg-zinc-800 border-2 border-[#e6b689] flex items-center justify-center rounded-none shadow-[2px_2px_0_#e6b689]">
                                <span className="font-black text-2xl text-[#e6b689]">{(user?.fullName || user?.username || "?")?.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-xl text-black dark:text-white uppercase tracking-tight">{user?.fullName || user?.username}</span>
                                <span className="font-bold text-sm text-zinc-500">{user?.roles?.join(', ') || 'No Roles Assigned'}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-zinc-500 tracking-widest uppercase">Email Address</label>
                            <div className="font-mono bg-zinc-200 dark:bg-zinc-800 p-3 border-2 border-black text-black dark:text-zinc-200">
                                {user?.email}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-zinc-500 tracking-widest uppercase">Username</label>
                            <div className="font-mono bg-zinc-200 dark:bg-zinc-800 p-3 border-2 border-black text-black dark:text-zinc-200">
                                {user?.username}
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* RIGHT: ACADEMIC CONTEXT FORM */}
                <Card className="bg-zinc-100 dark:bg-zinc-900 border-4 border-black shadow-[8px_8px_0_#000] rounded-none overflow-visible w-full">
                    <div className="p-4 border-b-4 border-black bg-[#3b82f6] text-black">
                        <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-2 text-white">
                            <i className="hn hn-graduation-cap" /> Academic Context
                        </h2>
                    </div>
                    <CardBody className="p-6 flex flex-col gap-6 relative">
                        {isContextLoading ? (
                            <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm z-10 flex items-center justify-center">
                                <div className="font-black text-[#e6b689] animate-pulse">LOADING PROFILE...</div>
                            </div>
                        ) : null}

                        <div className="flex flex-col gap-4">
                            <Select
                                labelPlacement="outside"
                                label="1. Major Block"
                                placeholder="Select block"
                                variant="bordered"
                                size="md"
                                radius="none"
                                selectedKeys={selectedBlockKeys}
                                onSelectionChange={handleBlockChange}
                                classNames={getSelectStyles(false)}
                                listboxProps={commonListboxProps}
                            >
                                {majorGroups.map((group) => (
                                    <SelectItem key={group.key}>{group.label}</SelectItem>
                                ))}
                            </Select>

                            <Select
                                isDisabled={!editContext.block}
                                labelPlacement="outside"
                                label="2. Program"
                                placeholder={editContext.block ? "Select program" : "Select block first"}
                                variant="bordered"
                                size="md"
                                radius="none"
                                selectedKeys={selectedProgramKeys}
                                onSelectionChange={handleProgramChange}
                                classNames={getSelectStyles(!editContext.block)}
                                listboxProps={commonListboxProps}
                            >
                                {availablePrograms.map((major) => (
                                    <SelectItem key={major.key}>{major.label}</SelectItem>
                                ))}
                            </Select>

                            <Select
                                isDisabled={!editContext.program}
                                labelPlacement="outside"
                                label="3. Cohort / Class"
                                placeholder={!editContext.program ? "Select program first" : "Select class"}
                                variant="bordered"
                                size="md"
                                radius="none"
                                selectedKeys={selectedClassKeys}
                                onSelectionChange={handleClassChange}
                                classNames={getSelectStyles(!editContext.program)}
                                listboxProps={commonListboxProps}
                            >
                                {availableClasses.map((cls) => (
                                    <SelectItem key={cls.key}>{cls.label}</SelectItem>
                                ))}
                            </Select>

                            <Select
                                isDisabled={!editContext.cohort_class}
                                labelPlacement="outside"
                                label="4. Current Term"
                                classNames={getSelectStyles(!editContext.cohort_class)}
                                placeholder={!editContext.cohort_class ? "Select class first" : "Select current term"}
                                variant="bordered"
                                size="md"
                                radius="none"
                                selectedKeys={selectedTermKeys}
                                onSelectionChange={handleTermChange}
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

                        {/* NOTIFICATION TEXT */}
                        {saveSuccess && (
                            <div className="bg-[#10b981] text-black border-2 border-black p-2 font-bold uppercase tracking-wider text-xs shadow-[2px_2px_0_#000]">
                                Profile updated successfully! Grade views will now reflect this context.
                            </div>
                        )}

                        {/* SAVE BUTTON */}
                        <div className="mt-2 flex justify-end">
                            <Button
                                radius="none"
                                className={buttonStyles}
                                onClick={handleSave}
                                isLoading={isSaving}
                            >
                                {isSaving ? "Saving..." : "Save Profile"}
                            </Button>
                        </div>

                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
