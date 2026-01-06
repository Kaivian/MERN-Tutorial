"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation"; // 1. Import hook
import Sidebar from "@/components/sidebar/Sidebar";
import PageHeader from "@/components/sidebar/PageHeader";
import { siteConfig } from "@/config/site.config"; // 2. Import config

const STORAGE_KEY = "sidebar_state";
const TABLET_BREAKPOINT = 768;

export default function AppTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 3. Get current pathname
  const pathname = usePathname();

  // 4. Calculate Page Title based on pathname and siteConfig
  const pageTitle = useMemo(() => {
    const links = Object.values(siteConfig.links);

    // Sort by path length desc to match the most specific path first
    // e.g., match "/customers/create" before "/customers"
    const sortedLinks = links.sort((a, b) => b.path.length - a.path.length);

    // Find the first link that is a prefix of the current pathname
    const activeLink = sortedLinks.find((link) =>
      pathname === link.path || pathname.startsWith(`${link.path}/`)
    );

    return activeLink ? activeLink.label : "Dashboard";
  }, [pathname]);

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
        {/* 5. Pass the calculated pageTitle here */}
        <PageHeader toggleSidebar={toggleSidebar} title={pageTitle} />

        <main className="rounded-medium border-small border-divider flex w-full flex-col gap-4 h-full overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}