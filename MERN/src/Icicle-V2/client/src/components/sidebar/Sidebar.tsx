// client/src/components/sidebar/Sidebar.tsx
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Button,
  ButtonGroup,
  Tooltip,
  ScrollShadow,
  Divider,
  Image,
} from "@heroui/react";
import IconSwitch from "../icons/IconSwitch";
import { useSyncImage } from "@/hooks/generals/useSyncImage";

import {
  sidebarSections,
  sidebarSections2,
  SidebarItem,
} from "./SidebarData";

// --- 1. SIDEBAR FULL (OPTIMIZED FOR FHD & 2K) ---
const SidebarExpanded = () => {
  const pathname = usePathname(); // Get current path

  return (
    <div className="flex flex-col gap-3 2xl:gap-4 flex-1 overflow-hidden h-full w-full animate-[fadeIn_0.3s_ease-in-out]">

      {/* Header & User */}
      <div className="flex flex-col gap-4 pt-1 mx-2">
        <section className="flex items-center gap-3 h-15 w-full">
          <Image
            {...useSyncImage("/logo-name.png")}
            alt="logo"
          />
        </section>
      </div>

      <Divider className="bg-divider w-full" />

      {/* --- A. PRIMARY AREA (HEADER + MENU) --- */}
      <ScrollShadow className="flex flex-col gap-4 2xl:gap-6 shrink min-h-0 -mx-2 px-2" hideScrollBar>
        {/* Menu Sections */}
        <div className="flex flex-col gap-4 2xl:gap-6 pb-2">
          {/* Section 1 */}
          <section className="flex flex-col gap-1 2xl:gap-2">
            {sidebarSections.map((section) => (
              <React.Fragment key={section.title}>
                <h2 className="text-tiny text-foreground-500 mb-1">{section.title}</h2>
                {section.items.map((item: SidebarItem) => {
                  if (item.isHidden) return null;
                  const isSelected = pathname?.includes(item.key);

                  return (
                    <Button
                      key={item.key}
                      isDisabled={item.isDisabled}
                      startContent={
                        <IconSwitch
                          name={item.icon}
                          size={20}
                          className={`w-5 h-5 xl:w-7 xl:h-7 2xl:w-10 2xl:h-10 ${isSelected ? "text-foreground" : ""}`}
                        />
                      }
                      fullWidth
                      size="lg"
                      className={`h-9 xl:h-10 2xl:h-12 text-left px-3 gap-3 justify-start ${isSelected ? "bg-primary/30" : ""}`}
                      variant="light"
                      endContent={item.endContent}
                    >
                      <span className={`text-small 2xl:text-medium font-medium flex-1 text-left ${isSelected ? "text-foreground" : ""}`}>
                        {item.label}
                      </span>
                    </Button>
                  );
                })}
              </React.Fragment>
            ))}
          </section>

          {/* Section 2 */}
          <section className="flex flex-col gap-1 2xl:gap-2">
            {sidebarSections2.map((section) => (
              <React.Fragment key={section.title}>
                <h2 className="text-tiny text-foreground-500 mb-1">{section.title}</h2>
                {section.items.map((item: SidebarItem) => {
                  if (item.isHidden) return null;

                  const isSelected = pathname?.includes(item.key);

                  return (
                    <Button
                      key={item.key}
                      isDisabled={item.isDisabled}
                      startContent={
                        <IconSwitch
                          name={item.icon}
                          size={20}
                          className={`w-5 h-5 xl:w-7 xl:h-7 2xl:w-10 2xl:h-10 ${isSelected ? "text-primary" : ""}`}
                        />
                      }
                      fullWidth
                      size="lg"
                      className={`h-9 xl:h-10 2xl:h-12 text-left px-3 gap-3 justify-start ${isSelected ? "bg-primary/15 dark:bg-default-100/50" : ""}`}
                      variant="light"
                      endContent={item.endContent}
                    >
                      <span className={`text-small 2xl:text-medium font-medium flex-1 text-left ${isSelected ? "text-primary" : ""}`}>
                        {item.label}
                      </span>
                    </Button>
                  );
                })}
              </React.Fragment>
            ))}
          </section>
        </div>
      </ScrollShadow>

      {/* --- C. FOOTER (FIXED) --- */}
      <footer className="mt-auto pt-2 shrink-0">
        <ButtonGroup fullWidth size="md">
          <Tooltip content="Help & Information" showArrow>
            <Button
              startContent={<IconSwitch name="Info" size={22} className="text-default-500" />}
              fullWidth
              className="px-0"
              variant="light"
            />
          </Tooltip>
          <Tooltip content="Settings" showArrow>
            <Button
              startContent={<IconSwitch name="Settings" size={22} className="text-default-500" />}
              fullWidth
              className="px-0"
              variant="light"
            />
          </Tooltip>
          <Tooltip content="Logout" showArrow>
            <Button
              startContent={<IconSwitch name="Logout" size={22} className="text-default-500" />}
              fullWidth
              className="px-0"
              variant="light"
            />
          </Tooltip>
        </ButtonGroup>
      </footer>
    </div>
  );
};

// --- 2. SIDEBAR COLLAPSED (OPTIMIZED) ---
const SidebarCollapsed = () => {
  const pathname = usePathname(); // Get current path

  return (
    <div className="flex flex-col items-center gap-3 2xl:gap-4 flex-1 h-full w-full animate-[fadeIn_0.3s_ease-in-out]">

      {/* Header */}
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="flex justify-center w-12">
          <Image
            {...useSyncImage("/logo.png")}
            alt="logo"
          />
        </div>
      </div>

      <Divider className="bg-divider w-full" />

      {/* --- A. PRIMARY AREA (HEADER + MENU) --- */}
      <ScrollShadow className="flex flex-col gap-2 2xl:gap-4 w-full items-center shrink min-h-0" hideScrollBar>

        {/* Sections */}
        <div className="flex flex-col gap-2 w-full items-center pb-2">
          <section className="flex flex-col gap-1 2xl:gap-2 w-full items-center">
            {sidebarSections.map((section) => (
              <React.Fragment key={section.title}>
                {section.items.map((item: SidebarItem) => {
                  if (item.isHidden) return null;

                  const isSelected = pathname?.includes(item.key);

                  return (
                    <Tooltip key={item.key} content={item.label} placement="right">
                      <Button
                        isIconOnly
                        isDisabled={item.isDisabled}
                        size="md"
                        className={`w-11 h-11 2xl:w-12 2xl:h-12 ${isSelected ? "bg-primary/15" : ""}`}
                        variant="light"
                      >
                        <IconSwitch
                          name={item.icon}
                          size={22}
                          className={`w-6 h-6 2xl:w-7 2xl:h-7 ${isSelected ? "bg-primary/15" : ""}`}
                        />
                      </Button>
                    </Tooltip>
                  );
                })}
              </React.Fragment>
            ))}
          </section>

          <Divider className="bg-divider w-full" />

          {/* Section 2 */}
          <section className="flex flex-col gap-1 2xl:gap-2 w-full items-center">
            {sidebarSections2.map((section) => (
              <React.Fragment key={section.title}>
                {section.items.map((item: SidebarItem) => {
                  if (item.isHidden) return null;

                  const isSelected = pathname?.includes(item.key);

                  return (
                    <Tooltip key={item.key} content={item.label} placement="right">
                      <Button
                        isIconOnly
                        isDisabled={item.isDisabled}
                        size="md"
                        className={`w-11 h-11 2xl:w-12 2xl:h-12 ${isSelected ? "bg-primary/15" : ""}`}
                        variant="light"
                      >
                        <IconSwitch
                          name={item.icon}
                          size={22}
                          className={`w-6 h-6 2xl:w-7 2xl:h-7 ${isSelected ? "text-primary" : ""}`}
                        />
                      </Button>
                    </Tooltip>
                  );
                })}
              </React.Fragment>
            ))}
          </section>
        </div>
      </ScrollShadow>

      {/* --- C. FOOTER (FIXED) --- */}
      <footer className="shrink-0 flex flex-col gap-1 w-full items-center pb-4 pt-2 border-t-small border-divider mt-auto">
        <Tooltip content="Help & Information" placement="right">
          <Button isIconOnly variant="light" size="md" className="w-11 h-11">
            <IconSwitch name="Info" size={22} className="text-default-500 w-6 h-6 2xl:w-7 2xl:h-7" />
          </Button>
        </Tooltip>
        <Tooltip content="Settings" placement="right">
          <Button isIconOnly variant="light" size="md" className="w-11 h-11">
            <IconSwitch name="Settings" size={22} className="text-default-500 w-6 h-6 2xl:w-7 2xl:h-7" />
          </Button>
        </Tooltip>
        <Tooltip content="Logout" placement="right">
          <Button isIconOnly variant="light" size="md" className="w-11 h-11">
            <IconSwitch name="Logout" size={22} className="text-default-500 w-6 h-6 2xl:w-7 2xl:h-7" />
          </Button>
        </Tooltip>
      </footer>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function SideBar({ isCollapsed = false }) {
  const containerClasses = `
    border-r-small border-divider relative flex h-full flex-col 
    transition-[width] duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] 
    ${isCollapsed ? "w-16 2xl:w-20 px-2" : "w-64 2xl:w-72 px-4 2xl:px-6"} 
    py-4 2xl:py-6 overflow-hidden bg-background
  `;

  return (
    <div className={containerClasses}>
      {isCollapsed ? (
        <SidebarCollapsed key="collapsed" />
      ) : (
        <SidebarExpanded key="expanded" />
      )}
    </div>
  );
}