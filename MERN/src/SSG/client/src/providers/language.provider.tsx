"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "en" | "vi";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("en");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Load preference from local storage on mount
        const savedLang = localStorage.getItem("app-language") as Language;
        if (savedLang && (savedLang === "en" || savedLang === "vi")) {
            setLanguageState(savedLang);
            document.documentElement.lang = savedLang;
        } else {
            document.documentElement.lang = "en"; // Default
        }
        setMounted(true);
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("app-language", lang);
        document.documentElement.lang = lang;
    };

    // We still render children safely to avoid mismatch, but since we modify html lang, it handles CSS based swap.
    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            <div style={{ display: "contents" }} data-lang-mounted={mounted ? "true" : "false"}>
                {children}
            </div>
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
