"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useDisclosure } from "@heroui/react";
import Sidebar from "@/components/sidebar/Sidebar";
import PageHeader from "@/components/sidebar/PageHeader";
import { siteConfig, ROUTES_CONFIG } from "@/config/site.config";
import { useAuth } from "@/providers/auth-provider";
import AccessDenied from "@/components/errors/AccessDenied";

const STORAGE_KEY = "sidebar_is_collapsed";
const MOBILE_BREAKPOINT = 768;

export default function AppTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const { 
    isOpen: isMobileOpen, 
    onOpenChange: setMobileOpen, 
    onOpen: openMobile,
    onClose: closeMobile 
  } = useDisclosure();
  const [isMobile, setIsMobile] = useState(false);
  
  const pathname = usePathname();
  const { checkAllPermissions, isAuthenticated } = useAuth();

  const activeRoute = useMemo(() => {
    return ROUTES_CONFIG.find(route => 
      pathname === route.path || pathname.startsWith(`${route.path}/`)
    );
  }, [pathname]);

  const pageTitle = useMemo(() => {
    const links = Object.values(siteConfig.links);
    const sortedLinks = links.sort((a, b) => b.path.length - a.path.length);
    const activeLink = sortedLinks.find((link) =>
      pathname === link.path || pathname.startsWith(`${link.path}/`)
    );
    return activeLink ? activeLink.label : "Dashboard";
  }, [pathname]);

  const hasAccess = useMemo(() => {
    if (!activeRoute) return true;

    if (activeRoute.type === 'PUBLIC') return true;
    if (activeRoute.type === 'GUEST_ONLY') return true;

    if (!isAuthenticated) return false;

    if (activeRoute.requiredPerms && activeRoute.requiredPerms.length > 0) {
      return checkAllPermissions(activeRoute.requiredPerms);
    }

    return true;
  }, [activeRoute, isAuthenticated, checkAllPermissions]);

  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState !== null) {
      setIsDesktopCollapsed(savedState === "true");
    }

    const handleResize = () => {
      const width = window.innerWidth;
      const isNowMobile = width < MOBILE_BREAKPOINT;
      
      setIsMobile(isNowMobile);

      if (!isNowMobile) {
        closeMobile(); 
      }
    };

    handleResize();
    setIsMounted(true);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [closeMobile]);

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
        
        <main className="rounded-medium border-small border-divider flex w-full flex-col h-full overflow-auto bg-background/50 relative">
          {hasAccess ? (
            children
          ) : (
            <div className="absolute inset-0 z-50 bg-background/50 backdrop-blur-md">
               <AccessDenied />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}