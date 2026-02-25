"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Button,
  Tooltip,
  ScrollShadow,
  Drawer,
  DrawerContent,
  DrawerBody,
  Link,
  cn,
} from "@heroui/react";
import IconSwitch from "../icons/IconSwitch";
import { useSidebarMenu } from "@/hooks/generals/useSidebarMenu";
import { SidebarItem, SidebarSection } from "./SidebarData";

// --- RETRO STYLES ---
const activeItemStyle = "bg-[#e6b689] border-2 border-black text-black shadow-pixel dark:shadow-pixel-dark translate-x-[-2px] translate-y-[-2px]";
const normalItemStyle = "bg-transparent border-2 border-transparent hover:border-black hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white";

// ============================================================================
// SHARED: SIDEBAR MENU CONTENT
// ============================================================================

interface SidebarContentProps {
  onItemClick?: () => void;
  menuGroup1: SidebarSection[];
  menuGroup2: SidebarSection[];
}

const SidebarContent = ({ onItemClick, menuGroup1, menuGroup2 }: SidebarContentProps) => {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-3 2xl:gap-4 flex-1 overflow-hidden h-full w-full">
      <div className="flex flex-col gap-4 pt-1 mx-2">
        <section className="flex items-center gap-3 h-15 w-full">
          <div className="h-10 w-full flex items-center justify-center">
            {/* Logo Text Retro */}
            <h1 className="text-[34px] font-pixelify text-[#e6b689] tracking-widest uppercase drop-shadow-[2px_2px_0_rgba(0,0,0,1)] whitespace-nowrap">
              FPT UNIMATE
            </h1>
          </div>
        </section>
      </div>

      {/* Retro Divider */}
      <div className="w-full px-2">
        <div className="h-1 w-full bg-black dark:bg-zinc-700" />
      </div>

      <ScrollShadow className="flex flex-col gap-4 2xl:gap-6 shrink min-h-0 -mx-2 px-2" hideScrollBar>
        <div className="flex flex-col gap-4 2xl:gap-6 pb-2 pt-2">

          {[menuGroup1, menuGroup2].map((sections, groupIndex) => (
            <div key={groupIndex} className="flex flex-col gap-4">
              {sections.map((section) => {
                const visibleItems = section.items.filter(item => !item.isHidden);
                if (visibleItems.length === 0) return null;

                return (
                  <section key={section.title} className="flex flex-col gap-1 2xl:gap-2 px-2">
                    <h2 className="text-[11px] font-sans font-bold uppercase tracking-wider text-zinc-400 mb-1 px-2 border-b-2 border-transparent pb-1">
                      {section.title}
                    </h2>

                    {visibleItems.map((item: SidebarItem) => {
                      const isSelected = pathname?.includes(item.key);

                      return (
                        <Button
                          key={item.key}
                          isDisabled={item.isDisabled}
                          as={Link}
                          href={item.key.startsWith('/') ? item.key : '/' + item.key}
                          // RETRO STYLING APPLIED HERE
                          radius="none"
                          className={cn(
                            "relative overflow-visible h-10 xl:h-11 text-left px-3 gap-3 justify-start transition-all duration-200",
                            isSelected ? activeItemStyle : normalItemStyle,
                            item.isSubItem ? "ml-8 pr-3 h-8 xl:h-9 text-[11px] border-l-2 !border-l-zinc-300 dark:!border-l-zinc-700 bg-transparent hover:!bg-zinc-200 " + (isSelected ? "!border-l-[#e6b689]" : "") : ""
                          )}
                          fullWidth
                          size="lg"
                          startContent={
                            item.icon ? (
                              <IconSwitch
                                name={item.icon}
                                size={item.iconSize || 20}
                                className={cn(
                                  item.isSubItem ? "w-4 h-4 xl:w-5 xl:h-5 text-zinc-500" : "w-5 h-5 xl:w-6 xl:h-6",
                                  isSelected ? "text-black" : "currentColor"
                                )}
                              />
                            ) : null
                          }
                          endContent={item.endContent}
                          onPress={onItemClick}
                        >
                          <span className={cn(
                            "font-bold flex-1 text-left tracking-tight",
                            item.isSubItem ? "text-[11px]" : "text-sm uppercase font-bold",
                            isSelected ? "text-black" : "currentColor"
                          )}>
                            {item.label}
                          </span>
                        </Button>
                      );
                    })}
                  </section>
                );
              })}
            </div>
          ))}

        </div>
      </ScrollShadow>
    </div>
  );
};

// ============================================================================
// COMPONENT: SIDEBAR COLLAPSED
// ============================================================================

interface SidebarCollapsedProps {
  menuGroup1: SidebarSection[];
  menuGroup2: SidebarSection[];
}

const SidebarCollapsed = ({ menuGroup1, menuGroup2 }: SidebarCollapsedProps) => {
  const pathname = usePathname();

  const hasVisibleItems = (sections: SidebarSection[]) => {
    return sections.some((section) =>
      section.items.some((item) => !item.isHidden)
    );
  };

  const isGroup2Visible = hasVisibleItems(menuGroup2);

  return (
    <div className="flex flex-col items-center gap-3 2xl:gap-4 flex-1 h-full w-full animate-[fadeIn_0.3s_ease-in-out]">
      <div className="flex flex-col items-center gap-4 w-full pt-1">
        <div className="flex justify-center w-10 h-10 items-center">
          {/* Collapsed Logo */}
          <h1 className="text-xl font-pixelify text-[#e6b689] drop-shadow-[1.5px_1.5px_0_rgba(0,0,0,1)] uppercase">
            FPT
          </h1>
        </div>
      </div>

      <div className="w-full px-2">
        <div className="h-1 w-full bg-black dark:bg-zinc-700" />
      </div>

      <ScrollShadow className="flex flex-col gap-2 2xl:gap-4 w-full items-center shrink min-h-0 pt-2" hideScrollBar>
        {[menuGroup1, menuGroup2].map((sections, idx) => (
          <React.Fragment key={idx}>
            {sections.map(section => {
              const visibleItems = section.items.filter(item => !item.isHidden);
              if (visibleItems.length === 0) return null;

              return (
                <section key={section.title} className="flex flex-col gap-2 w-full items-center px-1">
                  {visibleItems.map((item) => {
                    const isSelected = pathname?.includes(item.key);
                    return (
                      <Tooltip
                        key={item.key}
                        content={<span className="font-bold uppercase tracking-tight text-xs">{item.label}</span>}
                        placement="right"
                        classNames={{
                          base: "before:bg-black",
                          content: "bg-black text-white border-2 border-black rounded-none shadow-pixel"
                        }}
                      >
                        <Button
                          as={Link}
                          href={item.key.startsWith('/') ? item.key : '/' + item.key}
                          isIconOnly
                          isDisabled={item.isDisabled}
                          size="md"
                          radius="none" // Square buttons
                          aria-label={item.label}
                          className={cn(
                            "w-10 h-10 transition-all duration-200",
                            isSelected ? activeItemStyle : normalItemStyle
                          )}
                        >
                          {item.icon ? (
                            <IconSwitch
                              name={item.icon}
                              size={22}
                              className={cn(
                                "w-5 h-5",
                                isSelected ? "text-black" : "currentColor"
                              )}
                            />
                          ) : null}
                        </Button>
                      </Tooltip>
                    );
                  })}
                </section>
              );
            })}
            {idx === 0 && isGroup2Visible && (
              <div className="w-1/2 h-1 bg-black/20 dark:bg-white/20 my-1" />
            )}
          </React.Fragment>
        ))}
      </ScrollShadow>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT: SIDEBAR
// ============================================================================

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onMobileChange: (open: boolean) => void;
}

export default function SideBar({ isCollapsed, isMobileOpen, onMobileChange }: SidebarProps) {

  const { menuGroup1, menuGroup2 } = useSidebarMenu();

  const desktopClasses = `
    hidden md:flex 
    border-4 border-l-0 border-black relative h-full flex-col
    transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] 
    ${isCollapsed ? "w-20 px-0" : "w-72 px-0 shadow-pixel"} 
    py-4 overflow-hidden bg-white dark:bg-zinc-900 shrink-0
    z-10
  `;

  return (
    <>
      {/* --- A. MOBILE DRAWER --- */}
      <Drawer
        isOpen={isMobileOpen}
        onOpenChange={onMobileChange}
        placement="left"
        size="xs"
        classNames={{
          base: "bg-white dark:bg-zinc-900 border-r-4 border-black rounded-none shadow-pixel z-50", // Retro Drawer
          body: "p-4",
          closeButton: "hover:bg-red-500 hover:text-white rounded-none border border-transparent hover:border-black transition-colors"
        }}
        backdrop="blur"
      >
        <DrawerContent>
          {(onClose) => (
            <DrawerBody>
              <SidebarContent
                onItemClick={onClose}
                menuGroup1={menuGroup1}
                menuGroup2={menuGroup2}
              />
            </DrawerBody>
          )}
        </DrawerContent>
      </Drawer>

      {/* --- B. DESKTOP SIDEBAR --- */}
      <aside className={desktopClasses}>
        {isCollapsed ? (
          <SidebarCollapsed
            menuGroup1={menuGroup1}
            menuGroup2={menuGroup2}
          />
        ) : (
          <div className="animate-[fadeIn_0.3s_ease-in-out] h-full">
            <SidebarContent
              menuGroup1={menuGroup1}
              menuGroup2={menuGroup2}
            />
          </div>
        )}
      </aside>
    </>
  );
}