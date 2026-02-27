"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/providers/auth.provider";
import { useCurriculumPrograms, useCurriculumSemesters } from "@/hooks/useCurriculum";
import { useUserCurriculum } from "@/hooks/useUserCurriculum";
import { useLanguage } from "@/providers/language.provider";
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
import { useTranslation } from "@/i18n";

// --- DATA DEFINITIONS ---
const getMajorGroups = (t: any) => [
    {
        key: "it_block",
        label: t('majors.it_block'),
        items: [
            { key: "it", label: t('majors.it') },
            { key: "se", label: t('majors.se') },
            { key: "ai", label: t('majors.ai') },
            { key: "is", label: t('majors.is') },
            { key: "gd", label: t('majors.gd') },
        ]
    },
    {
        key: "comm_block",
        label: t('majors.comm_block'),
        items: [{ key: "multi", label: t('majors.multi') }]
    },
];

export default function ProfilePage() {
    const { user } = useAuth();
    const { language, setLanguage } = useLanguage();
    const { t } = useTranslation();
    const majorGroups = useMemo(() => getMajorGroups(t), [t]);

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
        trigger: "border-zinc-600 data-[hover=true]:border-[#e6b689] shadow-pixel transition-all duration-150 data-[open=true]:translate-x-[4px] data-[open=true]:translate-y-[4px] data-[open=true]:shadow-none data-[open=true]:border-[#e6b689] font-jersey10 rounded-none",
        label: "text-zinc-500 uppercase tracking-widest text-sm font-jersey10 mb-1",
        value: "font-jersey10 text-xl text-zinc-300",
        popoverContent: "rounded-none border-2 border-[#e6b689] mx-[2px] data-[selected=true]:bg-zinc-800 data-[selected=true]:text-[#e6b689] data-[selected=true]:font-jersey10",
    };

    const getSelectStyles = (disabled: boolean) => ({
        ...commonSelectStyles,
        trigger: `${commonSelectStyles.trigger} ${disabled ? "opacity-30 cursor-not-allowed shadow-none border-zinc-800 pointer-events-none" : ""}`,
    });

    const commonListboxProps = {
        itemClasses: {
            base: [
                "rounded-none", "text-zinc-500", "transition-colors", "outline-none", "font-jersey10", "text-xl",
                "data-[focus-visible=true]:ring-0", "data-[focus-visible=true]:ring-offset-0",
                "data-[hover=true]:!bg-[#e6b689]", "data-[hover=true]:!text-zinc-900",
                "data-[selected=true]:!bg-[#e6b689]", "data-[selected=true]:!text-zinc-900",
                "data-[focus=true]:!bg-[#e6b689]", "data-[focus=true]:!text-zinc-900",
            ].join(" "),
        },
    };

    const buttonStyles = "bg-[#e6b689] text-black border-2 border-black font-jersey10 text-xl uppercase tracking-widest px-8 shadow-pixel hover:bg-[#d4a373] hover:translate-x-[2px] hover:translate-y-[2px] transition-all hover:shadow-pixel-hover active:translate-x-[4px] active:translate-y-[4px] active:shadow-none";

    return (
        <div className="flex flex-col gap-6 pr-2 pb-2 mx-auto w-full text-white font-jersey10 overflow-auto">
            {/* HEADER */}
            <div className="flex flex-col gap-2">
                <h1 className="text-5xl font-jersey10 text-[#e6b689] uppercase tracking-wider [text-shadow:3px_3px_0_#000]">
                    {t('profile.title')}
                </h1>
                <p className="text-zinc-500 font-jersey10 text-xl tracking-widest uppercase">{t('profile.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-8">
                    {/* LEFT: IDENTITY CARD */}
                    <Card className="bg-zinc-100 dark:bg-zinc-900 border-4 border-black shadow-[8px_8px_0_#000] rounded-none overflow-visible w-full">
                        <div className="p-4 border-b-4 border-black bg-[#e6b689] text-black">
                            <h2 className="text-2xl font-jersey10 uppercase tracking-widest flex items-center gap-2">
                                <i className="hn hn-user" /> {t('profile.identity')}
                            </h2>
                        </div>
                        <CardBody className="p-6 flex flex-col gap-5">
                            <div className="flex items-center gap-4 border-b-2 border-zinc-200 dark:border-zinc-800 pb-5">
                                <div className="w-16 h-16 bg-zinc-800 border-2 border-[#e6b689] flex items-center justify-center rounded-none shadow-[2px_2px_0_#e6b689]">
                                    <span className="font-jersey10 text-4xl text-[#e6b689]">{(user?.fullName || user?.username || "?")?.charAt(0).toUpperCase()}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-jersey10 text-3xl text-black dark:text-white uppercase tracking-wider">{user?.fullName || user?.username}</span>
                                    <span className="font-jersey10 text-xl text-zinc-500 uppercase tracking-widest">{user?.roles?.join(', ') || t('general.no_roles')}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-jersey10 text-zinc-500 tracking-widest uppercase">{t('profile.email')}</label>
                                <div className="font-jersey10 text-xl bg-zinc-200 dark:bg-zinc-800 p-3 border-2 border-black text-black dark:text-zinc-200">
                                    {user?.email}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-jersey10 text-zinc-500 tracking-widest uppercase">{t('profile.username')}</label>
                                <div className="font-jersey10 text-xl bg-zinc-200 dark:bg-zinc-800 p-3 border-2 border-black text-black dark:text-zinc-200">
                                    {user?.username}
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* LANGUAGE PREFERENCES CARD */}
                    <Card className="bg-zinc-100 dark:bg-zinc-900 border-4 border-black shadow-[8px_8px_0_#000] rounded-none overflow-visible w-full">
                        <div className="p-4 border-b-4 border-black bg-[#f43f5e] text-white">
                            <h2 className="text-2xl font-jersey10 uppercase tracking-widest flex items-center gap-2">
                                <i className="hn hn-globe" /> {t('profile.language_settings')}
                            </h2>
                        </div>
                        <CardBody className="p-6 flex flex-col gap-5">
                            <Select
                                labelPlacement="outside"
                                label={t('profile.app_language')}
                                placeholder={t('profile.select_language')}
                                variant="bordered"
                                size="md"
                                radius="none"
                                selectedKeys={new Set([language])}
                                onSelectionChange={(keys) => {
                                    const selected = Array.from(keys)[0] as "en" | "vi";
                                    if (selected) setLanguage(selected);
                                }}
                                classNames={commonSelectStyles}
                                listboxProps={commonListboxProps}
                            >
                                <SelectItem key="en" textValue={t('profile.english_default')}>
                                    <div className="flex flex-col">
                                        <span className="font-jersey10 text-xl">{t('profile.english_default')}</span>
                                    </div>
                                </SelectItem>
                                <SelectItem key="vi" textValue={t('profile.vietnamese_sans')}>
                                    <div className="flex flex-col">
                                        <span className="font-jersey10 text-xl">{t('profile.vietnamese_sans')}</span>
                                    </div>
                                </SelectItem>
                            </Select>
                        </CardBody>
                    </Card>
                </div>

                {/* RIGHT: ACADEMIC CONTEXT FORM */}
                <Card className="bg-zinc-100 dark:bg-zinc-900 border-4 border-black shadow-[8px_8px_0_#000] rounded-none overflow-visible w-full">
                    <div className="p-4 border-b-4 border-black bg-[#3b82f6] text-black">
                        <h2 className="text-2xl font-jersey10 uppercase tracking-widest flex items-center gap-2 text-white">
                            <i className="hn hn-graduation-cap" /> {t('profile.academic_context')}
                        </h2>
                    </div>
                    <CardBody className="p-6 flex flex-col gap-6 relative">
                        {isContextLoading ? (
                            <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm z-20 flex items-center justify-center">
                                <div className="font-jersey10 text-3xl uppercase tracking-widest text-[#e6b689] animate-pulse">{t('profile.loading_profile')}</div>
                            </div>
                        ) : null}

                        <div className="flex flex-col gap-4">
                            <Select
                                labelPlacement="outside"
                                label={t('profile.major_block')}
                                placeholder={t('profile.select_block')}
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
                                label={t('profile.program')}
                                placeholder={editContext.block ? t('profile.select_program') : t('profile.select_block_first')}
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
                                label={t('profile.cohort_class')}
                                placeholder={!editContext.program ? t('profile.select_program_first') : t('profile.select_class')}
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
                                label={t('profile.current_term')}
                                classNames={getSelectStyles(!editContext.cohort_class)}
                                placeholder={!editContext.cohort_class ? t('profile.select_class_first') : t('profile.select_term')}
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
                                            <span className="font-jersey10 text-xl">{term.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>

                        {/* NOTIFICATION TEXT */}
                        {saveSuccess && (
                            <div className="bg-[#10b981] text-black border-2 border-black p-2 font-jersey10 text-lg uppercase tracking-widest shadow-pixel">
                                {t('profile.save_success')}
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
                                {isSaving ? t('profile.saving') : t('profile.save_profile')}
                            </Button>
                        </div>

                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
