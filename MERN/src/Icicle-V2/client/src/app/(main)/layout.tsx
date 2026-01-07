// client/src/components/layout/AppTemplateLayout.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useDisclosure } from "@heroui/react";
import Sidebar from "@/components/sidebar/Sidebar";
import PageHeader from "@/components/sidebar/PageHeader";
import { siteConfig } from "@/config/site.config";

const STORAGE_KEY = "sidebar_is_collapsed";
const MOBILE_BREAKPOINT = 768;

export default function AppTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  // Hook quản lý trạng thái Mobile Drawer
  const { 
    isOpen: isMobileOpen, 
    onOpenChange: setMobileOpen, 
    onOpen: openMobile,
    onClose: closeMobile // Lấy thêm hàm close để dùng khi resize
  } = useDisclosure();

  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // ... (Giữ nguyên phần logic pageTitle) ...
  const pageTitle = useMemo(() => {
    const links = Object.values(siteConfig.links);
    const sortedLinks = links.sort((a, b) => b.path.length - a.path.length);
    const activeLink = sortedLinks.find((link) =>
      pathname === link.path || pathname.startsWith(`${link.path}/`)
    );
    return activeLink ? activeLink.label : "Dashboard";
  }, [pathname]);

  // --- LOGIC QUAN TRỌNG ĐỂ FIX LỖI ---
  useEffect(() => {
    // 1. Load saved state
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState !== null) {
      setIsDesktopCollapsed(savedState === "true");
    }

    // 2. Hàm check resize
    const handleResize = () => {
      const width = window.innerWidth;
      const isNowMobile = width < MOBILE_BREAKPOINT;
      
      setIsMobile(isNowMobile);

      // FIX: Nếu màn hình lớn hơn breakpoint (Desktop) -> BẮT BUỘC đóng Drawer
      if (!isNowMobile) {
        closeMobile(); 
      }
    };

    // Chạy lần đầu
    handleResize();
    setIsMounted(true);

    // Lắng nghe sự kiện
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [closeMobile]); // Thêm dependency closeMobile

  // ... (Giữ nguyên phần useEffect save localStorage) ...
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(STORAGE_KEY, isDesktopCollapsed.toString());
    }
  }, [isDesktopCollapsed, isMounted]);

  const handleToggle = () => {
    if (isMobile) {
      openMobile();
    } else {
      setIsDesktopCollapsed((prev) => !prev);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background transition-colors duration-300">
      <Sidebar 
        isCollapsed={isDesktopCollapsed} 
        isMobileOpen={isMobileOpen}
        onMobileChange={setMobileOpen}
      />

      <div className="flex flex-col flex-1 min-w-0 m-2 xl:m-3 2xl:m-4 gap-2 xl:gap-3 2xl:gap-4">
        <PageHeader toggleSidebar={handleToggle} title={pageTitle} />
        <main className="rounded-medium border-small border-divider flex w-full flex-col h-full overflow-auto bg-background/50">
          {children}
        </main>
      </div>
    </div>
  );
}