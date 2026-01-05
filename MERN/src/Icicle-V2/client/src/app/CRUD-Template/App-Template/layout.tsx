"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import PageHeader from "@/components/sidebar/PageHeader";

const STORAGE_KEY = "sidebar_state";
const TABLET_BREAKPOINT = 768;

export default function AppTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    const width = window.innerWidth;

    const shouldBeOpen = width < TABLET_BREAKPOINT
      ? false
      : (savedState !== null ? savedState === "true" : true);

    setTimeout(() => {
      setIsSidebarOpen(shouldBeOpen);
      setIsMounted(true);
    }, 0);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < TABLET_BREAKPOINT) {
        setIsSidebarOpen((prev) => {
          if (prev) return false;
          return prev;
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(STORAGE_KEY, isSidebarOpen.toString());
    }
  }, [isSidebarOpen, isMounted]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar isCollapsed={!isSidebarOpen} />

      <div className="flex flex-col flex-1 min-w-0 m-4 gap-4 transition-all duration-300">
        <PageHeader toggleSidebar={toggleSidebar} title="Dashboard" />

        <main className="rounded-medium border-small border-divider flex w-full flex-col gap-4 h-full overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}